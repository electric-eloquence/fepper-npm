'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

const {
  patternlab
} = require('../init')();
const frontMatterParser = require('../../core/lib/front-matter-parser');

describe('Front Matter Parser', function () {
  it('converts standard Front Matter into an array of objects', function () {
    const annotationFile = `${patternlab.config.paths.source.annotations}/annotation.md`;
    const annotationStr = fs.readFileSync(annotationFile, patternlab.config.enc);
    const annotationsArr = frontMatterParser.main(annotationStr);

    expect(annotationsArr[0].el).to.equal('#nav');
    expect(annotationsArr[0].title).to.equal('Navigation');
    expect(annotationsArr[0].annotation).to.equal('<p>Navigation for responsive web experiences can be tricky.</p>\n');
  });

  it('parses .md files with Pattern Lab standard annotation delimiters', function () {
    const annotationFile = `${patternlab.config.paths.source.annotations}/multiple.md`;
    const annotationsStr = fs.readFileSync(annotationFile, patternlab.config.enc);
    const annotationsArr = frontMatterParser.main(annotationsStr);

    expect(annotationsArr[0].el).to.equal('.zero');
    expect(annotationsArr[0].title).to.equal('Zero');
    expect(annotationsArr[0].annotation).to.equal('<p>Zee ee are oh.</p>\n');

    expect(annotationsArr[1].el).to.equal('.one');
    expect(annotationsArr[1].title).to.equal('One');
    expect(annotationsArr[1].annotation).to.equal('<p>Oh en ee.</p>\n');

    expect(annotationsArr[2].el).to.equal('.two');
    expect(annotationsArr[2].title).to.equal('Two');
    expect(annotationsArr[2].annotation).to.equal('<p>Tee double-you oh.</p>\n');
  });

  describe('patternBuilder.setState()', function () {
    before(function () {
      // Run prep and follow-through for patternBuilder.setState(). However do not fully build given that that will
      // delete necessary pattern object fields.
      patternlab.preProcessAllPatterns(patternlab.config.paths.source.patterns);
    });

    it('applies patternState when the .md file matches a primary pattern and it contains a "state" key', function () {
      const statePattern = patternlab.getPattern('test-foo');

      expect(statePattern.patternState).to.equal('complete');
    });

    it('applies patternState when the .md file matches a pseudo-pattern and it contains a "state" key', function () {
      const statePattern = patternlab.getPattern('test-foo-pseudo');

      expect(statePattern.patternState).to.equal('inreview');
    });

    it('applies patternState when the .md file has additional keys besides "state"', function () {
      const frontMatterPattern = patternlab.getPattern('test1-simple');

      expect(frontMatterPattern.patternState).to.equal('inprogress');
    });

    it('applies patternState when the .md file matches a pseudo-pattern with a hidden primary', function () {
      const frontMatterPattern = patternlab.getPattern('test-hidden-pattern-state');

      expect(frontMatterPattern.patternState).to.equal('complete');
    });

    it('applies patternState when the .md file matches a pseudo-pattern with a hidden primary, and the .md file has \
a "content_key" Front Matter field and Markdown content', function () {
      const frontMatterPattern = patternlab.getPattern('test-hidden-pattern-content-w-state');

      expect(frontMatterPattern.patternState).to.equal('inreview');
    });
  });

  describe('patternlab.build()', function () {
    const dataJs = `${patternlab.config.paths.public.styleguide}/scripts/ui/data.js`;
    let dataJsExistsBefore;
    let dataJsExistsAfter;

    before(function () {
      if (fs.existsSync(dataJs)) {
        fs.removeSync(dataJs);
      }

      dataJsExistsBefore = fs.existsSync(dataJs);

      patternlab.build();

      dataJsExistsAfter = fs.existsSync(dataJs);

      const dataJsStr = fs.readFileSync(dataJs, patternlab.config.enc).replace(/export const /g, 'global.');

      eval(dataJsStr); // eslint-disable-line no-eval
    });

    it('writes data.js to the fepper-ui/scripts/ui directory', function () {
      expect(dataJsExistsBefore).to.be.false;
      expect(dataJsExistsAfter).to.be.true;
    });

    // These patternState tests are similar to the tests in the patternlab.setState() block. However, these check that
    // data.js was written correctly and can only be tested after patternlab.build().
    it('applies patternState when the .md file matches a primary pattern and it contains a "state" key', function () {
      expect(global.navItems.patternTypes[0].patternTypeItems[0].patternPartial).to.equal('test-foo');
      expect(global.navItems.patternTypes[0].patternTypeItems[0].patternState).to.equal('complete');
    });

    it('applies patternState when the .md file matches a pseudo-pattern and it contains a "state" key', function () {
      expect(global.navItems.patternTypes[0].patternTypeItems[1].patternPartial).to.equal('test-foo-pseudo');
      expect(global.navItems.patternTypes[0].patternTypeItems[1].patternState).to.equal('inreview');
    });

    it('applies patternState when the .md file has additional keys besides "state"', function () {
      expect(global.navItems.patternTypes[1].patternTypeItems[0].patternPartial).to.equal('test1-simple');
      expect(global.navItems.patternTypes[1].patternTypeItems[0].patternState).to.equal('inprogress');
    });

    it('applies patternState when the .md file matches a pseudo-pattern with a hidden primary', function () {
      expect(global.navItems.patternTypes[0].patternTypeItems[16].patternPartial).to.equal('test-hidden-pattern-state');
      expect(global.navItems.patternTypes[0].patternTypeItems[16].patternState).to.equal('complete');
    });

    it('applies patternState when the .md file matches a pseudo-pattern with a hidden primary, and the .md file has \
a "content_key" Front Matter field and Markdown content', function () {
      expect(global.navItems.patternTypes[0].patternTypeItems[14].patternPartial)
        .to.equal('test-hidden-pattern-content-w-state');
      expect(global.navItems.patternTypes[0].patternTypeItems[14].patternState).to.equal('inreview');
    });

    it('parses .md files with a "content_key" Front Matter field and Markdown content, and builds html for primary \
patterns', function () {
      const mdFile = `${patternlab.config.paths.source.patterns}/01-test1/05-markdown-content.md`;
      const mdFileStr = fs.readFileSync(mdFile, patternlab.config.enc);
      const publicHtml = patternlab.config.paths.public.patterns +
        '/01-test1-05-markdown-content/01-test1-05-markdown-content.html';
      const publicHtmlStr = fs.readFileSync(publicHtml, patternlab.config.enc);

      expect(mdFileStr).to.equal(`---
content_key: content
---
# Hero

## Sub

Dagwood
`);
      expect(publicHtmlStr).to.have.string(`<!DOCTYPE html>
<html class="">
<head>
  <title></title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <meta name="generator" content="Fepper Front End Prototyper (http://fepper.io)">

  <!-- Disable cache -->
  <meta http-equiv="cache-control" content="max-age=0">
  <meta http-equiv="cache-control" content="no-cache">
  <meta http-equiv="expires" content="0">
  <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT">
  <meta http-equiv="pragma" content="no-cache">

  <!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->
<link rel="stylesheet" href="../../webserved/pattern.css">
<script src="../../node_modules/mousetrap/mousetrap.min.js"></script>
<script src="../../annotations/annotations.js"></script>
<!-- End Pattern Lab -->


  <link rel="stylesheet" href="../../_styles/bld/style.css" media="all">
</head>
<body class="">
<div class="msg"></div>  <h1 id="hero">Hero</h1>
<h2 id="sub">Sub</h2>
<p>Dagwood</p>
  
<!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->
<script type="text/json" id="sg-pattern-data-footer" class="sg-pattern-data">
`);
    });

    it('parses .md files with a "content_key" Front Matter field and Markdown content, and builds html for pseudo-\
patterns', function () {
      const mdFile = `${patternlab.config.paths.source.patterns}/01-test1/05-markdown-content~pseudo.md`;
      const mdFileStr = fs.readFileSync(mdFile, patternlab.config.enc);
      const publicHtml = patternlab.config.paths.public.patterns +
        '/01-test1-05-markdown-content-pseudo/01-test1-05-markdown-content-pseudo.html';
      const publicHtmlStr = fs.readFileSync(publicHtml, patternlab.config.enc);

      expect(mdFileStr).to.equal(`---
content_key: content
---
# Hero

## Sub

Dagwood
`);
      expect(publicHtmlStr).to.have.string(`<!DOCTYPE html>
<html class="">
<head>
  <title></title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <meta name="generator" content="Fepper Front End Prototyper (http://fepper.io)">

  <!-- Disable cache -->
  <meta http-equiv="cache-control" content="max-age=0">
  <meta http-equiv="cache-control" content="no-cache">
  <meta http-equiv="expires" content="0">
  <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT">
  <meta http-equiv="pragma" content="no-cache">

  <!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->
<link rel="stylesheet" href="../../webserved/pattern.css">
<script src="../../node_modules/mousetrap/mousetrap.min.js"></script>
<script src="../../annotations/annotations.js"></script>
<!-- End Pattern Lab -->


  <link rel="stylesheet" href="../../_styles/bld/style.css" media="all">
</head>
<body class="">
<div class="msg">This is a pseudo-pattern.</div>  <h1 id="hero">Hero</h1>
<h2 id="sub">Sub</h2>
<p>Dagwood</p>
  
<!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->
<script type="text/json" id="sg-pattern-data-footer" class="sg-pattern-data">
`);
    });

    it('parses .md files with a "content_key" Front Matter field and Markdown content, and builds html for pseudo-\
patterns with hidden primaries', function () {
      const mdFile = `${patternlab.config.paths.source.patterns}/00-test/hidden-pattern~content.md`;
      const mdFileStr = fs.readFileSync(mdFile, patternlab.config.enc);
      const publicHtml = patternlab.config.paths.public.patterns +
        '/00-test-hidden-pattern-content/00-test-hidden-pattern-content.html';
      const publicHtmlStr = fs.readFileSync(publicHtml, patternlab.config.enc);

      expect(mdFileStr).to.equal(`---
content_key: content
---
# Hero

## Sub

Dagwood
`);
      /* eslint-disable max-len */
      expect(publicHtmlStr).to.have.string(`<!DOCTYPE html>
<html class="">
<head>
  <title></title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <meta name="generator" content="Fepper Front End Prototyper (http://fepper.io)">

  <!-- Disable cache -->
  <meta http-equiv="cache-control" content="max-age=0">
  <meta http-equiv="cache-control" content="no-cache">
  <meta http-equiv="expires" content="0">
  <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT">
  <meta http-equiv="pragma" content="no-cache">

  <!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->
<link rel="stylesheet" href="../../webserved/pattern.css">
<script src="../../node_modules/mousetrap/mousetrap.min.js"></script>
<script src="../../annotations/annotations.js"></script>
<!-- End Pattern Lab -->


  <link rel="stylesheet" href="../../_styles/bld/style.css" media="all">
</head>
<body class="">
<div class="msg">This is a pseudo-pattern.</div>  <div>These aren't the patterns you are looking for.</div>  <h1 id="hero">Hero</h1>
<h2 id="sub">Sub</h2>
<p>Dagwood</p>
  
<!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->
<script type="text/json" id="sg-pattern-data-footer" class="sg-pattern-data">
`);
      /* eslint-enable max-len */
    });

    it('parses .md files with a "content_key" Front Matter field and Markdown content, and a "state" Front Matter \
field, and builds html for pseudo-patterns with hidden primaries', function () {
      const mdFile = `${patternlab.config.paths.source.patterns}/00-test/hidden-pattern~content-w-state.md`;
      const mdFileStr = fs.readFileSync(mdFile, patternlab.config.enc);
      const publicHtml = patternlab.config.paths.public.patterns +
        '/00-test-hidden-pattern-content-w-state/00-test-hidden-pattern-content-w-state.html';
      const publicHtmlStr = fs.readFileSync(publicHtml, patternlab.config.enc);

      expect(mdFileStr).to.equal(`---
content_key: content
state: inreview
---
# Hero

## Sub

Dagwood
`);
      /* eslint-disable max-len */
      expect(publicHtmlStr).to.have.string(`<!DOCTYPE html>
<html class="">
<head>
  <title></title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <meta name="generator" content="Fepper Front End Prototyper (http://fepper.io)">

  <!-- Disable cache -->
  <meta http-equiv="cache-control" content="max-age=0">
  <meta http-equiv="cache-control" content="no-cache">
  <meta http-equiv="expires" content="0">
  <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT">
  <meta http-equiv="pragma" content="no-cache">

  <!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->
<link rel="stylesheet" href="../../webserved/pattern.css">
<script src="../../node_modules/mousetrap/mousetrap.min.js"></script>
<script src="../../annotations/annotations.js"></script>
<!-- End Pattern Lab -->


  <link rel="stylesheet" href="../../_styles/bld/style.css" media="all">
</head>
<body class="">
<div class="msg">This is a pseudo-pattern.</div>  <div>These aren't the patterns you are looking for.</div>  <h1 id="hero">Hero</h1>
<h2 id="sub">Sub</h2>
<p>Dagwood</p>
  
<!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->
<script type="text/json" id="sg-pattern-data-footer" class="sg-pattern-data">
`);
      /* eslint-enable max-len */
    });

    it('parses .md files with a "content_key" Front Matter field and Markdown content, and builds html even if the \
.md file also contains an annotation', function () {
      const mdFile = `${patternlab.config.paths.source.patterns}/01-test1/06-markdown-content-w-annot.md`;
      const mdFileStr = fs.readFileSync(mdFile, patternlab.config.enc);
      const publicHtml = patternlab.config.paths.public.patterns +
        '/01-test1-06-markdown-content-w-annot/01-test1-06-markdown-content-w-annot.html';
      const publicHtmlStr = fs.readFileSync(publicHtml, patternlab.config.enc);

      expect(mdFileStr).to.equal(`---
content_key: content
---
# Hero

## Sub

Dagwood
~*~
---
el: #main
title: Main
---
Main content
`);
      expect(publicHtmlStr).to.have.string(`<!DOCTYPE html>
<html class="">
<head>
  <title></title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <meta name="generator" content="Fepper Front End Prototyper (http://fepper.io)">

  <!-- Disable cache -->
  <meta http-equiv="cache-control" content="max-age=0">
  <meta http-equiv="cache-control" content="no-cache">
  <meta http-equiv="expires" content="0">
  <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT">
  <meta http-equiv="pragma" content="no-cache">

  <!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->
<link rel="stylesheet" href="../../webserved/pattern.css">
<script src="../../node_modules/mousetrap/mousetrap.min.js"></script>
<script src="../../annotations/annotations.js"></script>
<!-- End Pattern Lab -->


  <link rel="stylesheet" href="../../_styles/bld/style.css" media="all">
</head>
<body class="">
<main id="main">  <h1 id="hero">Hero</h1>
<h2 id="sub">Sub</h2>
<p>Dagwood</p>
  </main>  
<!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->
<script type="text/json" id="sg-pattern-data-footer" class="sg-pattern-data">
`);
    });

    it('parses .md files with "content_key" Front Matter field and Markdown content, and builds the html even if \
patternExtension is configured to come before .md alphabetically', function () {
      const configOrig = JSON.parse(JSON.stringify(patternlab.config));
      const mdFile = `${patternlab.config.paths.source.patterns}/01-test1/07-markdown-content-out-of-order.md`;
      const mdFileStr = fs.readFileSync(mdFile, patternlab.config.enc);

      patternlab.build({patternExtension: '.fpt'});

      const publicHtml = patternlab.config.paths.public.patterns +
        '/01-test1-07-markdown-content-out-of-order/01-test1-07-markdown-content-out-of-order.html';
      const publicHtmlStr = fs.readFileSync(publicHtml, patternlab.config.enc);

      expect(mdFileStr).to.equal(`---
content_key: content
---
# Hero

## Sub

Dagwood
`);
      expect(publicHtmlStr).to.have.string(`<!DOCTYPE html>
<html class="">
<head>
  <title></title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <meta name="generator" content="Fepper Front End Prototyper (http://fepper.io)">

  <!-- Disable cache -->
  <meta http-equiv="cache-control" content="max-age=0">
  <meta http-equiv="cache-control" content="no-cache">
  <meta http-equiv="expires" content="0">
  <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT">
  <meta http-equiv="pragma" content="no-cache">

  <!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->
<link rel="stylesheet" href="../../webserved/pattern.css">
<script src="../../node_modules/mousetrap/mousetrap.min.js"></script>
<script src="../../annotations/annotations.js"></script>
<!-- End Pattern Lab -->


  <link rel="stylesheet" href="../../_styles/bld/style.css" media="all">
</head>
<body class="">
<h1 id="hero">Hero</h1>
<h2 id="sub">Sub</h2>
<p>Dagwood</p>
  
<!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->
<script type="text/json" id="sg-pattern-data-footer" class="sg-pattern-data">
`);

      patternlab.resetConfig(configOrig);
    });

    it('gracefully handles exceptions when trying to parse Front Matter', function () {
      const malformedMd = `${patternlab.config.paths.source.patterns}/01-test1/09-front-matter.md`;

      fs.copySync(`${malformedMd}-malformed`, malformedMd);
      patternlab.build();

      const malformedMdStr = fs.readFileSync(malformedMd, patternlab.config.enc);
      const publicHtml = patternlab.config.paths.public.patterns +
        '/01-test1-09-front-matter/01-test1-09-front-matter.html';
      const publicHtmlStr = fs.readFileSync(publicHtml, patternlab.config.enc);

      expect(malformedMdStr).to.have.string('content_key: "content\n');
      /* eslint-disable max-len */
      expect(publicHtmlStr).to.equal(`<!DOCTYPE html>
<html class="">
<head>
  <title></title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <meta name="generator" content="Fepper Front End Prototyper (http://fepper.io)">

  <!-- Disable cache -->
  <meta http-equiv="cache-control" content="max-age=0">
  <meta http-equiv="cache-control" content="no-cache">
  <meta http-equiv="expires" content="0">
  <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT">
  <meta http-equiv="pragma" content="no-cache">

  <!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->
<link rel="stylesheet" href="../../webserved/pattern.css">
<script src="../../node_modules/mousetrap/mousetrap.min.js"></script>
<script src="../../annotations/annotations.js"></script>
<!-- End Pattern Lab -->


  <link rel="stylesheet" href="../../_styles/bld/style.css" media="all">
</head>
<body class="">
<div class="content"></div>  
<!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->
<script type="text/json" id="sg-pattern-data-footer" class="sg-pattern-data">
  {"lineage":[],"lineageExists":false,"lineageR":[],"lineageRExists":false,"missingPartials":[],"patternDesc":"","patternExtension":".mustache","patternName":"Front Matter","patternPartial":"test1-front-matter","patternState":"","portReloader":35729,"portServer":3000}
</script>

<script>
  // LiveReload.
  if (location.protocol !== 'file:') {
    const reloader = document.createElement('script');

    reloader.setAttribute('src', location.protocol + '//' + location.hostname + ':35729/livereload.js');
    document.body.appendChild(reloader);
  }
</script>

<script src="../../node_modules/fepper-ui/scripts/pattern/index.js" type="module"></script>
<!-- End Pattern Lab -->


  <script src="../../_scripts/src/variables.styl" type="text/javascript"></script>
</body>
</html>
`);
      /* eslint-enable max-len */
      fs.removeSync(malformedMd);
    });
  });
});
