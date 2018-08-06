'use strict';

const expect = require('chai').expect;

const {
  patternlab,
  patternsDir
} = require('../test-harness')();

// Preprocess the patternlab object.
patternlab.preprocessAllPatterns(patternsDir);
patternlab.preprocessDataAndParams();

// Get test patterns.
const atomPattern = patternlab.getPattern('test-styled-atom');
const molPattern = patternlab.getPattern('test-styled-molecule');
const orgPattern = patternlab.getPattern('test-styled-organism');

patternlab.patternAssembler.processPattern(atomPattern, patternlab);
patternlab.patternAssembler.processPattern(molPattern, patternlab);
patternlab.patternAssembler.processPattern(orgPattern, patternlab);

describe('Lineage Hunter', function () {
  it('should find lineage', function () {
    expect(molPattern.lineageIndex.indexOf('test-styled-atom')).to.be.above(-1);
    expect(orgPattern.lineageIndex.indexOf('test-styled-molecule')).to.be.above(-1);
  });

  it('should find reverse lineage', function () {
    expect(atomPattern.lineageRIndex.indexOf('test-styled-molecule')).to.be.above(-1);
    expect(atomPattern.lineageRIndex.indexOf('test-styled-molecule')).to.be.above(-1);
    expect(atomPattern.lineageRIndex.indexOf('test-multiple-classes')).to.be.above(-1);
    expect(atomPattern.lineageRIndex.indexOf('test-mixed-params')).to.be.above(-1);
    expect(atomPattern.lineageRIndex.indexOf('test-multiple-classes-params')).to.be.above(-1);
    expect(atomPattern.lineageRIndex.indexOf('test-param-nested')).to.be.above(-1);
    expect(atomPattern.lineageRIndex.indexOf('test-multiple-params')).to.be.above(-1);
    expect(atomPattern.lineageRIndex.indexOf('test-listitem')).to.be.above(-1);
    expect(molPattern.lineageRIndex.indexOf('test-styled-organism')).to.be.above(-1);
  });
});
