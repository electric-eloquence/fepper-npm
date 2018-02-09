'use strict';

const fs = require('fs-extra');
const patternAssembler = require('./pattern-assembler');
const plutils = require('./utilities');
const path = require('path');
const JSON5 = require('json5');

module.exports = function (pattern, patternlab) {
  const patternVariants = [];

  // Look for a pseudopattern by checking if there is a file containing same name, with ~ in it, ending in .json.
  // If found, fill out that pattern.
  for (let i = 0, l = patternlab.patterns.length; i < l; i++) {
    const patternVariant = patternlab.patterns[i];
    const fileName = pattern.fileName[0] === '_' ? pattern.fileName.slice(1) : pattern.fileName;

    if (
      patternVariant.relPath.indexOf(pattern.subdir + '/' + fileName + '~') === 0 &&
      patternVariant.relPath.slice(-5) === '.json'
    ) {
      if (patternlab.config.debug) {
        console.log('Found pseudoPattern variant of ' + pattern.patternPartial);
      }

      // We want to do everything we normally would here, except instead read the pseudopattern data.
      const variantFilename = path.resolve(patternlab.config.paths.source.patterns, patternVariant.relPath);

      let variantFileStr = '';
      let variantLocalData = {};
      let variantAllData = {};

      try {
        variantFileStr = fs.readFileSync(variantFilename, patternlab.enc);
        variantLocalData = JSON5.parse(variantFileStr);

        // Clone. Do not reference.
        variantAllData = JSON5.parse(variantFileStr);
      } catch (err) {
        console.log('There was an error parsing pseudopattern JSON for ' + pattern.relPath);
        console.log(err.message || err);
      }

      // Extend any existing data with variant data.
      plutils.extendButNotOverride(variantAllData, pattern.allData);

      // Fill out the properties of this pseudopattern.
      patternVariant.jsonFileData = variantLocalData;
      patternVariant.template = pattern.template;
      patternVariant.fileExtension = pattern.fileExtension;
      patternVariant.fepletParse = pattern.fepletParse;
      patternVariant.fepletComp = pattern.fepletComp;
      patternVariant.isPseudoPattern = true;
      patternVariant.allData = variantAllData;
      patternVariant.engine = pattern.engine;

      patternVariants.push(patternVariant);
    }
  }

  return patternVariants;
};
