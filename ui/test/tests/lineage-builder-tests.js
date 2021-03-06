'use strict';

const {expect} = require('chai');

const {
  patternlab,
  patternsDir
} = require('../init')();

// Preprocess the patternlab object.
patternlab.preProcessAllPatterns(patternsDir);
patternlab.preProcessDataAndParams();

// Get test patterns.
const atomPattern = patternlab.getPattern('test-styled-atom');
const molPattern = patternlab.getPattern('test-styled-molecule');
const orgPattern = patternlab.getPattern('test-styled-organism');

patternlab.patternBuilder.processPattern(atomPattern, patternlab);
patternlab.patternBuilder.processPattern(molPattern, patternlab);
patternlab.patternBuilder.processPattern(orgPattern, patternlab);

describe('Lineage Builder', function () {
  it('finds lineage', function () {
    expect(molPattern.lineageIndex).to.include('test-styled-atom');
    expect(orgPattern.lineageIndex).to.include('test-styled-molecule');
  });

  it('finds reverse lineage', function () {
    expect(atomPattern.lineageRIndex).to.include('test-styled-molecule');
    expect(atomPattern.lineageRIndex).to.include('test-styled-molecule');
    expect(atomPattern.lineageRIndex).to.include('test-multiple-classes');
    expect(atomPattern.lineageRIndex).to.include('test-mixed-params');
    expect(atomPattern.lineageRIndex).to.include('test-multiple-classes-params');
    expect(atomPattern.lineageRIndex).to.include('test-param-nested');
    expect(atomPattern.lineageRIndex).to.include('test-multiple-params');
    expect(atomPattern.lineageRIndex).to.include('test-listitem');
    expect(molPattern.lineageRIndex).to.include('test-styled-organism');
  });
});
