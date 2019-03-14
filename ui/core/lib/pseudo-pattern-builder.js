'use strict';

const fs = require('fs-extra');

module.exports = class {
  constructor(patternlab) {
    this.patternlab = patternlab;
    this.utils = patternlab.utils;
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
        this.utils.log('Found pseudo-pattern ' + pseudoPattern.patternPartial + ' - variant of ' +
          pattern.patternPartial);
      }

      // Fill out the properties of this pseudoPattern.
      pseudoPattern.allData =
        this.utils.extendButNotOverride(JSON.parse(JSON.stringify(pseudoPattern.jsonFileData)), pattern.allData);
      pseudoPattern.fepletParse = pattern.fepletParse;
      pseudoPattern.fepletComp = pattern.fepletComp;
      pseudoPattern.isPseudoPattern = true;
      pseudoPattern.pseudoPatternPartial = pattern.patternPartial;
      pseudoPattern.template = pattern.template;
    }
  }
};
