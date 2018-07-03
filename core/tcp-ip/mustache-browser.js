'use strict';

const fs = require('fs');

const htmlObj = require('../lib/html');
const utils = require('../lib/utils');

const conf = global.conf;

module.exports = class {

  /**
   * Message indicating inability to match a partial to a Mustache file.
   *
   * @param {object} res - response object.
   * @param {string} err - error.
   */
  noResult(res, err) {
    let output = '';
    output += htmlObj.head;

    if (typeof err === 'string') {
      output += err;
    }
    else {
      output += 'There is no Mustache template there by that name. Perhaps you need to use <a href="http://patternlab.io/docs/pattern-including.html" target="_blank">the more verbosely pathed syntax.</a>';
    }

    output += htmlObj.foot;
    output = output.replace('{{ title }}', 'Fepper Mustache Browser');
    output = output.replace('{{ title }}', 'Fepper Mustache Browser');
    output = output.replace('{{ title }}', 'Fepper Mustache Browser');

    res.send(output);
  }

  /**
   * Strip Mustache tag to only the partial path.
   *
   * @param {string} partialParam - Mustache syntax.
   * @return {string} Partial path.
   */
  partialTagToPath(partialParam) {
    // Strip opening Mustache braces and control character.
    let partial = partialParam.replace(/^\{\{>\s*/, '');
    // Strip parentheses-wrapped parameter submission.
    partial = partial.replace(/\([\S\s]*?\)/, '');
    // Strip colon/pipe-delimited style modifier.
    partial = partial.replace(/\:[\w\-\|]+/, '');
    // Strip closing Mustache braces.
    partial = partial.replace(/\s*\}\}$/, '');

    if (partial.indexOf('.mustache') !== partial.length - 9) {
      partial = partial + '.mustache';
    }

    return partial;
  }

  /**
   * Recursively strip token span tags output by the Pattern Lab code viewer.
   *
   * @param {string} codeParam - HTML/Mustache.
   * @return {string} Stripped code.
   */
  spanTokensStrip(codeParam) {
    let code = codeParam.replace(/<span class="token [\S\s]*?>([\S\s]*?)<\/span>/g, '$1');

    if (/<span class="token [\S\s]*?>([\S\s]*?)<\/span>/.test(code)) {
      code = this.spanTokensStrip(code);
    }

    return code;
  }

  /**
   * Make angle brackets, indentation, and newlines viewable as HTML and hotlink partials.
   *
   * @param {string} data - HTML/Mustache.
   * @return {string} Viewable and linkable code.
   */
  toHtmlEntitiesAndLinks(data) {
    let entitiesAndLinks = data.replace(/"/g, '&quot;');
    entitiesAndLinks = entitiesAndLinks.replace(/</g, '&lt;');
    entitiesAndLinks = entitiesAndLinks.replace(/>/g, '&gt;');
    entitiesAndLinks = entitiesAndLinks.replace(/\{\{&gt;[\S\s]*?\}\}/g, '<a href="?partial=$&">$&</a>');
    // Render indentation whitespace as HTML entities.
    entitiesAndLinks = entitiesAndLinks.replace(/^ /gm, '&nbsp;');
    entitiesAndLinks = entitiesAndLinks.replace(/^\t/gm, '&nbsp;&nbsp;&nbsp;&nbsp;');

    while (/^(&nbsp;)+ /m.test(entitiesAndLinks) || /^(&nbsp;)+\t/m.test(entitiesAndLinks)) {
      entitiesAndLinks = entitiesAndLinks.replace(/^((?:&nbsp;)+) /gm, '$1&nbsp;');
      entitiesAndLinks = entitiesAndLinks.replace(/^((?:&nbsp;)+)\t/gm, '$1&nbsp;&nbsp;&nbsp;&nbsp;');
    }

    entitiesAndLinks = entitiesAndLinks.replace(/\n/g, '<br>');

    return entitiesAndLinks;
  }

  main() {
    return function (req, res) {
      if (typeof req.query.code === 'string') {
        try {
          let code = req.query.code;
          // Strip Pattern Lab's token span tags.
          code = this.spanTokensStrip(code);
          // HTML entities and links.
          code = this.toHtmlEntitiesAndLinks(code);

          if (typeof req.query.title === 'string') {
            code = `<h2>${req.query.title}</h2>\n${code}`;
          }

          // Render the output with HTML head and foot.
          let output = htmlObj.head;
          output += code;
          output += htmlObj.foot;
          output = output.replace('{{ title }}', 'Fepper Mustache Browser');
          output = output.replace('{{ main_class }}', 'mustache-browser');
          output = output.replace('{{ main_id }}', 'mustache-browser');

          res.send(output);
        }
        catch (err) {
          this.noResult(res, err);
        }
      }
      else if (typeof req.query.partial === 'string') {
        try {
          // Requires verbosely pathed Mustache partial syntax.
          let partial = this.partialTagToPath(req.query.partial.trim());
          let fullPath = utils.pathResolve(`${conf.ui.paths.source.patterns}/${partial}`);
          // Check if query string correlates to actual Mustache file.
          let stat = fs.statSync(fullPath);

          if (stat.isFile()) {
            fs.readFile(fullPath, conf.enc, function (err, data) {
              // Render the Mustache code if it does.
              // First, link the Mustache tags.
              let entitiesAndLinks = this.toHtmlEntitiesAndLinks(data);
              // Render the output with HTML head and foot.
              let output = htmlObj.head;
              output += `<h2>${partial}</h2>`;
              output += entitiesAndLinks;
              output += htmlObj.foot;
              output = output.replace('{{ title }}', 'Fepper Mustache Browser');
              output = output.replace('{{ main_id }}', 'mustache-browser');
              output = output.replace('{{ main_class }}', 'mustache-browser');

              res.send(output);
            }.bind(this));
          }
          else {
            this.noResult(res);
          }
        }
        catch (err) {
          this.noResult(res);
        }
      }
    }.bind(this);
  }
};
