// DEPRECATION NOTICE.
// THE FOLLOWING PROPERTIES ARE DEPRECATED.
// .lineageArray
// .lineageExists
// .lineageIndex
// .lineageRArray
// .lineageRExists
// .lineageRIndex

'use strict';

let t;

module.exports = class {
  constructor(patternlab) {
    this.config = patternlab.config;
    this.getPattern = patternlab.getPattern;
    this.ingredients = patternlab.ingredients;
    this.utils = patternlab.utils;

    t = this.utils.t;
  }

  /* PRIVATE METHODS */

  matchPattern(partial) {
    // First, perform a check for partials with parameters.
    // We need to make sure partial !== matchCandidate so we only submit the non-param partial.
    // Disabling guard-for-in because we have complete control over construction of this.ingredients.partials.
    for (let matchCandidate in this.ingredients.partials) { // eslint-disable-line guard-for-in
      if (partial !== matchCandidate && partial.indexOf(matchCandidate) === 0) {
        return matchCandidate;
      }
    }

    // Then, look for exact matches.
    // Disabling guard-for-in because we have complete control over construction of this.ingredients.partials.
    for (let matchCandidate in this.ingredients.partials) { // eslint-disable-line guard-for-in
      if (partial === matchCandidate) {
        return matchCandidate;
      }
    }

    // istanbul ignore next */
    return null;
  }

  partialTagScan(parseArr, partialsArr_) {
    let partialsArr = partialsArr_;

    for (let i = 0, l = parseArr.length; i < l; i++) {
      const parseObj = parseArr[i];

      if (parseObj.tag === '>') {
        partialsArr.push(parseObj.n);
      }

      else if (parseObj.nodes) {
        partialsArr = this.partialTagScan(parseObj.nodes, partialsArr);
      }
    }

    return partialsArr;
  }

  /* PUBLIC METHOD */

  main(pattern) {
    if (!pattern.fepletParse) {
      return;
    }

    // Find the {{> template-name }} within patterns.
    const partialsArr = this.partialTagScan(pattern.fepletParse, []);
    pattern.lineage = partialsArr.length ? {} : null;

    for (let i = 0, l = partialsArr.length; i < l; i++) {
      const descendentPatternName = this.matchPattern(partialsArr[i]);
      const lineageKeys = pattern.lineage ? Object.keys(pattern.lineage) : [];
      const lineageRKeys = pattern.lineageR ? Object.keys(pattern.lineageR) : [];

      // Skip if no descendentPatternName.
      /* istanbul ignore if */
      if (!descendentPatternName) {
        continue;
      }

      const descendentPattern = this.getPattern(descendentPatternName);

      // Skip if no descendentPattern.
      /* istanbul ignore if */
      if (!descendentPattern) {
        this.utils.error(`${t('%s is missing partial %s')}` + '\u0007', pattern.relPath, descendentPatternName);

        continue;
      }

      // Skip if descendentPattern has already been indexed.
      if (lineageKeys.includes(descendentPattern.patternPartial)) {
        continue;
      }

      // Add to lineageIndex.
      pattern.lineageIndex.push(descendentPattern.patternPartial); // DEPRECATED.

      // Create the more complex lineage object.
      const l = {
        lineagePattern: descendentPattern.patternPartial,
        lineagePath: this.config.pathsPublic.patterns + '/' + descendentPattern.patternLink,
        isHidden: descendentPattern.isHidden
      };

      if (descendentPattern.patternState) {
        l.lineageState = descendentPattern.patternState;
      }

      pattern.lineageArray.push(l); // DEPRECATED.
      pattern.lineage[descendentPattern.patternPartial] = l;

      // Only add to lineageRIndex if it hadn't been indexed before.
      /* istanbul ignore if */
      if (lineageRKeys.includes(pattern.patternPartial)) {
        continue;
      }

      descendentPattern.lineageRIndex.push(pattern.patternPartial); // DEPRECATED.

      // Create the more complex lineage object in reverse.
      const lr = {
        lineagePattern: pattern.patternPartial,
        lineagePath: this.config.pathsPublic.patterns + '/' + pattern.patternLink,
        isHidden: pattern.isHidden
      };

      if (pattern.patternState) {
        lr.lineageState = pattern.patternState;
      }

      if (descendentPattern.lineageR === null) {
        descendentPattern.lineageR = {};
      }

      descendentPattern.lineageR[pattern.patternPartial] = lr;
      descendentPattern.lineageRArray.push(lr); // DEPRECATED.
    }
  }
};
