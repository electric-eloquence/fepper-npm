'use strict';

const fs = require('fs-extra');
const JSON5 = require('json5');

module.exports = class {
  constructor(patternlab) {
    this.patternlab = patternlab;
  }

  main(pattern) {
    // Look for a pseudoPattern by checking if there is a file containing same name, with ~ in it, ending in .json.
    // If found, fill out that pattern.
    for (let i = 0, l = this.patternlab.patterns.length; i < l; i++) {
      const pseudoPattern = this.patternlab.patterns[i];
      const fileName = pattern.fileName[0] === '_' ? pattern.fileName.slice(1) : pattern.fileName;

      if (
        !pseudoPattern.relPath ||
        pseudoPattern.relPath.indexOf(pattern.subdir + '/' + fileName + '~') !== 0 ||
        pseudoPattern.relPath.slice(-5) !== '.json'
      ) {
        continue;
      }

      if (this.patternlab.config.debug) {
        this.patternlab.utils.log('Found pseudo-pattern ' + pseudoPattern.patternPartial + ' - variant of ' +
          pattern.patternPartial);
      }

      // We want to do everything we normally would here, except instead read the pseudoPattern data.
      const variantFileName = `${this.patternlab.config.paths.source.patterns}/${pseudoPattern.relPath}`;

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
        this.patternlab.utils.error('There was an error parsing pseudoPattern JSON for ' + pattern.relPath);
        this.patternlab.utils.error(err);
      }

      // Extend any existing data with variant data.
      this.patternlab.utils.extendButNotOverride(variantAllData, pattern.allData);

      // Fill out the properties of this pseudoPattern.
      pseudoPattern.jsonFileData = variantLocalData;
      pseudoPattern.template = pattern.template;
      pseudoPattern.fepletParse = pattern.fepletParse;
      pseudoPattern.fepletComp = pattern.fepletComp;
      pseudoPattern.isPseudoPattern = true;
      pseudoPattern.allData = variantAllData;
    }
  }
};
