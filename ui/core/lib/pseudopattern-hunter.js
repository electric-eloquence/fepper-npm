'use strict';

const fs = require('fs-extra');
const JSON5 = require('json5');

module.exports = class {
  constructor(patternlab) {
    this.patternlab = patternlab;
  }

  main(pattern) {
    // Look for a pseudopattern by checking if there is a file containing same name, with ~ in it, ending in .json.
    // If found, fill out that pattern.
    for (let i = 0, l = this.patternlab.patterns.length; i < l; i++) {
      const patternVariant = this.patternlab.patterns[i];
      const fileName = pattern.fileName[0] === '_' ? pattern.fileName.slice(1) : pattern.fileName;

      if (
        patternVariant.relPath.indexOf(pattern.subdir + '/' + fileName + '~') !== 0 ||
        patternVariant.relPath.slice(-5) !== '.json'
      ) {
        continue;
      }

      if (this.patternlab.config.debug) {
        this.patternlab.utils.log('Found pseudopattern variant of ' + pattern.patternPartial);
      }

      // We want to do everything we normally would here, except instead read the pseudopattern data.
      const variantFileName = `${this.patternlab.config.paths.source.patterns}/${patternVariant.relPath}`;

      let variantFileStr = '';
      let variantLocalData = {};
      let variantAllData = {};

      try {
        variantFileStr = fs.readFileSync(variantFileName, this.patternlab.enc);
        variantLocalData = JSON5.parse(variantFileStr);

        // Clone. Do not reference.
        variantAllData = JSON5.parse(variantFileStr);
      }
      catch (err) {
        this.patternlab.utils.error('There was an error parsing pseudopattern JSON for ' + pattern.relPath);
        this.patternlab.utils.error(err.message || err);
      }

      // Extend any existing data with variant data.
      this.patternlab.utils.extendButNotOverride(variantAllData, pattern.allData);

      // Fill out the properties of this pseudopattern.
      patternVariant.jsonFileData = variantLocalData;
      patternVariant.template = pattern.template;
      patternVariant.fepletParse = pattern.fepletParse;
      patternVariant.fepletComp = pattern.fepletComp;
      patternVariant.isPseudopattern = true;
      patternVariant.allData = variantAllData;
    }
  }
};
