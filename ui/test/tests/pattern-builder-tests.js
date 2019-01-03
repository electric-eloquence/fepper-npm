'use strict';

const expect = require('chai').expect;

const {
  patternlab,
  patternsDir
} = require('../test-harness')();
const patternBuilder = patternlab.patternBuilder;

// Preprocess the patternlab object.
patternlab.preProcessAllPatterns(patternsDir);
patternlab.preProcessDataAndParams();

// Get test patterns.
const atomPattern = patternlab.getPattern('test-styled-atom');
const molPattern = patternlab.getPattern('test-styled-molecule');
const orgPattern = patternlab.getPattern('test-styled-organism');
const navPattern = patternlab.getPattern('test-nav');

// Process test patterns.
patternBuilder.processPattern(atomPattern, patternlab);
patternBuilder.processPattern(molPattern, patternlab);
patternBuilder.processPattern(orgPattern, patternlab);
patternBuilder.processPattern(navPattern, patternlab);

describe('Pattern Builder', function () {
  it('should replace link.* tags with their expanded link data', function () {
    const navTemplate = `<a href="{{ link.facebook-brad }}">Brad</a>
<a href="{{ link.facebook-dave }}">Dave</a>
<a href="{{ link.facebook-brian }}">Brian</a>
`;
    const navExtendedTemplate = `<a href="../facebook-cambridge-analytica-brad/facebook-cambridge-analytica-brad.html">Brad</a>
<a href="../facebook-cambridge-analytica-dave/facebook-cambridge-analytica-dave.html">Dave</a>
<a href="../facebook-cambridge-analytica-brian/facebook-cambridge-analytica-brian.html">Brian</a>
`;

    expect(navPattern.template).to.equal(navTemplate);
    expect(navPattern.extendedTemplate).to.equal(navExtendedTemplate);
  });

  describe('preProcessPartials', function () {
    it('should create a partials object for each unique partial keyed by its include tag', function () {
      expect(atomPattern.patternPartial).to.equal('test-styled-atom');
      expect(patternlab.partials[atomPattern.patternPartial]).to
        .equal('<span class="test_base {{ styleModifier }}">\n    {{ message }}\n    {{ description }}\n</span>\n');
    });

    it('should create a partialsComp object for each unique compiled partial keyed by its include tag', function () {
      expect(atomPattern.patternPartial).to.equal('test-styled-atom');
      expect(patternlab.partialsComp[atomPattern.patternPartial]).to.be.an.instanceof(Object);
      expect(patternlab.partialsComp[atomPattern.patternPartial]).to.equal(atomPattern.fepletComp);
    });
  });

  describe('processPattern', function () {
    it('should include partials directly within templates', function () {
      const atomTemplate =
        '<span class="test_base {{ styleModifier }}">\n    {{ message }}\n    {{ description }}\n</span>\n';
      const atomExtendedTemplate = '<span class="test_base ">\n    \n    \n</span>\n';

      expect(atomPattern.template).to.equal(atomTemplate);
      expect(molPattern.template).to.not.include(atomTemplate);
      expect(molPattern.template).to.include('{{> test-styled-atom');
      expect(atomPattern.extendedTemplate).to.equal(atomExtendedTemplate);
      expect(molPattern.extendedTemplate).to.include(atomExtendedTemplate);
    });

    it('should recursively include nested partials', function () {
      const atomTemplate =
        '<span class="test_base {{ styleModifier }}">\n    {{ message }}\n    {{ description }}\n</span>\n';
      const atomExtendedTemplate = '<span class="test_base ">\n    \n    \n</span>\n';

      expect(atomPattern.template).to.equal(atomTemplate);
      expect(molPattern.template).to.not.include(atomTemplate);
      expect(orgPattern.template).to.not.include(atomTemplate);
      expect(molPattern.template).to.include('{{> test-styled-atom');
      expect(orgPattern.template).to.not.include('{{> test-styled-atom');
      expect(orgPattern.template).to.include('{{> test-styled-molecule');
      expect(atomPattern.extendedTemplate).to.equal(atomExtendedTemplate);
      expect(orgPattern.extendedTemplate).to.include(atomExtendedTemplate);
    });
  });
});
