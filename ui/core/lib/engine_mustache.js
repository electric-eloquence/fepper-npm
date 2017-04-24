/*
 * mustache pattern engine for patternlab-node - v2.X.X - 2016
 *
 * Geoffrey Pursell, Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

/*
 * ENGINE SUPPORT LEVEL:
 *
 * Full + extensions. Partial calls and lineage hunting are supported. Style
 * modifiers and pattern parameters are used to extend the core feature set of
 * Mustache templates.
 *
 */

'use strict';

var Hogan = require('hogan.js');
var jsonEval = require('json-eval');
var utilMustache = require('./util_mustache');

var engine_mustache = {
  engine: Hogan,
  engineName: 'hogan',
  engineFileExtension: '.mustache',

  // partial expansion is only necessary for Mustache templates that have
  // style modifiers or pattern parameters (I think)
  expandPartials: true,

  // regexes, stored here so they're only compiled once
  findPartialsRE: utilMustache.partialsRE,
  findPartialsWithStyleModifiersRE: utilMustache.partialsWithStyleModifiersRE,
  findPartialWithStyleModifiersRE: utilMustache.partialWithStyleModifiersRE,
  findPartialsWithPatternParametersRE: utilMustache.partialsWithPatternParametersRE,
  findPartialKeyRE: utilMustache.partialKeyRE,
  findListItemsRE: utilMustache.listItemsRE,

  escapeReservedRegexChars: function (regexStr) {
    return regexStr.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
  },

  // render it
  renderPattern: function renderPattern(pattern, data, partials) {
    var toRender;

    if (typeof pattern === 'string') {
      toRender = pattern;
    } else if (typeof pattern.extendedTemplate === 'string') {
      toRender = pattern.extendedTemplate;
    } else {
      console.log('e = renderPattern() requires a string or a pattern object as its first argument!');
    }

    try {
      var compiled = Hogan.compile(toRender);

      if (partials) {
        return compiled.render(data, partials);
      }
      return compiled.render(data);
    } catch (e) {
      console.log('e = ', e.message || e);
    }
    return undefined;
  },

  /**
   * Find regex matches within both pattern strings and pattern objects.
   *
   * @param {string|object} pattern Either a string or a pattern object.
   * @param {object} regex A JavaScript RegExp object.
   * @returns {array|null} An array if a match is found, null if not.
   */
  patternMatcher: function patternMatcher(pattern, regex) {
    var matches;
    if (typeof pattern === 'string') {
      matches = pattern.match(regex);
    } else if (typeof pattern === 'object' && typeof pattern.extendedTemplate === 'string') {
      matches = pattern.extendedTemplate.match(regex);
    }
    return matches;
  },

  // find and return any {{> template-name }} within pattern
  findPartials: function findPartials(pattern) {
    var matches = this.patternMatcher(pattern, this.findPartialsRE);
    return matches;
  },

  findPartialsWithStyleModifiers: function (pattern) {
    var matches = this.patternMatcher(pattern, this.findPartialsWithStyleModifiersRE);
    return matches;
  },

  // returns any patterns that match {{> value(foo:"bar") }} or {{>
  // value:mod(foo:"bar") }} within the pattern
  findPartialsWithPatternParameters: function (pattern) {
    var matches = this.patternMatcher(pattern, this.findPartialsWithPatternParametersRE);
    return matches;
  },

  // given a pattern, and a partial string, tease out the "pattern key" and
  // return it.
  findPartialKey: function (partialString) {
    var partialKeyArr = partialString.match(this.findPartialKeyRE);
    var partialKey = '';
    if (partialKeyArr && partialKeyArr[1]) {
      partialKey += partialKeyArr[1];
      if (partialKeyArr[2]) {
        partialKey += partialKeyArr[2];
      }
      if (partialKeyArr[3]) {
        partialKey += partialKeyArr[3];
      }
    }
    return partialKey;
  },

  // GTP: the old implementation works better. We might not need
  // this.findPartialRE anymore if it works in all cases!
  findPartial: function (partialString) {
    // strip out the template cruft
    var foundPatternPartial = partialString.replace('{{> ', '').replace(' }}', '').replace('{{>', '').replace('}}', '');

    // remove any potential pattern parameters.
    // this and the above are rather brutish but I didn't want to do a regex at the time
    if (foundPatternPartial.indexOf('(') > 0) {
      foundPatternPartial = foundPatternPartial.substring(0, foundPatternPartial.indexOf('('));
    }

    // remove any potential stylemodifiers.
    foundPatternPartial = foundPatternPartial.split(':')[0];

    return foundPatternPartial;
  },

  findListItems: function (pattern) {
    var matches = this.patternMatcher(pattern, this.findListItemsRE);
    return matches;
  },

  registerPartial: function (key, pattern, patternlab, getPartial) {
    var keyParts;
    var paramString;
    var params;
    var partialObj;
    var partialStr;
    var patternPartial;
    var styleModifiers;

    if (patternlab.partials[key]) {
      return;
    }

    // copy the partialObj from its corresponding pattern object
    keyParts = key.match(utilMustache.partialKeyRE);
    partialStr = keyParts[1].trim();
    patternPartial = getPartial(partialStr, patternlab);
    partialObj = JSON.parse(patternPartial.partialInterface);
    partialObj.key = key;
    partialObj.partial = partialStr;

    // identify and save styleModifiers submitted with this partial
    if (keyParts[2]) {
      styleModifiers = keyParts[2].slice(1).replace(/\|/g, ' ');

      // render styleModifiers
      partialObj.content = partialObj.content.replace(/\{\{\s*styleModifier\s*\}\}/g, styleModifiers || '');
    }

    // identify and save params submitted with this partial
    if (keyParts[3]) {
      paramString = '{' + keyParts[3].slice(1, -1) + '}';
      try {
        params = jsonEval(paramString);
        partialObj.params = params;
        partialObj.content = this.renderParams(partialObj.content, params);
      } catch (err) {
        console.error(err.message || err);
      }
    }

    // stringify and save to patternlab object
    patternlab.partials[key] = JSON.stringify(partialObj);
  },

  renderParams: function (content, params) {
    var i;
    var escapedKey;
    var contentNew = content;
    var regex;

    if (params && Object.keys(params).length) {
      contentNew = '{{=\u0002 \u0003=}}' + contentNew;

      for (i in params) {
        if (params.hasOwnProperty(i)) {
          escapedKey = this.escapeReservedRegexChars(i);

          // apply replacement based on allowable characters from lines 78 and 79 of mustache.js
          // of the Mustache for JS project.
          regex = new RegExp('\\{\\{([\\{#\\^\\/&]?\\s*' + escapedKey + '\\s*)\\}?\\}\\}', 'g');

          contentNew = contentNew.replace(regex, '\u0002$1\u0003');
        }
      }

      // render this pattern immediately, so as to delete blocks not keyed to allData
      contentNew = this.renderPattern(contentNew, params);
    }

    return contentNew;
  }
};

module.exports = engine_mustache;
