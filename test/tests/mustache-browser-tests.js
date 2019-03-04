'use strict';

const expect = require('chai').expect;

require('../init');

const fepper = global.fepper;
const mustacheBrowser = fepper.tcpIp.fpExpress.mustacheBrowser;
const ObjectFactory = require('../../ui/core/lib/object-factory');

const contentBefore = `<html>
  <head></head>
  <body></body>
</html>
`;
const contentAfter = mustacheBrowser.toHtmlEntitiesAndLinks(contentBefore);

mustacheBrowser.ui.patternlab.build();

describe('Mustache Browser', function () {
  it('should strip verbose, but without extension, Mustache partial tags to get query partials', function () {
    const partialTag = '{{> 02-components/00-global/00-header }}';
    const patternIdentifier = mustacheBrowser.stripPartialTag(partialTag);

    expect(partialTag).to.contain('{{>');
    expect(partialTag).to.contain('}}');
    expect(patternIdentifier).to.not.contain('{{>');
    expect(patternIdentifier).to.not.contain('}}');
    expect(patternIdentifier).to.equal('02-components/00-global/00-header');
  });

  it('should strip verbose, with extension, Mustache partial tags to get query partials', function () {
    const partialTag = '{{> 02-components/00-global/00-header.mustache }}';
    const patternIdentifier = mustacheBrowser.stripPartialTag(partialTag);

    expect(partialTag).to.contain('{{>');
    expect(partialTag).to.contain('}}');
    expect(patternIdentifier).to.not.contain('{{>');
    expect(patternIdentifier).to.not.contain('}}');
    expect(patternIdentifier).to.equal('02-components/00-global/00-header.mustache');
  });

  it('should strip shorthand Mustache partial tags to get query partials', function () {
    const partialTag = '{{> components-header }}';
    const patternIdentifier = mustacheBrowser.stripPartialTag(partialTag);

    expect(partialTag).to.contain('{{>');
    expect(partialTag).to.contain('}}');
    expect(patternIdentifier).to.not.contain('{{>');
    expect(patternIdentifier).to.not.contain('}}');
    expect(patternIdentifier).to.equal('components-header');
  });

  it('should return a Pattern object on submission of a verbose, but without extension, query partial', function () {
    const pattern = mustacheBrowser.getPattern('02-components/00-global/00-header');

    expect(pattern).to.be.instanceof(ObjectFactory.Pattern);
    expect(pattern.relPath).to.equal('02-components/00-global/00-header.mustache');
  });

  it('should return a Pattern object on submission of a verbose, with extension, query partial', function () {
    const pattern = mustacheBrowser.getPattern('02-components/00-global/00-header.mustache');

    expect(pattern).to.be.instanceof(ObjectFactory.Pattern);
    expect(pattern.relPath).to.equal('02-components/00-global/00-header.mustache');
  });

  it('should return a Pattern object on submission of a shorthand query partial', function () {
    const pattern = mustacheBrowser.getPattern('components-header');

    expect(pattern).to.be.instanceof(ObjectFactory.Pattern);
    expect(pattern.relPath).to.equal('02-components/00-global/00-header.mustache');
  });

  it('should return a Pattern object on submission of a verbose pseudo-pattern query partial', function () {
    const pattern = mustacheBrowser.getPattern('02-components/00-global/00-header~localhost');

    expect(pattern).to.be.instanceof(ObjectFactory.Pattern);
    expect(pattern.relPath).to.equal('02-components/00-global/00-header~localhost.json');
  });

  it('should return a Pattern object on submission of a shorthand pseudo-pattern query partial', function () {
    const pattern = mustacheBrowser.getPattern('components-header-localhost');

    expect(pattern).to.be.instanceof(ObjectFactory.Pattern);
    expect(pattern.relPath).to.equal('02-components/00-global/00-header~localhost.json');
  });

  it('should return a Pattern object on submission of a shorthand PHP syntax pseudo-pattern query partial\
', function () {
    const pattern = mustacheBrowser.getPattern('components-header~localhost');

    expect(pattern).to.be.instanceof(ObjectFactory.Pattern);
    expect(pattern.relPath).to.equal('02-components/00-global/00-header~localhost.json');
  });

  it('should return a null on submission of a no-result query partial', function () {
    const pattern = mustacheBrowser.getPattern('no-result');

    expect(pattern).to.equal(null);
  });

  it('should replace angle brackets with HTML entities', function () {
    const htmlBefore = '<html></html>';
    const htmlAfter = mustacheBrowser.toHtmlEntitiesAndLinks(htmlBefore);

    expect(htmlBefore).to.contain('<');
    expect(htmlBefore).to.contain('>');
    expect(htmlBefore).to.not.contain('&lt;');
    expect(htmlBefore).to.not.contain('&gt;');
    expect(htmlAfter).to.not.contain('>');
    expect(htmlAfter).to.not.contain('<');
    expect(htmlAfter).to.contain('&lt;');
    expect(htmlAfter).to.contain('&gt;');
  });

  it('should sanitize the output of executable scripts', function () {
    const scriptBefore = '<script></script>';
    const scriptAfter = mustacheBrowser.toHtmlEntitiesAndLinks(scriptBefore);

    expect(scriptBefore).to.contain('<script');
    expect(scriptBefore).to.contain('</script');
    expect(scriptBefore).to.not.contain('&lt;script');
    expect(scriptBefore).to.not.contain('&lt;/script');
    expect(scriptAfter).to.not.contain('<script');
    expect(scriptAfter).to.not.contain('</script');
    expect(scriptAfter).to.contain('&lt;script');
    expect(scriptAfter).to.contain('&lt;/script');
  });

  it('should beautify the output by replacing each linebreak with a <br>', function () {
    expect(contentBefore).to.include('\n');
    expect(contentBefore).to.not.include('<br>');
    expect(contentAfter).to.not.include('\n');
    expect(contentAfter).to.include('<br>');
  });

  it('should beautify the output by replacing each indentation space with a &nbsp;', function () {
    expect(contentBefore).to.include('  ');
    expect(contentBefore).to.not.include('&nbsp;&nbsp;');
    expect(contentAfter).to.not.include('  ');
    expect(contentAfter).to.include('&nbsp;&nbsp;');
  });

  it('should beautify the output', function () {
    expect(contentAfter).to.equal(
      '&lt;html&gt;<br>&nbsp;&nbsp;&lt;head&gt;&lt;/head&gt;<br>&nbsp;&nbsp;&lt;body&gt;&lt;/body&gt;<br>' +
      '&lt;/html&gt;<br>');
  });

  it('should link Mustache partials', function () {
    const mustache = `<header class="test">
  {{> 02-components/00-global/00-header }}
</header>`;

    const htmlEntitiesAndLinks = mustacheBrowser.toHtmlEntitiesAndLinks(mustache);

    expect(htmlEntitiesAndLinks).to.contain('<a href="');
    expect(htmlEntitiesAndLinks).to.contain('</a>');
    expect(htmlEntitiesAndLinks).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; 02-components/00-global/00-header }}" class="fp-express">' +
      '{{&gt; 02-components/00-global/00-header }}</a><br>&lt;/header&gt;');
  });

  it('should strip parameters from linked Mustache partials', function () {
    const mustache = `<header class="test">
  {{> 02-components/00-global/00-header('partial?': true) }}
</header>`;
    const mustache1 = `<header class="test">
  {{> 02-components/00-global/00-header(
    'partial?': true,
    'multiline?': true
  ) }}
</header>`;
    const mustache2 = `<header class="test">
  {{> 02-components/00-global/00-header.mustache('partial?': true) }}
</header>`;
    const mustache3 = `<header class="test">
  {{> 02-components/00-global/00-header.mustache(
    'partial?': true,
    'multiline?': true
  ) }}
</header>`;
    const mustache4 = `<header class="test">
  {{> components-header('partial?': true) }}
</header>`;
    const mustache5 = `<header class="test">
  {{> components-header(
    'partial?': true,
    'multiline?': true
  ) }}
</header>`;

    const htmlEntitiesAndLinks = mustacheBrowser.toHtmlEntitiesAndLinks(mustache);
    const htmlEntitiesAndLinks1 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache1);
    const htmlEntitiesAndLinks2 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache2);
    const htmlEntitiesAndLinks3 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache3);
    const htmlEntitiesAndLinks4 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache4);
    const htmlEntitiesAndLinks5 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache5);

    expect(htmlEntitiesAndLinks).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; 02-components/00-global/00-header }}" class="fp-express">' +
      '{{&gt; 02-components/00-global/00-header(\'partial?\': true) }}</a><br>&lt;/header&gt;');
    expect(htmlEntitiesAndLinks1).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; 02-components/00-global/00-header }}" class="fp-express">' +
      '{{&gt; 02-components/00-global/00-header(<br>&nbsp;&nbsp;&nbsp;&nbsp;\'partial?\': true,<br>' +
      '&nbsp;&nbsp;&nbsp;&nbsp;\'multiline?\': true<br>&nbsp;&nbsp;) }}</a><br>&lt;/header&gt;');
    expect(htmlEntitiesAndLinks2).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; 02-components/00-global/00-header.mustache }}" class="fp-express">' +
      '{{&gt; 02-components/00-global/00-header.mustache(\'partial?\': true) }}</a><br>&lt;/header&gt;');
    expect(htmlEntitiesAndLinks3).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; 02-components/00-global/00-header.mustache }}" class="fp-express">' +
      '{{&gt; 02-components/00-global/00-header.mustache(<br>&nbsp;&nbsp;&nbsp;&nbsp;\'partial?\': true,<br>' +
      '&nbsp;&nbsp;&nbsp;&nbsp;\'multiline?\': true<br>&nbsp;&nbsp;) }}</a><br>&lt;/header&gt;');
    expect(htmlEntitiesAndLinks4).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; components-header }}" class="fp-express">' +
      '{{&gt; components-header(\'partial?\': true) }}</a><br>&lt;/header&gt;');
    expect(htmlEntitiesAndLinks5).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; components-header }}" class="fp-express">' +
      '{{&gt; components-header(<br>&nbsp;&nbsp;&nbsp;&nbsp;\'partial?\': true,<br>' +
      '&nbsp;&nbsp;&nbsp;&nbsp;\'multiline?\': true<br>&nbsp;&nbsp;) }}</a><br>&lt;/header&gt;');
  });

  it('should strip styleModifiers from linked Mustache partials', function () {
    const mustache = `<header class="test">
  {{> 02-components/00-global/00-header:styleModified }}
</header>`;
    const mustache1 = `<header class="test">
  {{> 02-components/00-global/00-header:styleModified|stylesModified }}
</header>`;
    const mustache2 = `<header class="test">
  {{> 02-components/00-global/00-header.mustache:styleModified }}
</header>`;
    const mustache3 = `<header class="test">
  {{> 02-components/00-global/00-header.mustache:styleModified|stylesModified }}
</header>`;
    const mustache4 = `<header class="test">
  {{> components-header:styleModified }}
</header>`;
    const mustache5 = `<header class="test">
  {{> components-header:styleModified|stylesModified }}
</header>`;

    const htmlEntitiesAndLinks = mustacheBrowser.toHtmlEntitiesAndLinks(mustache);
    const htmlEntitiesAndLinks1 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache1);
    const htmlEntitiesAndLinks2 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache2);
    const htmlEntitiesAndLinks3 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache3);
    const htmlEntitiesAndLinks4 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache4);
    const htmlEntitiesAndLinks5 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache5);

    expect(htmlEntitiesAndLinks).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; 02-components/00-global/00-header}}" class="fp-express">' +
      '{{&gt; 02-components/00-global/00-header:styleModified }}</a><br>&lt;/header&gt;');
    expect(htmlEntitiesAndLinks1).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; 02-components/00-global/00-header}}" class="fp-express">' +
      '{{&gt; 02-components/00-global/00-header:styleModified|stylesModified }}</a><br>&lt;/header&gt;');
    expect(htmlEntitiesAndLinks2).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; 02-components/00-global/00-header.mustache}}" class="fp-express">' +
      '{{&gt; 02-components/00-global/00-header.mustache:styleModified }}</a><br>&lt;/header&gt;');
    expect(htmlEntitiesAndLinks3).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; 02-components/00-global/00-header.mustache}}" class="fp-express">' +
      '{{&gt; 02-components/00-global/00-header.mustache:styleModified|stylesModified }}</a><br>&lt;/header&gt;');
    expect(htmlEntitiesAndLinks4).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; components-header}}" class="fp-express">' +
      '{{&gt; components-header:styleModified }}</a><br>&lt;/header&gt;');
    expect(htmlEntitiesAndLinks5).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; components-header}}" class="fp-express">' +
      '{{&gt; components-header:styleModified|stylesModified }}</a><br>&lt;/header&gt;');
  });

  it('should strip parameters and styleModifiers from Mustache partials that contain both', function () {
    const mustache = `<header class="test">
  {{> 02-components/00-global/00-header:styleModified('partial?': true) }}
</header>`;
    const mustache1 = `<header class="test">
  {{> 02-components/00-global/00-header:styleModified(
    'partial?': true,
    'multiline?': true
  ) }}
</header>`;
    const mustache2 = `<header class="test">
  {{> 02-components/00-global/00-header:styleModified|stylesModified('partial?': true) }}
</header>`;
    const mustache3 = `<header class="test">
  {{> 02-components/00-global/00-header:styleModified|stylesModified(
    'partial?': true,
    'multiline?': true
  ) }}
</header>`;
    const mustache4 = `<header class="test">
  {{> 02-components/00-global/00-header.mustache:styleModified('partial?': true) }}
</header>`;
    const mustache5 = `<header class="test">
  {{> 02-components/00-global/00-header.mustache:styleModified(
    'partial?': true,
    'multiline?': true
  ) }}
</header>`;
    const mustache6 = `<header class="test">
  {{> 02-components/00-global/00-header.mustache:styleModified|stylesModified('partial?': true) }}
</header>`;
    const mustache7 = `<header class="test">
  {{> 02-components/00-global/00-header.mustache:styleModified|stylesModified(
    'partial?': true,
    'multiline?': true
  ) }}
</header>`;
    const mustache8 = `<header class="test">
  {{> components-header:styleModified('partial?': true) }}
</header>`;
    const mustache9 = `<header class="test">
  {{> components-header:styleModified(
    'partial?': true,
    'multiline?': true
  ) }}
</header>`;
    const mustache10 = `<header class="test">
  {{> components-header:styleModified|stylesModified('partial?': true) }}
</header>`;
    const mustache11 = `<header class="test">
  {{> components-header:styleModified|stylesModified(
    'partial?': true,
    'multiline?': true
  ) }}
</header>`;

    const htmlEntitiesAndLinks = mustacheBrowser.toHtmlEntitiesAndLinks(mustache);
    const htmlEntitiesAndLinks1 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache1);
    const htmlEntitiesAndLinks2 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache2);
    const htmlEntitiesAndLinks3 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache3);
    const htmlEntitiesAndLinks4 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache4);
    const htmlEntitiesAndLinks5 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache5);
    const htmlEntitiesAndLinks6 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache6);
    const htmlEntitiesAndLinks7 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache7);
    const htmlEntitiesAndLinks8 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache8);
    const htmlEntitiesAndLinks9 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache9);
    const htmlEntitiesAndLinks10 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache10);
    const htmlEntitiesAndLinks11 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache11);

    expect(htmlEntitiesAndLinks).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; 02-components/00-global/00-header}}" class="fp-express">' +
      '{{&gt; 02-components/00-global/00-header:styleModified(\'partial?\': true) }}</a><br>&lt;/header&gt;');
    expect(htmlEntitiesAndLinks1).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; 02-components/00-global/00-header}}" class="fp-express">' +
      '{{&gt; 02-components/00-global/00-header:styleModified(<br>&nbsp;&nbsp;&nbsp;&nbsp;\'partial?\': true,<br>' +
      '&nbsp;&nbsp;&nbsp;&nbsp;\'multiline?\': true<br>&nbsp;&nbsp;) }}</a><br>&lt;/header&gt;');
    expect(htmlEntitiesAndLinks2).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; 02-components/00-global/00-header}}" class="fp-express">' +
      '{{&gt; 02-components/00-global/00-header:styleModified|stylesModified(\'partial?\': true) }}</a><br>' +
      '&lt;/header&gt;');
    expect(htmlEntitiesAndLinks3).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; 02-components/00-global/00-header}}" class="fp-express">' +
      '{{&gt; 02-components/00-global/00-header:styleModified|stylesModified(<br>' +
      '&nbsp;&nbsp;&nbsp;&nbsp;\'partial?\': true,<br>&nbsp;&nbsp;&nbsp;&nbsp;\'multiline?\': true<br>' +
      '&nbsp;&nbsp;) }}</a><br>&lt;/header&gt;');
    expect(htmlEntitiesAndLinks4).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; 02-components/00-global/00-header.mustache}}" class="fp-express">' +
      '{{&gt; 02-components/00-global/00-header.mustache:styleModified(\'partial?\': true) }}</a><br>&lt;/header&gt;');
    expect(htmlEntitiesAndLinks5).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; 02-components/00-global/00-header.mustache}}" class="fp-express">' +
      '{{&gt; 02-components/00-global/00-header.mustache:styleModified(<br>' +
      '&nbsp;&nbsp;&nbsp;&nbsp;\'partial?\': true,<br>&nbsp;&nbsp;&nbsp;&nbsp;\'multiline?\': true<br>' +
      '&nbsp;&nbsp;) }}</a><br>&lt;/header&gt;');
    expect(htmlEntitiesAndLinks6).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; 02-components/00-global/00-header.mustache}}" class="fp-express">' +
      '{{&gt; 02-components/00-global/00-header.mustache:styleModified|stylesModified(\'partial?\': true) }}</a><br>' +
      '&lt;/header&gt;');
    expect(htmlEntitiesAndLinks7).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; 02-components/00-global/00-header.mustache}}" class="fp-express">' +
      '{{&gt; 02-components/00-global/00-header.mustache:styleModified|stylesModified(<br>' +
      '&nbsp;&nbsp;&nbsp;&nbsp;\'partial?\': true,<br>&nbsp;&nbsp;&nbsp;&nbsp;\'multiline?\': true<br>' +
      '&nbsp;&nbsp;) }}</a><br>&lt;/header&gt;');
    expect(htmlEntitiesAndLinks8).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; components-header}}" class="fp-express">' +
      '{{&gt; components-header:styleModified(\'partial?\': true) }}</a><br>&lt;/header&gt;');
    expect(htmlEntitiesAndLinks9).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; components-header}}" class="fp-express">' +
      '{{&gt; components-header:styleModified(<br>' +
      '&nbsp;&nbsp;&nbsp;&nbsp;\'partial?\': true,<br>&nbsp;&nbsp;&nbsp;&nbsp;\'multiline?\': true<br>' +
      '&nbsp;&nbsp;) }}</a><br>&lt;/header&gt;');
    expect(htmlEntitiesAndLinks10).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; components-header}}" class="fp-express">' +
      '{{&gt; components-header:styleModified|stylesModified(\'partial?\': true) }}</a><br>&lt;/header&gt;');
    expect(htmlEntitiesAndLinks11).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; components-header}}" class="fp-express">' +
      '{{&gt; components-header:styleModified|stylesModified(<br>' +
      '&nbsp;&nbsp;&nbsp;&nbsp;\'partial?\': true,<br>&nbsp;&nbsp;&nbsp;&nbsp;\'multiline?\': true<br>' +
      '&nbsp;&nbsp;) }}</a><br>&lt;/header&gt;');
  });
});
