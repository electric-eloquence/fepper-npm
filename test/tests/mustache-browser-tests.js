'use strict';

const expect = require('chai').expect;

require('../test-harness');

const fepper = global.fepper;
const mustacheBrowser = fepper.tcpIp.fpExpress.mustacheBrowser;

const partialTag = '{{> 02-components/00-global/00-header.mustache }}';
const partialTag1 = '{{> 02-components/00-global/00-header(\'partial?\': true) }}';
const partialTag2 = '{{> components-header:foo }}';
const partialTag3 = '{{> components-header:foo|bar }}';
const partialTag4 = '{{> components-header:foo(\'partial?\': true) }}';
const partialTag5 = '{{> components-header:foo|bar(\'partial?\': true) }}';
const patternIdentifier = mustacheBrowser.stripPartialTag(partialTag);
const patternIdentifier1 = mustacheBrowser.stripPartialTag(partialTag1);
const patternIdentifier2 = mustacheBrowser.stripPartialTag(partialTag2);
const patternIdentifier3 = mustacheBrowser.stripPartialTag(partialTag3);
const patternIdentifier4 = mustacheBrowser.stripPartialTag(partialTag4);
const patternIdentifier5 = mustacheBrowser.stripPartialTag(partialTag5);

let mustache = '<section id="one" class="test">{{> 02-components/00-global/00-header(\'partial?\': true) }}</section>' +
  '<section id="two" class="test">{{> 02-components/00-global/01-footer.mustache }}</section><script></script>' +
  '<textarea></textarea></body></html>';
const htmlEntitiesAndLinks = mustacheBrowser.toHtmlEntitiesAndLinks(mustache);

describe('Mustache Browser', function () {
  it('should replace angle brackets with HTML entities', function () {
    expect(mustache).to.contain('<');
    expect(mustache).to.contain('>');
    expect(mustache).to.not.contain('&lt;');
    expect(mustache).to.not.contain('&gt;');
    expect(htmlEntitiesAndLinks).to.contain('&lt;');
    expect(htmlEntitiesAndLinks).to.contain('&gt;');
    expect(htmlEntitiesAndLinks).to.contain('&gt;');
  });

  it('should link Mustache partials', function () {
    expect(htmlEntitiesAndLinks).to.contain('<a href="');
    expect(htmlEntitiesAndLinks).to.contain('</a>');

    let expectation = '&lt;section id=&quot;one&quot; class=&quot;test&quot;&gt;<a href="?partial={{&gt; ' +
      '02-components/00-global/00-header(\'partial?\': true) }}" class="fp-express">{{&gt; ' +
      '02-components/00-global/00-header(\'partial?\': true) }}</a>&lt;/section&gt;&lt;section id=&quot;two&quot; ' +
      'class=&quot;test&quot;&gt;<a href="?partial={{&gt; 02-components/00-global/01-footer.mustache }}" ' +
      'class="fp-express">{{&gt; 02-components/00-global/01-footer.mustache }}</a>' +
      '&lt;/section&gt;&lt;script&gt;&lt;/script&gt;&lt;textarea&gt;&lt;/textarea&gt;&lt;/body&gt;&lt;/html&gt;';

    expect(htmlEntitiesAndLinks).to.equal(expectation);
  });

  it('should strip Mustache tags of Mustache syntax to get pattern identifiers', function () {
    expect(partialTag).to.contain('{{>');
    expect(partialTag).to.contain('}}');
    expect(patternIdentifier).to.not.contain('{{>');
    expect(patternIdentifier).to.not.contain('}}');
    expect(patternIdentifier).to.equal('02-components/00-global/00-header.mustache');
  });

  it('should strip Mustache tags of parameters to get pattern identifiers', function () {
    expect(partialTag1).to.contain('(');
    expect(partialTag1).to.contain(')');
    expect(patternIdentifier1).to.not.contain('(');
    expect(patternIdentifier1).to.not.contain(')');
    expect(patternIdentifier1).to.equal('02-components/00-global/00-header');
  });

  it('should strip Mustache tags of single styleModifiers to get pattern identifiers', function () {
    expect(partialTag2).to.contain(':');
    expect(patternIdentifier2).to.not.contain(':');
    expect(patternIdentifier2).to.equal('components-header');
  });

  it('should strip Mustache tags of multiple styleModifiers to get pattern identifiers', function () {
    expect(partialTag3).to.contain(':');
    expect(partialTag3).to.contain('|');
    expect(patternIdentifier3).to.not.contain(':');
    expect(patternIdentifier3).to.not.contain('|');
    expect(patternIdentifier3).to.equal('components-header');
  });

  it('should strip Mustache tags of single styleModifiers and parameters to get pattern identifiers', function () {
    expect(partialTag4).to.contain(':');
    expect(partialTag4).to.contain('(');
    expect(partialTag4).to.contain(')');
    expect(patternIdentifier4).to.not.contain(':');
    expect(patternIdentifier4).to.not.contain('(');
    expect(patternIdentifier4).to.not.contain(')');
    expect(patternIdentifier4).to.equal('components-header');
  });

  it('should strip Mustache tags of multiple styleModifiers and parameters to get pattern identifiers', function () {
    expect(partialTag5).to.contain(':');
    expect(partialTag5).to.contain('|');
    expect(partialTag5).to.contain('(');
    expect(partialTag5).to.contain(')');
    expect(patternIdentifier5).to.not.contain(':');
    expect(patternIdentifier5).to.not.contain('|');
    expect(patternIdentifier5).to.not.contain('(');
    expect(patternIdentifier5).to.not.contain(')');
    expect(patternIdentifier5).to.equal('components-header');
  });
});
