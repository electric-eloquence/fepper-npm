'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');
const {html2json} = require('html2json');

require('../init');

const fepper = global.fepper;
const {
  appDir,
  conf,
  rootDir,
  utils
} = fepper;

// Instantiating with null requests and responses, because we don't want actual response or redirect behavior.
const htmlScraperPost = new (require('../../core/tcp-ip/html-scraper-post'))(
  null,
  null,
  conf,
  fepper.tcpIp.fpExpress.gatekeeper,
  fepper.tcpIp.fpExpress.html,
  {appDir, rootDir, utils}
);
const req = {body: {target: '', url: ''}};
const scrapeDir = conf.ui.paths.source.scrape;

const htmlConst = `
<section>
<div id="one" class="test">Foo</div>
<div id="two" class="test">Bar</div>
<div class="test">Foot</div>
<div class="test">Barf</div>
<div class="test">Bazm</div>
<div>Fooz</div>
<div>Barz</div>
<div>Bazz</div>
<script></script>
<br>
<p></p>
<textarea></textarea>
<!-- comment -->
</section>
`;
const jsonFromHtmlConst = html2json(htmlConst);
const jsons = htmlScraperPost.htmlToJsons(htmlConst);

describe('HTML Scraper Post', function () {
  describe('CSS Selector Validator', function () {
    it('should identify the CSS class with no index', function () {
      const selector = '.class_test-0';
      const selectorObj = htmlScraperPost.selectorValidate(selector, null, req);

      expect(selectorObj.name).to.equal('.class_test-0');
      expect(selectorObj.index).to.equal(-1);
    });

    it('should identify the CSS class and index', function () {
      const selector = '.class_test-0[0]';
      const selectorObj = htmlScraperPost.selectorValidate(selector, null, req);

      expect(selectorObj.name).to.equal('.class_test-0');
      expect(selectorObj.index).to.equal(0);
    });

    it('should identify the CSS id with no index', function () {
      const selector = '#id_test-0';
      const selectorObj = htmlScraperPost.selectorValidate(selector, null, req);

      expect(selectorObj.name).to.equal('#id_test-0');
      expect(selectorObj.index).to.equal(-1);
    });

    it('should identify the CSS id and index', function () {
      const selector = '#id_test-0[1]';
      const selectorObj = htmlScraperPost.selectorValidate(selector, null, req);

      expect(selectorObj.name).to.equal('#id_test-0');
      expect(selectorObj.index).to.equal(1);
    });

    it('should identify the HTML tag with no index', function () {
      const selector = 'h1';
      const selectorObj = htmlScraperPost.selectorValidate(selector, null, req);

      expect(selectorObj.name).to.equal('h1');
      expect(selectorObj.index).to.equal(-1);
    });

    it('should identify the CSS id and index', function () {
      const selector = 'h1[2]';
      const selectorObj = htmlScraperPost.selectorValidate(selector, null, req);

      expect(selectorObj.name).to.equal('h1');
      expect(selectorObj.index).to.equal(2);
    });
  });

  describe('Target HTML Getter', function () {
    it('should get all selectors of a given class if given no index', function () {
      const html2jsonObj = htmlScraperPost.elementSelect('.test', jsonFromHtmlConst);
      const targetHtmlObj = htmlScraperPost.targetHtmlGet(html2jsonObj);

      expect(targetHtmlObj.all).to.equal(`<div id="one" class="test">Foo</div>
<!-- BEGIN ARRAY ELEMENT 1 -->
<div id="two" class="test">Bar</div>
<!-- BEGIN ARRAY ELEMENT 2 -->
<div class="test">Foot</div>
<!-- BEGIN ARRAY ELEMENT 3 -->
<div class="test">Barf</div>
<!-- BEGIN ARRAY ELEMENT 4 -->
<div class="test">Bazm</div>
`);
      expect(targetHtmlObj.single).to.equal('<div id="one" class="test">Foo</div>\n');
    });

    it('should get one selector of a given class if given an index', function () {
      const html2jsonObj = htmlScraperPost.elementSelect('.test[1]', jsonFromHtmlConst);
      const targetHtmlObj = htmlScraperPost.targetHtmlGet(html2jsonObj);

      expect(targetHtmlObj.all).to.equal('<div id="two" class="test">Bar</div>\n');
      expect(targetHtmlObj.single).to.equal('<div id="two" class="test">Bar</div>\n');
    });

    it('should get one selector of a given id', function () {
      const jsonFromHtml = html2json(htmlConst);
      const html2jsonObj = htmlScraperPost.elementSelect('#one', jsonFromHtml);
      const targetHtmlObj = htmlScraperPost.targetHtmlGet(html2jsonObj);

      expect(targetHtmlObj.all).to.equal('<div id="one" class="test">Foo</div>\n');
      expect(targetHtmlObj.single).to.equal('<div id="one" class="test">Foo</div>\n');
    });

    it('should get all selectors of a given tagname if given no index', function () {
      const jsonFromHtml = html2json(htmlConst);
      const html2jsonObj = htmlScraperPost.elementSelect('div', jsonFromHtml);
      const targetHtmlObj = htmlScraperPost.targetHtmlGet(html2jsonObj);

      expect(targetHtmlObj.all).to.equal(`<div id="one" class="test">Foo</div>
<!-- BEGIN ARRAY ELEMENT 1 -->
<div id="two" class="test">Bar</div>
<!-- BEGIN ARRAY ELEMENT 2 -->
<div class="test">Foot</div>
<!-- BEGIN ARRAY ELEMENT 3 -->
<div class="test">Barf</div>
<!-- BEGIN ARRAY ELEMENT 4 -->
<div class="test">Bazm</div>
<!-- BEGIN ARRAY ELEMENT 5 -->
<div>Fooz</div>
<!-- BEGIN ARRAY ELEMENT 6 -->
<div>Barz</div>
<!-- BEGIN ARRAY ELEMENT 7 -->
<div>Bazz</div>
`);
      expect(targetHtmlObj.single).to.equal('<div id="one" class="test">Foo</div>\n');
    });

    it('should get one selector of a given tagname if given an index', function () {
      const jsonFromHtml = html2json(htmlConst);
      const html2jsonObj = htmlScraperPost.elementSelect('div[1]', jsonFromHtml);
      const targetHtmlObj = htmlScraperPost.targetHtmlGet(html2jsonObj);

      expect(targetHtmlObj.all).to.equal('<div id="two" class="test">Bar</div>\n');
      expect(targetHtmlObj.single).to.equal('<div id="two" class="test">Bar</div>\n');
    });
  });

  describe('HTML Sanitizer', function () {
    const htmlSan = htmlScraperPost.htmlSanitize(htmlConst);

    it('should replace script tags with code tags', function () {
      expect(htmlSan).to.equal(`
<section>
<div id="one" class="test">Foo</div>
<div id="two" class="test">Bar</div>
<div class="test">Foot</div>
<div class="test">Barf</div>
<div class="test">Bazm</div>
<div>Fooz</div>
<div>Barz</div>
<div>Bazz</div>
<code></code>
<br>
<p></p>
<figure></figure>
<!-- comment -->
</section>
`);
      expect(htmlConst).to.contain('script');
      expect(htmlConst).to.not.contain('code');
      expect(htmlSan).to.not.contain('script');
      expect(htmlSan).to.contain('code');
    });

    it('should replace textarea tags with figure tags', function () {
      expect(htmlConst).to.contain('textarea');
      expect(htmlConst).to.not.contain('figure');
      expect(htmlSan).to.not.contain('textarea');
      expect(htmlSan).to.contain('figure');
    });
  });

  describe('HTML Converter', function () {
    it('should return a JSON object', function () {
      expect(jsons.jsonForMustache).to.be.an('object');
      expect(jsons.jsonForMustache).to.not.be.empty;
    });

    it('should return an array', function () {
      expect(jsons.jsonForData).to.be.an('object');
      expect(jsons.jsonForData).to.not.be.empty;
    });
  });

  describe('HTML to JSON Converter', function () {
    it('should return a JSON object of data pulled from non-empty elements', function () {
      expect(jsons.jsonForData).to.be.an('object');
      expect(jsons.jsonForData.scrape[0].one).to.equal('Foo');
      expect(jsons.jsonForData.scrape[0].two).to.equal('Bar');
      expect(jsons.jsonForData.scrape[0].test).to.equal('Foot');
      expect(jsons.jsonForData.scrape[0].test_1).to.equal('Barf');
      expect(jsons.jsonForData.scrape[0].test_2).to.equal('Bazm');
      expect(jsons.jsonForData.scrape[0].div).to.equal('Fooz');
      expect(jsons.jsonForData.scrape[0].div_1).to.equal('Barz');
      expect(jsons.jsonForData.scrape[0].div_2).to.equal('Bazz');
      expect(jsons.jsonForData.scrape[0].section).to.be.undefined;
      expect(jsons.jsonForData.scrape[0].script).to.be.undefined;
      expect(jsons.jsonForData.scrape[0].br).to.be.undefined;
      expect(jsons.jsonForData.scrape[0].p).to.be.undefined;
      expect(jsons.jsonForData.scrape[0].textarea).to.be.undefined;
    });


    it('should create multiple array elements when the selector targets multiple DOM elements', function () {
      const htmlVar = `
<div class="test">Foo</div>
<div class="test">Bar</div>
<div class="test">Foot</div>
<div class="test">Barf</div>
<div class="test">Bazm</div>
`;
      const jsonFromHtml = html2json(htmlVar);
      const html2jsonObj = htmlScraperPost.elementSelect('.test', jsonFromHtml);
      const targetHtmlObj = htmlScraperPost.targetHtmlGet(html2jsonObj);
      const targetHtml = htmlScraperPost.htmlSanitize(targetHtmlObj.all);
      const jsonForData = htmlScraperPost.htmlToJsons(targetHtml).jsonForData;

      expect(jsonForData).to.be.an('object');
      expect(jsonForData.scrape[0].test).to.equal('Foo');
      expect(jsonForData.scrape[1].test).to.equal('Bar');
      expect(jsonForData.scrape[2].test).to.equal('Foot');
      expect(jsonForData.scrape[3].test).to.equal('Barf');
      expect(jsonForData.scrape[4].test).to.equal('Bazm');
    });


    it('should recursively retrieve nested HTML data from within a selected element', function () {
      const htmlVar = `
<div id="test1">Foot</div>
<div id="test2">
  <div class="nested">
    <div class="nested-further">Barf</div>
  </div>
</div>
<div id="test3">Bazm</div>
`;

      const jsonFromHtml = html2json(htmlVar);
      const html2jsonObj = htmlScraperPost.elementSelect('#test2', jsonFromHtml);
      const targetHtmlObj = htmlScraperPost.targetHtmlGet(html2jsonObj);
      const targetHtml = htmlScraperPost.htmlSanitize(targetHtmlObj.all);
      const jsonForData = htmlScraperPost.htmlToJsons(targetHtml).jsonForData;

      expect(targetHtml).to.equal(`<div id="test2">
  <div class="nested">
    <div class="nested-further">Barf</div>
  </div>
</div>
`);
      expect(jsonForData).to.be.an('object');
      expect(jsonForData.scrape[0].nested_further).to.equal('Barf');
    });
  });

  describe('JSON to Mustache Converter', function () {
    it('should return HTML with Mustache tags', function () {
      const mustache = htmlScraperPost.jsonToMustache(jsons.jsonForMustache, jsons.jsonForData);

      expect(mustache).to.equal(`{{# scrape }}
  <section>
    <div id="one" class="test">{{ one }}</div>
    <div id="two" class="test">{{ two }}</div>
    <div class="test">{{ test }}</div>
    <div class="test">{{ test_1 }}</div>
    <div class="test">{{ test_2 }}</div>
    <div>{{ div }}</div>
    <div>{{ div_1 }}</div>
    <div>{{ div_2 }}</div>
    <script></script>
    <br />
    <p></p>
    <textarea></textarea>
    <!-- comment -->
  </section>
{{/ scrape }}
`);
    });
  });

  describe('File Writer', function () {
    const fileName = '0-test.1_2';
    const fileFullPath = scrapeDir + '/' + fileName;
    let mustache;
    let jsonStr;

    before(function () {
      mustache = htmlScraperPost.htmlSanitize(htmlScraperPost.jsonToMustache(jsons.jsonForMustache, jsons.jsonForData));
      jsonStr = JSON.stringify(jsons.jsonForData, null, 2) + '\n';
    });

    after(function () {
      fs.unlinkSync(fileFullPath);
    });

    it('should validate user-submitted filename', function () {
      const validFilename = '0-test.1_2';
      const invalidChar = '0-test.1_2!';
      const invalidHyphenPrefix = '-0-test.1_2';
      const invalidPeriodPrefix = '.0-test.1_2';
      const invalidUnderscorePrefix = '_0-test.1_2';

      expect(htmlScraperPost.filenameValidate(validFilename)).to.be.true;
      expect(htmlScraperPost.filenameValidate(invalidChar)).to.be.false;
      expect(htmlScraperPost.filenameValidate(invalidHyphenPrefix)).to.be.false;
      expect(htmlScraperPost.filenameValidate(invalidPeriodPrefix)).to.be.false;
      expect(htmlScraperPost.filenameValidate(invalidUnderscorePrefix)).to.be.false;
    });

    it('should correctly format newlines in file body', function () {
      const mustacheWithCR = mustache.replace(/\n/g, '\r\n');

      expect(mustache).to.not.equal(mustacheWithCR);
      expect(mustache).to.not.contain('\r');
      expect(mustacheWithCR).to.contain('\r');
      expect(htmlScraperPost.newlineFormat(mustacheWithCR)).to.equal(mustache);
    });

    it('should correctly format newlines in stringified json', function () {
      const jsonStrWithCR = jsonStr.replace(/\n/g, '\r\n');

      expect(jsonStr).to.not.equal(jsonStrWithCR);
      expect(jsonStr).to.not.contain('\r');
      expect(jsonStrWithCR).to.contain('\r');
      expect(htmlScraperPost.newlineFormat(jsonStrWithCR)).to.equal(jsonStr);
    });

    it('should write file to destination', function () {
      fs.ensureDirSync(scrapeDir);
      fs.writeFileSync(fileFullPath, '');
      const fileBefore = fs.readFileSync(fileFullPath, conf.enc);
      htmlScraperPost.filesWrite(scrapeDir, fileName, mustache, jsonStr);
      const fileAfter = fs.readFileSync(fileFullPath + '.mustache', conf.enc);

      expect(fileBefore).to.equal('');
      expect(fileAfter).to.not.equal(fileBefore);
    });
  });
});
