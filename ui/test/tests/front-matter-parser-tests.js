'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

const {
  patternlab
} = require('../init')();
const frontMatterParser = require('../../core/lib/front-matter-parser');

// Get test patterns.
const statePattern = patternlab.getPattern('test-foo');
const frontMatterPattern = patternlab.getPattern('test1-simple');

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
    it('applies patternState when the .md file matches its pattern and it contains a "state" key', function () {
      expect(statePattern.patternState).to.equal('complete');
    });

    it('applies patternState when the .md file has additional keys besides "state"', function () {
      expect(frontMatterPattern.patternState).to.equal('inprogress');
    });
  });

  describe('patternlab.build()', function () {
    const annotationsJs = `${patternlab.config.paths.public.annotations}/annotations.js`;
    let annotationsJsExistsBefore;
    let annotations;

    before(function () {
      if (fs.existsSync(annotationsJs)) {
        fs.removeSync(annotationsJs);
      }

      annotationsJsExistsBefore = fs.existsSync(annotationsJs);

      patternlab.build();
      require(annotationsJs);

      annotations = global.annotations;
    });

    it('writes annotations.js', function () {
      const annotationsJsExistsAfter = fs.existsSync(annotationsJs);

      expect(annotationsJsExistsBefore).to.be.false;

      expect(annotationsJsExistsAfter).to.be.true;
    });

    it('parses the Front Matter files in the source/_annotations directory', function () {
      expect(annotations[0].el).to.equal('#nav');
      expect(annotations[0].title).to.equal('Navigation');
      expect(annotations[0].annotation).to.equal('<p>Navigation for responsive web experiences can be tricky.</p>\n');

      expect(annotations[1].el).to.equal('.zero');
      expect(annotations[1].title).to.equal('Zero');
      expect(annotations[1].annotation).to.equal('<p>Zee ee are oh.</p>\n');

      expect(annotations[2].el).to.equal('.one');
      expect(annotations[2].title).to.equal('One');
      expect(annotations[2].annotation).to.equal('<p>Oh en ee.</p>\n');

      expect(annotations[3].el).to.equal('.two');
      expect(annotations[3].title).to.equal('Two');
      expect(annotations[3].annotation).to.equal('<p>Tee double-you oh.</p>\n');
    });

    it('parses the Front Matter files in the source patterns directory', function () {
      expect(annotations[4].state).to.equal('complete');

      const expectation5 = `<h2 id="front-matter-with-annotations">Front Matter with annotations</h2>
<p>Foo cannot get simpler than Bar, amiright?</p>
`;

      expect(annotations[5].el).to.equal('#bar');
      expect(annotations[5].title).to.equal('Bar');
      expect(annotations[5].annotation).to.equal(expectation5);

      const expectation6 = `<h2 id="state-and-multiple-annotations">State and multiple annotations</h2>
<p>This pattern&#39;s .md file has both annotations and state.</p>
`;

      expect(annotations[6].el).to.equal('#title');
      expect(annotations[6].state).to.equal('inprogress');
      expect(annotations[6].title).to.equal('Title');
      expect(annotations[6].annotation).to.equal(expectation6);

      expect(annotations[7].el).to.equal('#message');
      expect(annotations[7].title).to.equal('Message');
      expect(annotations[7].annotation).to.equal('<p>This pattern has a message.</p>\n');
    });

    it('parses .md files with "content_key" Front Matter field and Markdown content, and builds the html', function () {
      const mdFile = `${patternlab.config.paths.source.patterns}/01-test1/05-markdown-content-no-annot.md`;
      const mdFileStr = fs.readFileSync(mdFile, 'utf8');
      const publicHtml = patternlab.config.paths.public.patterns +
        '/01-test1-05-markdown-content-no-annot/01-test1-05-markdown-content-no-annot.html';
      const publicHtmlStr = fs.readFileSync(publicHtml, 'utf8');

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
<link rel="stylesheet" href="../../node_modules/fepper-ui/styles/pattern.css">
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
    });

    it('parses .md files with "content_key" Front Matter field and Markdown content, and builds the html even if the \
.md file also contains an annotation', function () {
      const mdFile = `${patternlab.config.paths.source.patterns}/01-test1/06-markdown-content-with-annot.md`;
      const mdFileStr = fs.readFileSync(mdFile, 'utf8');
      const publicHtml = `${patternlab.config.paths.public.patterns}/01-test1-06-markdown-content-with-annot/01-test1-06-markdown-content-with-annot.html`;
      const publicHtmlStr = fs.readFileSync(publicHtml, 'utf8');

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
<link rel="stylesheet" href="../../node_modules/fepper-ui/styles/pattern.css">
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
      const mdFileStr = fs.readFileSync(mdFile, 'utf8');

      patternlab.build({patternExtension: '.fpt'});

      const publicHtml = patternlab.config.paths.public.patterns +
        '/01-test1-07-markdown-content-out-of-order/01-test1-07-markdown-content-out-of-order.html';
      const publicHtmlStr = fs.readFileSync(publicHtml, 'utf8');


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
<link rel="stylesheet" href="../../node_modules/fepper-ui/styles/pattern.css">
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
  });
});
