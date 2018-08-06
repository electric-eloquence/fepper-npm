'use strict';

const expect = require('chai').expect;

require('../test-harness');

const fepper = global.fepper;
const mustacheBrowser = fepper.tcpIp.fpExpress.mustacheBrowser;

const partialTag = '{{> 02-components/00-global/00-header(\'partial?\': true) }}';
const partialTag1 = '{{> 02-components/00-global/00-footer.mustache }}';
const partialPath = mustacheBrowser.partialTagToPath(partialTag);
const partialPath1 = mustacheBrowser.partialTagToPath(partialTag1);

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
      '02-components/00-global/00-header(\'partial?\': true) }}">{{&gt; ' +
      '02-components/00-global/00-header(\'partial?\': true) }}</a>&lt;/section&gt;&lt;section ' +
      'id=&quot;two&quot; class=&quot;test&quot;&gt;<a href="?partial={{&gt; ' +
      '02-components/00-global/01-footer.mustache }}">{{&gt; 02-components/00-global/01-footer.mustache }}</a>' +
      '&lt;/section&gt;&lt;script&gt;&lt;/script&gt;&lt;textarea&gt;&lt;/textarea&gt;&lt;/body&gt;&lt;/html&gt;';

    expect(htmlEntitiesAndLinks).to.equal(expectation);
  });

  it('should strip Mustache tags to get partial path', function () {
    expect(partialTag).to.contain('{{>');
    expect(partialTag).to.contain('}}');
    expect(partialTag).to.contain('(');
    expect(partialTag).to.contain(')');
    expect(partialPath).to.not.contain('{{>');
    expect(partialPath).to.not.contain('}}');
    expect(partialPath).to.not.contain('(');
    expect(partialPath).to.not.contain(')');
    expect(partialPath).to.equal('02-components/00-global/00-header.mustache');
  });

  it('should append .mustache extension to end of partials with no extension', function () {
    expect(partialTag).to.not.contain('.mustache');
    expect(partialPath.indexOf('.mustache')).to.equal(partialPath.length - 9);
  });

  it('should not append .mustache extension to end of partials with extension', function () {
    expect(partialTag1).to.contain('.mustache');
    expect(partialPath1.indexOf('.mustache')).to.equal(partialPath.length - 9);
  });
});
