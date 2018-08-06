'use strict';

const expect = require('chai').expect;

const {
  patternlab,
  patternsDir
} = require('../test-harness')();
const patternAssembler = patternlab.patternAssembler;

// Preprocess the patternlab object.
patternlab.preprocessAllPatterns(patternsDir);
patternlab.preprocessDataAndParams();

// Get test patterns.
const atomPattern = patternlab.getPattern('test-styled-atom');
const molPattern = patternlab.getPattern('test-styled-molecule');
const orgPattern = patternlab.getPattern('test-styled-organism');
const navPattern = patternlab.getPattern('test-nav');

// Process test patterns.
patternAssembler.processPattern(atomPattern, patternlab);
patternAssembler.processPattern(molPattern, patternlab);
patternAssembler.processPattern(orgPattern, patternlab);
patternAssembler.processPattern(navPattern, patternlab);

describe('Pattern Assembler', function () {
  describe('preprocessPartials', function () {
    it('should create a partials object for each unique partial keyed by its include tag', function () {
      expect(atomPattern.patternPartial).to.equal('test-styled-atom');
      expect(patternlab.partials[atomPattern.patternPartial]).to
        .equal('<span class="test_base {{ styleModifier }}">\n    {{ message }}\n    {{ description }}\n</span>\n');
    });

    it('should create a partialsComp object for each unique compiled partial keyed by its include tag', function () {
      expect(atomPattern.patternPartial).to.equal('test-styled-atom');
      expect(patternlab.partialsComp[atomPattern.patternPartial] instanceof Object).to.equal(true);
      expect(patternlab.partialsComp[atomPattern.patternPartial]).to.equal(atomPattern.fepletComp);
    });
  });

  describe('processPattern', function () {
    it('should include partials directly within templates', function () {
      const atomTemplate =
        '<span class="test_base {{ styleModifier }}">\n    {{ message }}\n    {{ description }}\n</span>\n';
      const atomExtendedTemplate = '<span class="test_base ">\n    \n    \n</span>\n';

      expect(atomPattern.template).to.equal(atomTemplate);
      expect(molPattern.template).to.not.have.string(atomTemplate);
      expect(molPattern.template).to.have.string('{{> test-styled-atom');
      expect(atomPattern.extendedTemplate).to.equal(atomExtendedTemplate);
      expect(molPattern.extendedTemplate).to.have.string(atomExtendedTemplate);
    });

    it('should recursively include nested partials', function () {
      const atomTemplate =
        '<span class="test_base {{ styleModifier }}">\n    {{ message }}\n    {{ description }}\n</span>\n';
      const atomExtendedTemplate = '<span class="test_base ">\n    \n    \n</span>\n';

      expect(atomPattern.template).to.equal(atomTemplate);
      expect(molPattern.template).to.not.have.string(atomTemplate);
      expect(orgPattern.template).to.not.have.string(atomTemplate);
      expect(molPattern.template).to.have.string('{{> test-styled-atom');
      expect(orgPattern.template).to.not.have.string('{{> test-styled-atom');
      expect(orgPattern.template).to.have.string('{{> test-styled-molecule');
      expect(atomPattern.extendedTemplate).to.equal(atomExtendedTemplate);
      expect(orgPattern.extendedTemplate).to.have.string(atomExtendedTemplate);
    });
  });

  describe('processPattern', function () {
    it('should replace link.* tags with their expanded link data', function () {
      const navTemplate = `<a href="{{ link.twitter-brad }}">Brad</a>
<a href="{{ link.twitter-dave }}">Dave</a>
<a href="{{ link.twitter-brian }}">Brian</a>
`;
      const navExtendedTemplate = `<a href="/patterns/twitter-brad/twitter-brad.html">Brad</a>
<a href="/patterns/twitter-dave/twitter-dave.html">Dave</a>
<a href="/patterns/twitter-brian/twitter-brian.html">Brian</a>
`;

      expect(navPattern.template).to.equal(navTemplate);
      expect(navPattern.extendedTemplate).to.equal(navExtendedTemplate);
    });
  });
});
