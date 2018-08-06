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
const basePattern = patternlab.getPattern('test-styled-atom');
const altPattern = patternlab.getPattern('test-styled-atom-alt');

// Process test patterns.
patternlab.patternAssembler.processPattern(basePattern);
patternlab.patternAssembler.processPattern(altPattern);

describe('Pseudopattern Hunter', function () {
  it('should identify pseudopatterns', function () {
    expect(basePattern.isPseudopattern).to.equal(false);
    expect(altPattern.isPseudopattern).to.equal(true);
  });

  it('should copy base pattern templates to their pseudopatterns', function () {
    expect(altPattern.template).to.equal(basePattern.template);
  });

  it('should identify pseudopattern data', function () {
    expect(altPattern.jsonFileData.message).to.equal('alternateMessage');
  });

  it('should render the base pattern and pseudopattern each with their own data', function () {
    expect(basePattern.extendedTemplate).to.equal('<span class="test_base ">\n    \n    \n</span>\n');
    expect(altPattern.extendedTemplate).to.equal('<span class="test_base ">\n    alternateMessage\n    \n</span>\n');
    expect(altPattern.extendedTemplate).to.not.equal(basePattern.extendedTemplate);
  });
});
