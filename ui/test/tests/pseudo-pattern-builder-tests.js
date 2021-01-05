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
const basePattern = patternlab.getPattern('test-styled-atom');
const altPattern = patternlab.getPattern('test-styled-atom-alt');

// Process test patterns.
patternlab.patternBuilder.processPattern(basePattern);
patternlab.patternBuilder.processPattern(altPattern);

describe('Pseudo-Pattern Hunter', function () {
  it('identifies pseudo-patterns', function () {
    expect(basePattern.isPseudoPattern).to.be.false;
    expect(altPattern.isPseudoPattern).to.be.true;
  });

  it('copies base pattern templates to their pseudo-patterns', function () {
    expect(altPattern.template).to.equal(basePattern.template);
  });

  it('identifies pseudo-pattern data', function () {
    expect(altPattern.jsonFileData.message).to.equal('alternateMessage');
  });

  it('renders the base pattern and pseudo-pattern each with their own data', function () {
    expect(basePattern.templateExtended).to.equal('<span class="test_base ">    atomic  </span>  ');
    expect(altPattern.templateExtended)
      .to.equal('<span class="test_base ">  alternateMessage  atomic  </span>  ');
    expect(altPattern.templateExtended).to.not.equal(basePattern.templateExtended);
  });

  it('renders the base pattern without own data and pseudo-pattern with own data', function () {
    delete basePattern.jsonFileData;

    patternlab.patternBuilder.processPattern(basePattern);
    patternlab.patternBuilder.processPattern(altPattern);

    expect(basePattern.templateExtended).to.equal('<span class="test_base ">      </span>  ');
    expect(altPattern.templateExtended).to.equal('<span class="test_base ">  alternateMessage    </span>  ');
    expect(altPattern.templateExtended).to.not.equal(basePattern.templateExtended);
  });
});
