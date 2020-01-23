/**
 * Parameter behavior is handled entirely within the Feplet template engine.
 * For legacy's sake, it will continue to be tested here.
 */
'use strict';

const {expect} = require('chai');
const jsonEval = require('json-eval');

const {
  patternlab,
  patternsDir
} = require('../init')();

// Preprocess the patternlab object.
patternlab.preProcessAllPatterns(patternsDir);
patternlab.preProcessDataAndParams();

// Get test patterns.
const atomPattern = patternlab.getPattern('test-styled-atom');
const nestedPattern = patternlab.getPattern('test-param-nested');
const nesterPattern = patternlab.getPattern('test-param-nester');
const multiPattern = patternlab.getPattern('test-multiple-params');
const simplePattern = patternlab.getPattern('test1-simple');
const partialPattern = patternlab.getPattern('test1-parametered-partial');
const recursivePattern = patternlab.getPattern('test1-recursive-includer');
const antiInfinityPattern = patternlab.getPattern('test1-anti-infinity-tester');

patternlab.patternBuilder.processPattern(atomPattern, patternlab);
patternlab.patternBuilder.processPattern(nestedPattern, patternlab);
patternlab.patternBuilder.processPattern(nesterPattern, patternlab);
patternlab.patternBuilder.processPattern(multiPattern, patternlab);
patternlab.patternBuilder.processPattern(simplePattern, patternlab);
patternlab.patternBuilder.processPattern(partialPattern, patternlab);
patternlab.patternBuilder.processPattern(recursivePattern, patternlab);
patternlab.patternBuilder.processPattern(antiInfinityPattern, patternlab);

describe('Parameter Hunter', function () {
  it('finds and extends templates with a parameter', function () {
    expect(nestedPattern.extendedTemplate).to.equal('<span class="test_base ">paramMessage</span>');
  });

  it('finds and extends templates with multiple parameters', function () {
    expect(multiPattern.extendedTemplate).to
      .equal('<span class="test_base ">paramMessagedescription</span>');
  });

  it('finds and extends templates with mixed parameter and global data', function () {
    expect(nesterPattern.extendedTemplate).to.equal('<span class="test_base ">paramMessage</span>');
  });

  // Test quoting options.
  it('parses parameters with unquoted keys and unquoted values', function () {
    const param = '{description: true}';
    const evald = jsonEval(param);

    expect(JSON.stringify(evald)).to.equal('{"description":true}');
  });

  it('parses parameters with unquoted keys and double-quoted values', function () {
    const param = '{description: "true"}';
    const evald = jsonEval(param);

    expect(JSON.stringify(evald)).to.equal('{"description":"true"}');
  });

  it('parses parameters with single-quoted keys and unquoted values', function () {
    const param = '{\'description\': true}';
    const evald = jsonEval(param);

    expect(JSON.stringify(evald)).to.equal('{"description":true}');
  });

  it('parses parameters with single-quoted keys and single-quoted values wrapping internal escaped single-quotes\
', function () {
    const param = '{\'description\': \'true not,\\\'true\\\'\'}';
    const evald = jsonEval(param);

    expect(JSON.stringify(evald)).to.equal('{"description":"true not,\'true\'"}');
  });

  it('parses parameters with single-quoted keys and double-quoted values wrapping internal single-quotes\
', function () {
    const param = '{\'description\': "true not:\'true\'"}';
    const evald = jsonEval(param);

    expect(JSON.stringify(evald)).to.equal('{"description":"true not:\'true\'"}');
  });

  it('parses parameters with double-quoted keys and unquoted values', function () {
    const param = '{"description": true}';
    const evald = jsonEval(param);

    expect(JSON.stringify(evald)).to.equal('{"description":true}');
  });

  it('parses parameters with double-quoted keys and single-quoted values wrapping internal double-quotes\
', function () {
    const param = '{"description": \'true not{"true"\'}';
    const evald = jsonEval(param);

    expect(JSON.stringify(evald)).to.equal('{"description":"true not{\\"true\\""}');
  });

  it('parses parameters with double-quoted keys and double-quoted values wrapping internal escaped double-quotes\
', function () {
    const param = '{"description": "true not}\\"true\\""}';
    const evald = jsonEval(param);

    expect(JSON.stringify(evald)).to.equal('{"description":"true not}\\"true\\""}');
  });

  it('parses parameters with combination of quoting schemes for keys and values', function () {
    let param = '{description: true, \'foo\': false, "bar": false, \'single\': true, \'singlesingle\': \'true\', ' +
      '\'singledouble\': "true", "double": true, "doublesingle": \'true\', "doubledouble": "true"}';
    const evald = jsonEval(param);

    let expectation = '{"description":true,"foo":false,"bar":false,"single":true,"singlesingle":"true",' +
      '"singledouble":"true","double":true,"doublesingle":"true","doubledouble":"true"}';

    expect(JSON.stringify(evald)).to.equal(expectation);
  });

  it('parses parameters with values containing a closing parenthesis', function () {
    const param = '{description: \'Hello ) World\'}';
    const evald = jsonEval(param);

    expect(JSON.stringify(evald)).to.equal('{"description":"Hello ) World"}');
  });

  it('parses parameters that follow a non-quoted value', function () {
    const param = '{foo: true, bar: "Hello World"}';
    const evald = jsonEval(param);

    expect(JSON.stringify(evald)).to.equal('{"foo":true,"bar":"Hello World"}');
  });

  it('parses parameters whose keys contain escaped quotes', function () {
    const param = '{\'silly\\\'key\': true, bar: "Hello World", "another\\"silly-key": 42}';
    const evald = jsonEval(param);

    expect(JSON.stringify(evald)).to.equal('{"silly\'key":true,"bar":"Hello World","another\\"silly-key":42}');
  });

  it('skips malformed parameters', function () {
    const param = '{missing-val: , : missing-key, : , , foo: "Hello World"}';
    jsonEval(param);

    // eslint-disable-next-line no-console
    console.log('Pattern Lab catches JSON5.parse() errors and outputs useful debugging information...');
  });

  it('parses parameters containing html tags', function () {
    let param = '{tag1: \'<strong>Single-quoted</strong>\', tag2: "<em>Double-quoted</em>", ' +
      'tag3: \'<strong class=\\"foo\\" id=\\\'bar\\\'>With attributes</strong>\'}';
    const evald = jsonEval(param);

    let expectation = '{"tag1":"<strong>Single-quoted</strong>","tag2":"<em>Double-quoted</em>",' +
      '"tag3":"<strong class=\\"foo\\" id=\'bar\'>With attributes</strong>"}';

    expect(JSON.stringify(evald)).to.equal(expectation);
  });

  it('correctly parses partial parameters for recursion beyond a single level', function () {
    expect(recursivePattern.extendedTemplate).to.equal('<h1 id="title">foo</h1><p id="message"></p>');
  });

  it('correctly limits recursion on partials that call themselves but within restricted conditions\
', function () {
    const expectation = '<h1 id="title">foo</h1><p id="message"></p><h1 id="title">foo</h1><p id="message"></p>\
<h1 id="title">bar</h1><p id="message"></p>';

    expect(antiInfinityPattern.extendedTemplate).to.equal(expectation);
  });
});
