/*
 * mustache utilities for patternlab-node - v2.X.X - 2016
 *
 * Geoffrey Pursell, Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

'use strict';

// the term "alphanumeric" includes underscores.

// look for an opening mustache include tag, followed by >=0 whitespaces
var partialsStr = '{{>\\s*';

// one or more characters comprising any combination of alphanumerics,
// hyphens, periods, slashses, and tildes
partialsStr += '([\\w\\-\\.\\/~]+)';

// an optional group comprising a colon followed by one or more characters
// comprising any combination of alphanumerics, hyphens, and pipes
partialsStr += '(\\:[\\w\\-\\|]+)?';

// an optional group of characters starting with >=0 whitespaces, followed by an
// opening parenthesis, followed by a lazy match of non-whitespace or whitespace
// characters (to include newlines), followed by a closing parenthesis
partialsStr += '(\\s*\\([\\S\\s]*?\\))?';

// look for >=0 whitespaces, followed by closing mustache tag
partialsStr += '\\s*}}';
var partialsRE = new RegExp(partialsStr, 'g');
var partialKeyRE = new RegExp(partialsStr);

// look for an opening mustache include tag, followed by >=0 whitespaces
var partialsWithStyleModifiersStr = '{{>\\s*';

// one or more characters comprising any combination of alphanumerics,
// hyphens, periods, slashses, and tildes
partialsWithStyleModifiersStr += '([\\w\\-\\.\\/~]+)';

// the previous group cannot be followed by an opening parenthesis
partialsWithStyleModifiersStr += '(?!\\()';

// a colon followed by one or more characters comprising any combination
// of alphanumerics, hyphens, and pipes
partialsWithStyleModifiersStr += '(\\:[\\w\\-\\|]+)';

// an optional group of characters starting with >=0 whitespaces, followed by an
// opening parenthesis, followed by a lazy match of non-whitespace or whitespace
// characters (to include newlines), followed by a closing parenthesis
partialsWithStyleModifiersStr += '(\\s*\\([\\S\\s]*?\\))?';

// look for >=0 whitespaces, followed by closing mustache tag
partialsWithStyleModifiersStr += '\\s*}}';
var partialWithStyleModifiersRE = new RegExp(partialsWithStyleModifiersStr);
var partialsWithStyleModifiersRE = new RegExp(partialsWithStyleModifiersStr, 'g');

// look for an opening mustache include tag, followed by >=0 whitespaces
var partialsWithPatternParametersStr = '{{>\\s*';

// one or more characters comprising any combination of alphanumerics,
// hyphens, periods, slashses, and tildes
partialsWithPatternParametersStr += '([\\w\\-\\.\\/~]+)';

// an optional group comprising a colon followed by one or more characters
// comprising any combination of alphanumerics, hyphens, and pipes
partialsWithPatternParametersStr += '(\\:[\\w\\-\\|]+)?';

// a group of characters starting with >=0 whitespaces, followed by an
// opening parenthesis, followed by a lazy match of non-whitespace or whitespace
// characters (to include newlines), followed by a closing parenthesis
partialsWithPatternParametersStr += '(\\s*\\([\\S\\s)]*?\\))';

// look for >=0 whitespaces, followed by closing mustache tag
partialsWithPatternParametersStr += '\\s*}}';
var partialsWithPatternParametersRE = new RegExp(partialsWithPatternParametersStr, 'g');

// look for an opening mustache loop tag, followed by >=0 whitespaces
var listItemsStr = '{{#\\s*';

// look for the string 'listItems.' or 'listitems.'
listItemsStr += '(list(I|i)tems\\.)';

// look for a number 1 - 20, spelled out
listItemsStr += '(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|';
listItemsStr += 'seventeen|eighteen|nineteen|twenty)';

// look for >=0 whitespaces, followed by closing mustache tag
listItemsStr += '\\s*}}';
var listItemsRE = new RegExp(listItemsStr, 'g');

var utilMustache = {
  partialsRE: partialsRE,
  partialWithStyleModifiersRE: partialWithStyleModifiersRE,
  partialsWithStyleModifiersRE: partialsWithStyleModifiersRE,
  partialsWithPatternParametersRE: partialsWithPatternParametersRE,
  partialKeyRE: partialKeyRE,
  listItemsRE: listItemsRE
};

module.exports = utilMustache;
