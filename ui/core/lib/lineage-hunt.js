'use strict';

// PRIVATE FUNCTION

function matchPattern(partial, patternlab) {
  // first, perform a check for partials with parameters
  // we need to make sure partial !== matchCandidate so we only submit the non-param partial
  for (let i in patternlab.partials) {
    if (!patternlab.partials.hasOwnProperty(i)) {
      continue;
    }

    const matchCandidate = patternlab.partials[i];

    if (partial !== matchCandidate && partial.indexOf(matchCandidate) === 0) {
      return matchCandidate;
    }
  }

  // then, look for exact matches
  for (let i in patternlab.partials) {
    if (!patternlab.partials.hasOwnProperty(i)) {
      continue;
    }

    const matchCandidate = patternlab.partials[i];

    if (partial === matchCandidate) {
      return matchCandidate;
    }
  }

  return null;
}

function partialTagScan(parseArr, partialsArr) {
  for (let i = 0, l = parseArr.length; i < l; i++) {
    const parseObj = parseArr[i];

    if (parseObj.tag && parseObj.tag === '>') {
      partialsArr.push(parseObj.n);
    }

    else if (parseObj.nodes) {
      partialsArr = partialTagScan(parseObj.nodes, partialsArr);
    }
  }

  return partialsArr;
}

// EXPORTED FUNCTION

module.exports = function (pattern, patternlab) {
  if (!pattern.fepletParse) {
    return;
  }

  let partialsArr = [];

  // find the {{> template-name }} within patterns
  partialsArr = partialTagScan(pattern.fepletParse, partialsArr);

  partialsArr.forEach(function (partial) {
    // get the ancestorPattern
    const ancestorPatternName = matchPattern(partial, patternlab);

    if (!ancestorPatternName) {
      return;
    }

    const ancestorPattern = patternlab.getPattern(ancestorPatternName);

    if (!ancestorPattern) {
      console.error('Could not find pattern ' + ancestorPatternName);
    }
    else if (pattern.lineageIndex.indexOf(ancestorPattern.patternPartial) === -1) {
      // add it since it didnt exist
      pattern.lineageIndex.push(ancestorPattern.patternPartial);

      // create the more complex lineage object too
      const l = {
        lineagePattern: ancestorPattern.patternPartial,
        lineagePath: '../../patterns/' + ancestorPattern.patternLink
      };

      if (ancestorPattern.patternState) {
        l.lineageState = ancestorPattern.patternState;
      }

      pattern.lineage.push(l);

      // also, add the lineageR entry if it doesn't exist
      if (ancestorPattern.lineageRIndex.indexOf(pattern.patternPartial) === -1) {
        ancestorPattern.lineageRIndex.push(pattern.patternPartial);

        // create the more complex lineage object in reverse
        const lr = {
          lineagePattern: pattern.patternPartial,
          lineagePath: '../../patterns/' + pattern.patternLink
        };

        if (pattern.patternState) {
          lr.lineageState = pattern.patternState;
        }

        ancestorPattern.lineageR.push(lr);
      }
    }
  });
};
