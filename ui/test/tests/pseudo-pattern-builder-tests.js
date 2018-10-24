'use strict';

const expect = require('chai').expect;

const {
  patternlab,
  patternsDir
} = require('../test-harness')();

// Preprocess the patternlab object.
patternlab.preProcessAllPatterns(patternsDir);
patternlab.preProcessDataAndParams();

// Get test patterns.
const basePattern = patternlab.getPattern('test-styled-atom');
const altPattern = patternlab.getPattern('test-styled-atom-alt');

// Process test patterns.
patternlab.patternBuilder.processPattern(basePattern);
patternlab.patternBuilder.processPattern(altPattern);

describe('Pseudo-Pattern Hunter', function () {
  it('should identify pseudo-patterns', function () {
    expect(basePattern.isPseudoPattern).to.equal(false);
    expect(altPattern.isPseudoPattern).to.equal(true);
  });

  it('should copy base pattern templates to their pseudo-patterns', function () {
    expect(altPattern.template).to.equal(basePattern.template);
  });

  it('should identify pseudo-pattern data', function () {
    expect(altPattern.jsonFileData.message).to.equal('alternateMessage');
  });

  it('should render the base pattern and pseudo-pattern each with their own data', function () {
    expect(basePattern.extendedTemplate).to.equal('<span class="test_base ">\n    \n    \n</span>\n');
    expect(altPattern.extendedTemplate).to.equal('<span class="test_base ">\n    alternateMessage\n    \n</span>\n');
    expect(altPattern.extendedTemplate).to.not.equal(basePattern.extendedTemplate);
  });
});
