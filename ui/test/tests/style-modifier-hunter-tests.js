/**
 * Style modifier behavior is handled entirely within the Feplet template engine.
 * Its inclusion in Feplet is expressly to adhere to the Pattern Lab standard.
 * It is unlikely to be used outside of a Pattern Lab context.
 * For legacy's sake, it will continue to be tested here.
 */
'use strict';

const {expect} = require('chai');

const {
  patternlab,
  patternsDir
} = require('../init')();

// Preprocess the patternlab object.
patternlab.preProcessAllPatterns(patternsDir);
patternlab.preProcessDataAndParams();

// Get test pattern.
const childPattern = patternlab.getPattern('test-styled-atom');

describe('Style Modifier Hunter', function () {
  it('replaces a style modifier tag with a class submitted from the immediate parent', function () {
    // Get test patterns.
    const parentPattern = patternlab.getPattern('test-styled-molecule');

    // Process test pattern.
    patternlab.patternBuilder.processPattern(parentPattern, patternlab);

    // Assert.
    expect(parentPattern.template).to.equal('{{> test-styled-atom }}{{> test-styled-atom:test_1 }}');
    expect(childPattern.template).to
      .equal('<span class="test_base {{ styleModifier }}">{{ message }}{{ description }}</span>');
    expect(parentPattern.extendedTemplate).to
      .equal('<span class="test_base "></span><span class="test_base test_1"></span>');
  });

  it('replaces pipe-delimited multiple style modifiers with space-delimited classes', function () {
    // Get test pattern.
    const parentPattern = patternlab.getPattern('test-multiple-classes');

    // Process test pattern.
    patternlab.patternBuilder.processPattern(parentPattern, patternlab);

    // Assert.
    expect(parentPattern.template).to.equal('{{> test-styled-atom:foo1|foo2 }}');
    expect(childPattern.template).to
      .equal('<span class="test_base {{ styleModifier }}">{{ message }}{{ description }}</span>');
    expect(parentPattern.extendedTemplate).to
      .equal('<span class="test_base foo1 foo2"></span>');
  });

  it('replaces a style modifier tag with a single class when the parent also submits a parameter', function () {
    // Get test pattern.
    const parentPattern = patternlab.getPattern('test-mixed-params');

    // Process test pattern.
    patternlab.patternBuilder.processPattern(parentPattern, patternlab);

    // Assert.
    expect(parentPattern.template).to.equal('{{> test-styled-atom:test_2(message: \'1\') }}');
    expect(childPattern.template).to
      .equal('<span class="test_base {{ styleModifier }}">{{ message }}{{ description }}</span>');
    expect(parentPattern.extendedTemplate).to.equal('<span class="test_base test_2">1</span>');
  });

  it('replaces a style modifier tag with multiple classes when the parent also submits a parameter', function () {
    // Get test pattern.
    const parentPattern = patternlab.getPattern('test-multiple-classes-params');

    // Process test pattern.
    patternlab.patternBuilder.processPattern(parentPattern, patternlab);

    // Assert.
    expect(parentPattern.template).to.equal('{{> test-styled-atom:foo1|foo2(message: \'2\') }}');
    expect(childPattern.template).to
      .equal('<span class="test_base {{ styleModifier }}">{{ message }}{{ description }}</span>');
    expect(parentPattern.extendedTemplate).to.equal('<span class="test_base foo1 foo2">2</span>');
  });

  it('recursively replaces a style modifier tag in a child nested below the immediate child of the first parent\
', function () {
    // Get test pattern.
    const parentPattern = patternlab.getPattern('test-styled-organism');
    const middlePattern = patternlab.getPattern('test-styled-molecule');

    // Process test pattern.
    patternlab.patternBuilder.processPattern(parentPattern, patternlab);

    // Assert.
    expect(parentPattern.template).to.equal('{{> test-styled-molecule }}');
    expect(middlePattern.template).to.equal('{{> test-styled-atom }}{{> test-styled-atom:test_1 }}');
    expect(childPattern.template).to.equal(
      '<span class="test_base {{ styleModifier }}">{{ message }}{{ description }}</span>'
    );
    expect(parentPattern.extendedTemplate).to.equal(
      '<span class="test_base "></span><span class="test_base test_1"></span>'
    );
  });
});
