'use strict';

module.exports = class {
  constructor(patternlab) {
    this.patternlab = patternlab;
  }

  // PRIVATE METHODS

  matchPattern(partial) {
    // First, perform a check for partials with parameters.
    // We need to make sure partial !== matchCandidate so we only submit the non-param partial.
    for (let i in this.patternlab.partials) {
      if (!this.patternlab.partials.hasOwnProperty(i)) {
        continue;
      }

      const matchCandidate = i;

      if (partial !== matchCandidate && partial.indexOf(matchCandidate) === 0) {
        return matchCandidate;
      }
    }

    // Then, look for exact matches.
    for (let i in this.patternlab.partials) {
      if (!this.patternlab.partials.hasOwnProperty(i)) {
        continue;
      }

      const matchCandidate = i;

      if (partial === matchCandidate) {
        return matchCandidate;
      }
    }

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
      const ancestorPatternName = this.matchPattern(partialsArr[i]);

      // Skip if no ancestorPatternName.
      if (!ancestorPatternName) {
        continue;
      }

      const ancestorPattern = this.patternlab.getPattern(ancestorPatternName);

      // Skip if no ancestorPattern.
      if (!ancestorPattern) {
        this.patternlab.utils.error('`' + pattern.relPath + '` is missing pattern `' + ancestorPatternName + '`');

        continue;
      }

      // Skip if ancestorPattern has already been indexed.
      if (pattern.lineageIndex.indexOf(ancestorPattern.patternPartial) > -1) {
        continue;
      }

      // Add to lineageIndex.
      pattern.lineageIndex.push(ancestorPattern.patternPartial);

      // Create the more complex lineage object.
      const l = {
        lineagePattern: ancestorPattern.patternPartial,
        lineagePath: this.patternlab.config.pathsPublic.patterns + '/' + ancestorPattern.patternLink,
        isHidden: ancestorPattern.isHidden
      };

      if (ancestorPattern.patternState) {
        l.lineageState = ancestorPattern.patternState;
      }

      pattern.lineage.push(l);

      // Only add to lineageRIndex if it hadn't been indexed before.
      if (ancestorPattern.lineageRIndex.indexOf(pattern.patternPartial) > -1) {
        continue;
      }

      ancestorPattern.lineageRIndex.push(pattern.patternPartial);

      // Create the more complex lineage object in reverse.
      const lr = {
        lineagePattern: pattern.patternPartial,
        lineagePath: this.patternlab.config.pathsPublic.patterns + '/' + pattern.patternLink,
        isHidden: pattern.isHidden
      };

      if (pattern.patternState) {
        lr.lineageState = pattern.patternState;
      }

      ancestorPattern.lineageR.push(lr);
    }
  }
};
