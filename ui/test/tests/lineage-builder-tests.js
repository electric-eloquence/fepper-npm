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
    expect(molPattern.lineage).to.have.property('test-styled-atom');
    expect(molPattern.lineage['test-styled-atom']).to.have.property('lineagePattern');
    expect(molPattern.lineage['test-styled-atom']).to.have.property('lineagePath');
    expect(molPattern.lineage['test-styled-atom']).to.have.property('isHidden');
    expect(molPattern.lineage['test-styled-atom'].lineagePattern).to.equal('test-styled-atom');
    expect(molPattern.lineage['test-styled-atom'].lineagePath)
      .to.equal('patterns/00-test-02-styled-atom/00-test-02-styled-atom.html');
    expect(molPattern.lineage['test-styled-atom'].isHidden).to.be.false;

    expect(orgPattern.lineage).to.have.property('test-styled-molecule');
    expect(orgPattern.lineage['test-styled-molecule']).to.have.property('lineagePattern');
    expect(orgPattern.lineage['test-styled-molecule']).to.have.property('lineagePath');
    expect(orgPattern.lineage['test-styled-molecule']).to.have.property('isHidden');
    expect(orgPattern.lineage['test-styled-molecule'].lineagePattern).to.equal('test-styled-molecule');
    expect(orgPattern.lineage['test-styled-molecule'].lineagePath)
      .to.equal('patterns/00-test-03-styled-molecule/00-test-03-styled-molecule.html');
    expect(orgPattern.lineage['test-styled-molecule'].isHidden).to.be.false;
  });

  it('finds reverse lineage', function () {
    expect(atomPattern.lineageR).to.have.property('test-styled-molecule');
    expect(atomPattern.lineageR['test-styled-molecule']).to.have.property('lineagePattern');
    expect(atomPattern.lineageR['test-styled-molecule']).to.have.property('lineagePath');
    expect(atomPattern.lineageR['test-styled-molecule']).to.have.property('isHidden');
    expect(atomPattern.lineageR['test-styled-molecule'].lineagePattern).to.equal('test-styled-molecule');
    expect(atomPattern.lineageR['test-styled-molecule'].lineagePath)
      .to.equal('patterns/00-test-03-styled-molecule/00-test-03-styled-molecule.html');
    expect(atomPattern.lineageR['test-styled-molecule'].isHidden).to.be.false;

    expect(atomPattern.lineageR).to.have.property('test-multiple-classes');
    expect(atomPattern.lineageR['test-multiple-classes']).to.have.property('lineagePattern');
    expect(atomPattern.lineageR['test-multiple-classes']).to.have.property('lineagePath');
    expect(atomPattern.lineageR['test-multiple-classes']).to.have.property('isHidden');
    expect(atomPattern.lineageR['test-multiple-classes'].lineagePattern).to.equal('test-multiple-classes');
    expect(atomPattern.lineageR['test-multiple-classes'].lineagePath)
      .to.equal('patterns/00-test-05-multiple-classes/00-test-05-multiple-classes.html');
    expect(atomPattern.lineageR['test-multiple-classes'].isHidden).to.be.false;

    expect(atomPattern.lineageR).to.have.property('test-mixed-params');
    expect(atomPattern.lineageR['test-mixed-params']).to.have.property('lineagePattern');
    expect(atomPattern.lineageR['test-mixed-params']).to.have.property('lineagePath');
    expect(atomPattern.lineageR['test-mixed-params']).to.have.property('isHidden');
    expect(atomPattern.lineageR['test-mixed-params'].lineagePattern).to.equal('test-mixed-params');
    expect(atomPattern.lineageR['test-mixed-params'].lineagePath)
      .to.equal('patterns/00-test-06-mixed-params/00-test-06-mixed-params.html');
    expect(atomPattern.lineageR['test-mixed-params'].isHidden).to.be.false;

    expect(atomPattern.lineageR).to.have.property('test-multiple-classes-params');
    expect(atomPattern.lineageR['test-multiple-classes-params']).to.have.property('lineagePattern');
    expect(atomPattern.lineageR['test-multiple-classes-params']).to.have.property('lineagePath');
    expect(atomPattern.lineageR['test-multiple-classes-params']).to.have.property('isHidden');
    expect(atomPattern.lineageR['test-multiple-classes-params'].lineagePattern)
      .to.equal('test-multiple-classes-params');
    expect(atomPattern.lineageR['test-multiple-classes-params'].lineagePath)
      .to.equal('patterns/00-test-07-multiple-classes-params/00-test-07-multiple-classes-params.html');
    expect(atomPattern.lineageR['test-multiple-classes-params'].isHidden).to.be.false;

    expect(atomPattern.lineageR).to.have.property('test-param-nested');
    expect(atomPattern.lineageR['test-param-nested']).to.have.property('lineagePattern');
    expect(atomPattern.lineageR['test-param-nested']).to.have.property('lineagePath');
    expect(atomPattern.lineageR['test-param-nested']).to.have.property('isHidden');
    expect(atomPattern.lineageR['test-param-nested'].lineagePattern).to.equal('test-param-nested');
    expect(atomPattern.lineageR['test-param-nested'].lineagePath)
      .to.equal('patterns/00-test-08-param-nested/00-test-08-param-nested.html');
    expect(atomPattern.lineageR['test-param-nested'].isHidden).to.be.false;

    expect(atomPattern.lineageR).to.have.property('test-multiple-params');
    expect(atomPattern.lineageR['test-multiple-params']).to.have.property('lineagePattern');
    expect(atomPattern.lineageR['test-multiple-params']).to.have.property('lineagePath');
    expect(atomPattern.lineageR['test-multiple-params']).to.have.property('isHidden');
    expect(atomPattern.lineageR['test-multiple-params'].lineagePattern).to.equal('test-multiple-params');
    expect(atomPattern.lineageR['test-multiple-params'].lineagePath)
      .to.equal('patterns/00-test-10-multiple-params/00-test-10-multiple-params.html');
    expect(atomPattern.lineageR['test-multiple-params'].isHidden).to.be.false;

    expect(atomPattern.lineageR).to.have.property('test-listitem');
    expect(atomPattern.lineageR['test-listitem']).to.have.property('lineagePattern');
    expect(atomPattern.lineageR['test-listitem']).to.have.property('lineagePath');
    expect(atomPattern.lineageR['test-listitem']).to.have.property('isHidden');
    expect(atomPattern.lineageR['test-listitem'].lineagePattern).to.equal('test-listitem');
    expect(atomPattern.lineageR['test-listitem'].lineagePath)
      .to.equal('patterns/00-test-11-listitem/00-test-11-listitem.html');
    expect(atomPattern.lineageR['test-listitem'].isHidden).to.be.false;

    expect(molPattern.lineageR).to.have.property('test-styled-organism');
    expect(molPattern.lineageR['test-styled-organism']).to.have.property('lineagePattern');
    expect(molPattern.lineageR['test-styled-organism']).to.have.property('lineagePath');
    expect(molPattern.lineageR['test-styled-organism']).to.have.property('isHidden');
    expect(molPattern.lineageR['test-styled-organism'].lineagePattern).to.equal('test-styled-organism');
    expect(molPattern.lineageR['test-styled-organism'].lineagePath)
      .to.equal('patterns/00-test-04-styled-organism/00-test-04-styled-organism.html');
    expect(molPattern.lineageR['test-styled-organism'].isHidden).to.be.false;
  });
});
