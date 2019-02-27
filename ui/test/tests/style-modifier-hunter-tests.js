/**
 * Style modifier behavior is handled entirely within the Feplet template engine.
 * Its inclusion in Feplet is expressly to adhere to the Pattern Lab standard.
 * It is unlikely to be used outside of a Pattern Lab context.
 * For legacy's sake, it will continue to be tested here.
 */
'use strict';

const expect = require('chai').expect;

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
  it('should replace a style modifier tag with a class submitted from the immediate parent', function () {
    // Get test patterns.
    const parentPattern = patternlab.getPattern('test-styled-molecule');

    // Process test pattern.
    patternlab.patternBuilder.processPattern(parentPattern, patternlab);

    // Assert.
    expect(parentPattern.template).to.equal('{{> test-styled-atom }}\n{{> test-styled-atom:test_1 }}\n');
    expect(childPattern.template).to
      .equal('<span class="test_base {{ styleModifier }}">\n    {{ message }}\n    {{ description }}\n</span>\n');
    expect(parentPattern.extendedTemplate).to
      .equal('<span class="test_base ">\n\n\n</span>\n<span class="test_base test_1">\n\n\n</span>\n');
  });

  it('should replace pipe-delimited multiple style modifiers with space-delimited classes', function () {
    // Get test pattern.
    const parentPattern = patternlab.getPattern('test-multiple-classes');

    // Process test pattern.
    patternlab.patternBuilder.processPattern(parentPattern, patternlab);

    // Assert.
    expect(parentPattern.template).to.equal('{{> test-styled-atom:foo1|foo2 }}\n');
    expect(childPattern.template).to
      .equal('<span class="test_base {{ styleModifier }}">\n    {{ message }}\n    {{ description }}\n</span>\n');
    expect(parentPattern.extendedTemplate).to
      .equal('<span class="test_base foo1 foo2">\n\n\n</span>\n');
  });

  it('should replace a style modifier tag with a single class when the parent also submits a parameter', function () {
    // Get test pattern.
    const parentPattern = patternlab.getPattern('test-mixed-params');

    // Process test pattern.
    patternlab.patternBuilder.processPattern(parentPattern, patternlab);

    // Assert.
    expect(parentPattern.template).to.equal('{{> test-styled-atom:test_2(message: \'1\') }}\n');
    expect(childPattern.template).to
      .equal('<span class="test_base {{ styleModifier }}">\n    {{ message }}\n    {{ description }}\n</span>\n');
    expect(parentPattern.extendedTemplate).to.equal('<span class="test_base test_2">\n  1\n\n</span>\n');
  });

  it('should replace a style modifier tag with multiple classes when the parent also submits a parameter', function () {
    // Get test pattern.
    const parentPattern = patternlab.getPattern('test-multiple-classes-params');

    // Process test pattern.
    patternlab.patternBuilder.processPattern(parentPattern, patternlab);

    // Assert.
    expect(parentPattern.template).to.equal('{{> test-styled-atom:foo1|foo2(message: \'2\') }}\n\n');
    expect(childPattern.template).to
      .equal('<span class="test_base {{ styleModifier }}">\n    {{ message }}\n    {{ description }}\n</span>\n');
    expect(parentPattern.extendedTemplate).to.equal('<span class="test_base foo1 foo2">\n  2\n\n</span>\n');
  });

  it(
    'should recursively replace a style modifier tag in a child nested below the immediate child of the first parent',
    function ()
  {
    // Get test pattern.
    const parentPattern = patternlab.getPattern('test-styled-organism');
    const middlePattern = patternlab.getPattern('test-styled-molecule');

    // Process test pattern.
    patternlab.patternBuilder.processPattern(parentPattern, patternlab);

    // Assert.
    expect(parentPattern.template).to.equal('{{> test-styled-molecule }}\n');
    expect(middlePattern.template).to.equal('{{> test-styled-atom }}\n{{> test-styled-atom:test_1 }}\n');
    expect(childPattern.template).to.equal(
      '<span class="test_base {{ styleModifier }}">\n    {{ message }}\n    {{ description }}\n</span>\n'
    );
    expect(parentPattern.extendedTemplate).to.equal(
      '<span class="test_base ">\n\n\n</span>\n<span class="test_base test_1">\n\n\n</span>\n'
    );
  });
});
