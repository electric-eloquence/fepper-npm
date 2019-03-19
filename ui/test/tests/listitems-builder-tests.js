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
const listItemPattern = patternlab.getPattern('test-listitem');
const listItemsPattern = patternlab.getPattern('test1-listitems');
const listItemsPatternLocal = patternlab.getPattern('test1-listitems-local');
const listItemsPatternMixed = patternlab.getPattern('test1-listitems-mixed');
const listItemsPatternNested = patternlab.getPattern('test1-listitems-nested');

// Process test patterns.
patternlab.patternBuilder.processPattern(listItemPattern, patternlab);
patternlab.patternBuilder.processPattern(listItemsPattern, patternlab);
patternlab.patternBuilder.processPattern(listItemsPatternLocal, patternlab);
patternlab.patternBuilder.processPattern(listItemsPatternMixed, patternlab);
patternlab.patternBuilder.processPattern(listItemsPatternNested, patternlab);

describe('ListItems Builder', function () {
  it('should find and output basic repeating blocks', function () {
    let expectation = '  <span class="test_base ">\n      \n      Fizzle crazy tortor. Sed rizzle. Pimpin&#39; dolor ' +
      'dapibizzle turpis tempizzle fo shizzle my nizzle. Maurizzle pellentesque its fo rizzle izzle turpis. Get down ' +
      'get down we gonna chung nizzle. Shizzlin dizzle eleifend rhoncizzle break it down. In yo ghetto platea ' +
      'dictumst. Bling bling dapibizzle. Curabitur break yo neck, yall fo, pretizzle eu, go to hizzle dope, own ' +
      'yo&#39; vitae, nunc. Bizzle suscipizzle. Semper velit sizzle fo.\n  </span>\n';

    expect(listItemPattern.extendedTemplate).to.equal(expectation);
  });

  it('should find partials and output repeated renders', function () {
    const expectation =
`<h1 id="title">Nullizzle shizznit velizzle, hizzle, suscipit own yo&#39;, gravida vizzle, arcu.</h1>
<p id="message"></p>
<h1 id="title">Nullizzle shizznit velizzle, hizzle, suscipit own yo&#39;, gravida vizzle, arcu.</h1>
<p id="message"></p>
`;

    expect(listItemsPattern.extendedTemplate).to.equal(expectation);
  });

  it('should overwrite global listItem property if that property is in local .listitem.json', function () {
    const expectation = `<h1 id="title">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</h1>
<p id="message"></p>
<h1 id="title">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</h1>
<p id="message"></p>
`;

    expect(listItemsPatternLocal.extendedTemplate).to.equal(expectation);
  });

  it('should recursively processes nested listItems', function () {
    const expectation = `<h1 id="title">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</h1>
<p id="message">listitemMessage</p>
<h1 id="title">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</h1>
<p id="message">listitemMessage</p>
`;

    expect(listItemsPatternMixed.extendedTemplate).to.equal(expectation);
  });

  it('should use local listItem property if that property is not set globally', function () {
    const expectation =
`<h1 id="title">Nullizzle shizznit velizzle, hizzle, suscipit own yo&#39;, gravida vizzle, arcu.</h1>
<p id="message"></p>
<h1 id="title">Nullizzle shizznit velizzle, hizzle, suscipit own yo&#39;, gravida vizzle, arcu.</h1>
<p id="message"></p>
`;

    expect(listItemsPatternNested.extendedTemplate).to.equal(expectation);
  });
});
