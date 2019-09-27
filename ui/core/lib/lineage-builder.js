'use strict';

module.exports = class {
  constructor(patternlab) {
    this.patternlab = patternlab;
    this.utils = patternlab.utils;
  }

  // PRIVATE METHODS

  matchPattern(partial) {
    // First, perform a check for partials with parameters.
    // We need to make sure partial !== matchCandidate so we only submit the non-param partial.
    for (let matchCandidate of Object.keys(this.patternlab.partials)) {
      if (partial !== matchCandidate && partial.indexOf(matchCandidate) === 0) {
        return matchCandidate;
      }
    }

    // Then, look for exact matches.
    for (let matchCandidate of Object.keys(this.patternlab.partials)) {
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

      if (parseObj.tag && parseObj.tag === '>') {
        partialsArr.push(parseObj.n);
      }

      else if (parseObj.nodes) {
        partialsArr = this.partialTagScan(parseObj.nodes, partialsArr);
      }
    }

    return partialsArr;
  }

  // PUBLIC METHOD

  main(pattern) {
    if (!pattern.fepletParse) {
      return;
    }

    // Find the {{> template-name }} within patterns.
    const partialsArr = this.partialTagScan(pattern.fepletParse, []);

    for (let i = 0, l = partialsArr.length; i < l; i++) {
      const descendentPatternName = this.matchPattern(partialsArr[i]);

      // Skip if no descendentPatternName.
      /* istanbul ignore if */
      if (!descendentPatternName) {
        continue;
      }

      const descendentPattern = this.patternlab.getPattern(descendentPatternName);

      // Skip if no descendentPattern.
      /* istanbul ignore if */
      if (!descendentPattern) {
        this.utils.error('`' + pattern.relPath + '` is missing pattern `' + descendentPatternName + '`');

        continue;
      }

      // Skip if descendentPattern has already been indexed.
      if (pattern.lineageIndex.indexOf(descendentPattern.patternPartial) > -1) {
        continue;
      }

      // Add to lineageIndex.
      pattern.lineageIndex.push(descendentPattern.patternPartial);

      // Create the more complex lineage object.
      const l = {
        lineagePattern: descendentPattern.patternPartial,
        lineagePath: this.patternlab.config.pathsPublic.patterns + '/' + descendentPattern.patternLink,
        isHidden: descendentPattern.isHidden
      };

      if (descendentPattern.patternState) {
        l.lineageState = descendentPattern.patternState;
      }

      pattern.lineage.push(l);

      // Only add to lineageRIndex if it hadn't been indexed before.
      /* istanbul ignore if */
      if (descendentPattern.lineageRIndex.indexOf(pattern.patternPartial) > -1) {
        continue;
      }

      descendentPattern.lineageRIndex.push(pattern.patternPartial);

      // Create the more complex lineage object in reverse.
      const lr = {
        lineagePattern: pattern.patternPartial,
        lineagePath: this.patternlab.config.pathsPublic.patterns + '/' + pattern.patternLink,
        isHidden: pattern.isHidden
      };

      if (pattern.patternState) {
        lr.lineageState = pattern.patternState;
      }

      descendentPattern.lineageR.push(lr);
    }
  }
};
