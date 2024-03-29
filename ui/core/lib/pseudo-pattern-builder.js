'use strict';

let t;

module.exports = class {
  constructor(patternlab) {
    this.config = patternlab.config;
    this.ingredients = patternlab.ingredients;
    this.utils = patternlab.utils;

    t = this.utils.t;
  }

  main(pattern) {
    // Look for a pseudoPattern by checking if there is a file containing same name, with ~ in it, ending in .json.
    // If found, fill out that pattern.
    for (let i = 0, l = this.ingredients.patterns.length; i < l; i++) {
      const pseudoPattern = this.ingredients.patterns[i];
      const fileName = pattern.fileName[0] === '_' ? pattern.fileName.slice(1) : pattern.fileName;

      if (
        !pseudoPattern.relPath ||
        pseudoPattern.relPath.indexOf(pattern.subdir + '/' + fileName + '~') !== 0 ||
        pseudoPattern.relPath.slice(-5) !== '.json'
      ) {
        continue;
      }

      if (this.config.debug) {
        this.utils.log(
          // eslint-disable-next-line quotes
          `${t("Found pseudo-pattern %s - variant of %s")}`,
          pseudoPattern.patternPartial,
          pattern.patternPartial
        );
      }

      // Fill out the properties of this pseudoPattern.
      pseudoPattern.allData = this.utils.extendButNotOverride({}, pseudoPattern.jsonFileData, pattern.allData);
      pseudoPattern.fepletParse = pattern.fepletParse;
      pseudoPattern.fepletComp = pattern.fepletComp;
      pseudoPattern.jsonFileData = this.utils.extendButNotOverride(pseudoPattern.jsonFileData, pattern.jsonFileData);
      pseudoPattern.isPseudoPattern = true;
      pseudoPattern.pseudoPatternPartial = pattern.patternPartial;
      pseudoPattern.template = pattern.template;
    }
  }
};
