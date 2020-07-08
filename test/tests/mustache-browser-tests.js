'use strict';

const {expect} = require('chai');

const {
  fepper,
  responseFactory
} = require('../init')();
const mustacheBrowser = fepper.tcpIp.fpExpress.mustacheBrowser;

const ObjectFactory = require('../../ui/core/lib/object-factory');

describe('Mustache Browser', function () {
  let contentBefore;
  let contentAfter;

  before(function () {
    contentBefore = `<html>
  <head></head>
  <body></body>
</html>
`;
    contentAfter = mustacheBrowser.toHtmlEntitiesAndLinks(contentBefore);

    mustacheBrowser.ui.patternlab.build();
  });

  it('strips verbose, but without extension, Mustache partial tags to get query partials', function () {
    const partialTag = '{{> 02-components/00-global/00-header }}';
    const patternIdentifier = mustacheBrowser.stripPartialTag(partialTag);

    expect(partialTag).to.have.string('{{>');
    expect(partialTag).to.have.string('}}');
    expect(patternIdentifier).to.not.have.string('{{>');
    expect(patternIdentifier).to.not.have.string('}}');
    expect(patternIdentifier).to.equal('02-components/00-global/00-header');
  });

  it('strips verbose, with extension, Mustache partial tags to get query partials', function () {
    const partialTag = '{{> 02-components/00-global/00-header.mustache }}';
    const patternIdentifier = mustacheBrowser.stripPartialTag(partialTag);

    expect(partialTag).to.have.string('{{>');
    expect(partialTag).to.have.string('}}');
    expect(patternIdentifier).to.not.have.string('{{>');
    expect(patternIdentifier).to.not.have.string('}}');
    expect(patternIdentifier).to.equal('02-components/00-global/00-header.mustache');
  });

  it('strips shorthand Mustache partial tags to get query partials', function () {
    const partialTag = '{{> components-header }}';
    const patternIdentifier = mustacheBrowser.stripPartialTag(partialTag);

    expect(partialTag).to.have.string('{{>');
    expect(partialTag).to.have.string('}}');
    expect(patternIdentifier).to.not.have.string('{{>');
    expect(patternIdentifier).to.not.have.string('}}');
    expect(patternIdentifier).to.equal('components-header');
  });

  it('returns a Pattern object on submission of a verbose, but without extension, query partial', function () {
    const pattern = mustacheBrowser.getPattern('02-components/00-global/00-header');

    expect(pattern).to.be.instanceof(ObjectFactory.Pattern);
    expect(pattern.relPath).to.equal('02-components/00-global/00-header.mustache');
  });

  it('returns a Pattern object on submission of a verbose, with extension, query partial', function () {
    const pattern = mustacheBrowser.getPattern('02-components/00-global/00-header.mustache');

    expect(pattern).to.be.instanceof(ObjectFactory.Pattern);
    expect(pattern.relPath).to.equal('02-components/00-global/00-header.mustache');
  });

  it('returns a Pattern object on submission of a shorthand query partial', function () {
    const pattern = mustacheBrowser.getPattern('components-header');

    expect(pattern).to.be.instanceof(ObjectFactory.Pattern);
    expect(pattern.relPath).to.equal('02-components/00-global/00-header.mustache');
  });

  it('returns a Pattern object on submission of a verbose pseudo-pattern query partial', function () {
    const pattern = mustacheBrowser.getPattern('02-components/00-global/00-header~localhost');

    expect(pattern).to.be.instanceof(ObjectFactory.Pattern);
    expect(pattern.relPath).to.equal('02-components/00-global/00-header~localhost.json');
  });

  it('returns a Pattern object on submission of a shorthand pseudo-pattern query partial', function () {
    const pattern = mustacheBrowser.getPattern('components-header-localhost');

    expect(pattern).to.be.instanceof(ObjectFactory.Pattern);
    expect(pattern.relPath).to.equal('02-components/00-global/00-header~localhost.json');
  });

  it('returns a Pattern object on submission of a shorthand PHP syntax pseudo-pattern query partial\
', function () {
    const pattern = mustacheBrowser.getPattern('components-header~localhost');

    expect(pattern).to.be.instanceof(ObjectFactory.Pattern);
    expect(pattern.relPath).to.equal('02-components/00-global/00-header~localhost.json');
  });

  it('returns a null on submission of a no-result query partial', function () {
    const pattern = mustacheBrowser.getPattern('no-result');

    expect(pattern).to.be.null;
  });

  it('replaces angle brackets with HTML entities', function () {
    const htmlBefore = '<html></html>';
    const htmlAfter = mustacheBrowser.toHtmlEntitiesAndLinks(htmlBefore);

    expect(htmlBefore).to.have.string('<');
    expect(htmlBefore).to.have.string('>');
    expect(htmlBefore).to.not.have.string('&lt;');
    expect(htmlBefore).to.not.have.string('&gt;');
    expect(htmlAfter).to.not.have.string('>');
    expect(htmlAfter).to.not.have.string('<');
    expect(htmlAfter).to.have.string('&lt;');
    expect(htmlAfter).to.have.string('&gt;');
  });

  it('sanitizes the output of executable scripts', function () {
    const scriptBefore = '<script></script>';
    const scriptAfter = mustacheBrowser.toHtmlEntitiesAndLinks(scriptBefore);

    expect(scriptBefore).to.have.string('<script');
    expect(scriptBefore).to.have.string('</script');
    expect(scriptBefore).to.not.have.string('&lt;script');
    expect(scriptBefore).to.not.have.string('&lt;/script');
    expect(scriptAfter).to.not.have.string('<script');
    expect(scriptAfter).to.not.have.string('</script');
    expect(scriptAfter).to.have.string('&lt;script');
    expect(scriptAfter).to.have.string('&lt;/script');
  });

  it('beautifies the output by replacing each linebreak with a <br>', function () {
    expect(contentBefore).to.have.string('\n');
    expect(contentBefore).to.not.have.string('<br>');
    expect(contentAfter).to.not.have.string('\n');
    expect(contentAfter).to.have.string('<br>');
  });

  it('beautifies the output by replacing each indentation space with a &nbsp;', function () {
    expect(contentBefore).to.have.string('  ');
    expect(contentBefore).to.not.have.string('&nbsp;&nbsp;');
    expect(contentAfter).to.not.have.string('  ');
    expect(contentAfter).to.have.string('&nbsp;&nbsp;');
  });

  it('beautifies the output', function () {
    expect(contentAfter).to.equal(
      '&lt;html&gt;<br>&nbsp;&nbsp;&lt;head&gt;&lt;/head&gt;<br>&nbsp;&nbsp;&lt;body&gt;&lt;/body&gt;<br>' +
      '&lt;/html&gt;<br>');
  });

  it('links Mustache partials', function () {
    const mustache = `<header class="test">
  {{> 02-components/00-global/00-header }}
</header>`;

    const htmlEntitiesAndLinks = mustacheBrowser.toHtmlEntitiesAndLinks(mustache);

    expect(htmlEntitiesAndLinks).to.have.string('<a href="');
    expect(htmlEntitiesAndLinks).to.have.string('</a>');
    expect(htmlEntitiesAndLinks).to.equal('&lt;header class=&quot;test&quot;&gt;<br>' +
      '&nbsp;&nbsp;<a href="?partial={{&gt; 02-components/00-global/00-header }}" class="fp-express">' +
      '{{&gt; 02-components/00-global/00-header }}</a><br>&lt;/header&gt;');
  });

  it('strips parameters from linked Mustache partials', function () {
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

  it('strips styleModifiers from linked Mustache partials', function () {
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

  it('strips parameters and styleModifiers from Mustache partials that have.string both', function () {
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

  it('responds with the Mustache Browser if the "partial" query param is valid', function (done) {
    new Promise(
      (resolve) => {
        mustacheBrowser.main()(
          {
            query: {
              partial: 'components-header-localhost'
            }
          },
          responseFactory(resolve)
        );
      })
      .then((output) => {
        /* eslint-disable max-len */
        expect(output).to.equal(`
<!DOCTYPE html>
<html class="mustache-browser">
  <head>
    <title id="title">Fepper Mustache Browser</title>
    <meta charset="UTF-8">

    <!-- Disable cache -->
    <meta http-equiv="cache-control" content="max-age=0">
    <meta http-equiv="cache-control" content="no-cache">
    <meta http-equiv="expires" content="0">
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT">
    <meta http-equiv="pragma" content="no-cache">

    <!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->
<link rel="stylesheet" href="../../node_modules/fepper-ui/styles/pattern.css" media="all">
<script src="../../node_modules/mousetrap/mousetrap.min.js"></script>
<script src="../../annotations/annotations.js"></script>
<!-- End Pattern Lab -->


    <link rel="stylesheet" href="/fepper-core/style.css" media="all">
    <script src="../../node_modules/mousetrap/mousetrap.min.js"></script>
  </head>

  <body class="text ">
    <main id="" class="mustache-browser__result"><a href="#" class="fp-express mustache-browser__back" onclick="window.history.back();return false;">&#8678;</a><h2><a
            href="../patterns/02-components-00-global-00-header-localhost/02-components-00-global-00-header-localhost.html"
            class="fp-express mustache-browser__pattern-link">components-header-localhost</a></h2><a href="?partial={{&gt; 00-elements/02-images/00-logo.mustache }}" class="fp-express">{{&gt; 00-elements/02-images/00-logo.mustache }}</a><br><a href="?partial={{&gt; 02-components/03-navigation/00-primary-nav }}" class="fp-express">{{&gt; 02-components/03-navigation/00-primary-nav }}</a><br>
    </main>

    <!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->
<script type="text/json" id="sg-pattern-data-footer" class="sg-pattern-data">
  
</script>

<script>
  // LiveReload.
  const {protocol, hostname} = window.location;

  if (protocol !== 'file:') {
    const reloader = document.createElement('script');

    reloader.setAttribute('src', protocol + '//' + hostname + ':35729/livereload.js');
    document.body.appendChild(reloader);
  }
</script>

<script src="../../node_modules/fepper-ui/scripts/pattern/index.js" type="module"></script>
<!-- End Pattern Lab -->


  </body>
</html>`);
        /* eslint-enable max-len */
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('responds with a no result page if no "partial" query param', function (done) {
    new Promise(
      (resolve) => {
        mustacheBrowser.main()(
          {
            query: {
            }
          },
          responseFactory(resolve)
        );
      })
      .then((output) => {
        /* eslint-disable max-len */
        expect(output).to.equal(`
<!DOCTYPE html>
<html class="mustache-browser">
  <head>
    <title id="title">Fepper Mustache Browser</title>
    <meta charset="UTF-8">

    <!-- Disable cache -->
    <meta http-equiv="cache-control" content="max-age=0">
    <meta http-equiv="cache-control" content="no-cache">
    <meta http-equiv="expires" content="0">
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT">
    <meta http-equiv="pragma" content="no-cache">

    <!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->
<link rel="stylesheet" href="../../node_modules/fepper-ui/styles/pattern.css" media="all">
<script src="../../node_modules/mousetrap/mousetrap.min.js"></script>
<script src="../../annotations/annotations.js"></script>
<!-- End Pattern Lab -->


    <link rel="stylesheet" href="/fepper-core/style.css" media="all">
    <script src="../../node_modules/mousetrap/mousetrap.min.js"></script>
  </head>

  <body class="text ">
    <main id="" class="mustache-browser__no-result"><a href="#" class="fp-express mustache-browser__back" onclick="window.history.back();return false;">&#8678;</a><p>There is no pattern by that name. Please check its spelling:</p><code>undefined</code>
    </main>

    <!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->
<script type="text/json" id="sg-pattern-data-footer" class="sg-pattern-data">
  
</script>

<script>
  // LiveReload.
  const {protocol, hostname} = window.location;

  if (protocol !== 'file:') {
    const reloader = document.createElement('script');

    reloader.setAttribute('src', protocol + '//' + hostname + ':35729/livereload.js');
    document.body.appendChild(reloader);
  }
</script>

<script src="../../node_modules/fepper-ui/scripts/pattern/index.js" type="module"></script>
<!-- End Pattern Lab -->


  </body>
</html>`);
        /* eslint-enable max-len */
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('responds with the Mustache Browser if the "partial" query param is invalid', function (done) {
    new Promise(
      (resolve) => {
        mustacheBrowser.main()(
          {
            query: {
              partial: 'components-header-localhots'
            }
          },
          responseFactory(resolve)
        );
      })
      .then((output) => {
        /* eslint-disable max-len */
        expect(output).to.equal(`
<!DOCTYPE html>
<html class="mustache-browser">
  <head>
    <title id="title">Fepper Mustache Browser</title>
    <meta charset="UTF-8">

    <!-- Disable cache -->
    <meta http-equiv="cache-control" content="max-age=0">
    <meta http-equiv="cache-control" content="no-cache">
    <meta http-equiv="expires" content="0">
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT">
    <meta http-equiv="pragma" content="no-cache">

    <!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->
<link rel="stylesheet" href="../../node_modules/fepper-ui/styles/pattern.css" media="all">
<script src="../../node_modules/mousetrap/mousetrap.min.js"></script>
<script src="../../annotations/annotations.js"></script>
<!-- End Pattern Lab -->


    <link rel="stylesheet" href="/fepper-core/style.css" media="all">
    <script src="../../node_modules/mousetrap/mousetrap.min.js"></script>
  </head>

  <body class="text ">
    <main id="" class="mustache-browser__no-result"><a href="#" class="fp-express mustache-browser__back" onclick="window.history.back();return false;">&#8678;</a><p>There is no pattern by that name. Please check its spelling:</p><code>components-header-localhots</code>
    </main>

    <!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->
<script type="text/json" id="sg-pattern-data-footer" class="sg-pattern-data">
  
</script>

<script>
  // LiveReload.
  const {protocol, hostname} = window.location;

  if (protocol !== 'file:') {
    const reloader = document.createElement('script');

    reloader.setAttribute('src', protocol + '//' + hostname + ':35729/livereload.js');
    document.body.appendChild(reloader);
  }
</script>

<script src="../../node_modules/fepper-ui/scripts/pattern/index.js" type="module"></script>
<!-- End Pattern Lab -->


  </body>
</html>`);
        /* eslint-enable max-len */
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
