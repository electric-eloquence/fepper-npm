'use strict';

const expect = require('chai').expect;
const fs = require('fs-extra');
const html2json = require('html2json').html2json;

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
<body>
<section id="one" class="test">Foo</section>
<section id="two" class="test">Bar</section>
<section class="test">Foot</section>
<section class="test">Barf</section>
<section class="test">Bazm</section>
<section>Fooz</section>
<section>Barz</section>
<section>Bazz</section>
<script></script>
<br>
<div></div>
<p></p>
<textarea></textarea>
<!-- comment -->
</body>
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

      expect(targetHtmlObj.all).to.equal(`<section id="one" class="test">Foo</section>
<!-- BEGIN ARRAY ELEMENT 1 -->
<section id="two" class="test">Bar</section>
<!-- BEGIN ARRAY ELEMENT 2 -->
<section class="test">Foot</section>
<!-- BEGIN ARRAY ELEMENT 3 -->
<section class="test">Barf</section>
<!-- BEGIN ARRAY ELEMENT 4 -->
<section class="test">Bazm</section>
`);
      expect(targetHtmlObj.single).to.equal('<section id="one" class="test">Foo</section>\n');
    });

    it('should get one selector of a given class if given an index', function () {
      const html2jsonObj = htmlScraperPost.elementSelect('.test[1]', jsonFromHtmlConst);
      const targetHtmlObj = htmlScraperPost.targetHtmlGet(html2jsonObj);

      expect(targetHtmlObj.all).to.equal('<section id="two" class="test">Bar</section>\n');
      expect(targetHtmlObj.single).to.equal('<section id="two" class="test">Bar</section>\n');
    });

    it('should get one selector of a given id', function () {
      const jsonFromHtml = html2json(htmlConst);
      const html2jsonObj = htmlScraperPost.elementSelect('#one', jsonFromHtml);
      const targetHtmlObj = htmlScraperPost.targetHtmlGet(html2jsonObj);

      expect(targetHtmlObj.all).to.equal('<section id="one" class="test">Foo</section>\n');
      expect(targetHtmlObj.single).to.equal('<section id="one" class="test">Foo</section>\n');
    });

    it('should get all selectors of a given tagname if given no index', function () {
      const jsonFromHtml = html2json(htmlConst);
      const html2jsonObj = htmlScraperPost.elementSelect('section', jsonFromHtml);
      const targetHtmlObj = htmlScraperPost.targetHtmlGet(html2jsonObj);

      expect(targetHtmlObj.all).to.equal(`<section id="one" class="test">Foo</section>
<!-- BEGIN ARRAY ELEMENT 1 -->
<section id="two" class="test">Bar</section>
<!-- BEGIN ARRAY ELEMENT 2 -->
<section class="test">Foot</section>
<!-- BEGIN ARRAY ELEMENT 3 -->
<section class="test">Barf</section>
<!-- BEGIN ARRAY ELEMENT 4 -->
<section class="test">Bazm</section>
<!-- BEGIN ARRAY ELEMENT 5 -->
<section>Fooz</section>
<!-- BEGIN ARRAY ELEMENT 6 -->
<section>Barz</section>
<!-- BEGIN ARRAY ELEMENT 7 -->
<section>Bazz</section>
`);
      expect(targetHtmlObj.single).to.equal('<section id="one" class="test">Foo</section>\n');
    });

    it('should get one selector of a given tagname if given an index', function () {
      const jsonFromHtml = html2json(htmlConst);
      const html2jsonObj = htmlScraperPost.elementSelect('section[1]', jsonFromHtml);
      const targetHtmlObj = htmlScraperPost.targetHtmlGet(html2jsonObj);

      expect(targetHtmlObj.all).to.equal('<section id="two" class="test">Bar</section>\n');
      expect(targetHtmlObj.single).to.equal('<section id="two" class="test">Bar</section>\n');
    });
  });

  describe('HTML Sanitizer', function () {
    const htmlSan = htmlScraperPost.htmlSanitize(htmlConst);

    it('should replace script tags with code tags', function () {
      expect(htmlSan).to.equal(`
<body>
<section id="one" class="test">Foo</section>
<section id="two" class="test">Bar</section>
<section class="test">Foot</section>
<section class="test">Barf</section>
<section class="test">Bazm</section>
<section>Fooz</section>
<section>Barz</section>
<section>Bazz</section>
<code></code>
<br>
<div></div>
<p></p>
<figure></figure>
<!-- comment -->
</body>
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
      expect(jsons.jsonForData.scrape[0].section).to.equal('Fooz');
      expect(jsons.jsonForData.scrape[0].section_1).to.equal('Barz');
      expect(jsons.jsonForData.scrape[0].section_2).to.equal('Bazz');
      expect(typeof jsons.jsonForData.scrape[0].body).to.equal('undefined');
      expect(typeof jsons.jsonForData.scrape[0].script).to.equal('undefined');
      expect(typeof jsons.jsonForData.scrape[0].br).to.equal('undefined');
      expect(typeof jsons.jsonForData.scrape[0].div).to.equal('undefined');
      expect(typeof jsons.jsonForData.scrape[0].p).to.equal('undefined');
      expect(typeof jsons.jsonForData.scrape[0].textarea).to.equal('undefined');
    });


    it('should create multiple array elements when the selector targets multiple DOM elements', function () {
      const htmlVar = `
<section class="test">Foo</section>
<section class="test">Bar</section>
<section class="test">Foot</section>
<section class="test">Barf</section>
<section class="test">Bazm</section>
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
<section id="test1">Foot</section>
<section id="test2">
  <div class="nested">
    <div class="nested-further">Barf</div>
  </div>
</section>
<section id="test3">Bazm</section>
`;

      const jsonFromHtml = html2json(htmlVar);
      const html2jsonObj = htmlScraperPost.elementSelect('#test2', jsonFromHtml);
      const targetHtmlObj = htmlScraperPost.targetHtmlGet(html2jsonObj);
      const targetHtml = htmlScraperPost.htmlSanitize(targetHtmlObj.all);
      const jsonForData = htmlScraperPost.htmlToJsons(targetHtml).jsonForData;

      expect(targetHtml).to.equal(`<section id="test2">
  <div class="nested">
    <div class="nested-further">Barf</div>
  </div>
</section>
`);
      expect(jsonForData).to.be.an('object');
      expect(jsonForData.scrape[0].nested_further).to.equal('Barf');
    });
  });

  describe('JSON to Mustache Converter', function () {
    it('should return HTML with Mustache tags', function () {
      const mustache = htmlScraperPost.jsonToMustache(jsons.jsonForMustache, jsons.jsonForData);

      expect(mustache).to.equal(`{{# scrape }}
  <body>
    <section id="one" class="test">{{ one }}</section>
    <section id="two" class="test">{{ two }}</section>
    <section class="test">{{ test }}</section>
    <section class="test">{{ test_1 }}</section>
    <section class="test">{{ test_2 }}</section>
    <section>{{ section }}</section>
    <section>{{ section_1 }}</section>
    <section>{{ section_2 }}</section>
    <script></script>
    <br />
    <div></div>
    <p></p>
    <textarea></textarea>
    <!-- comment -->
  </body>
{{/ scrape }}
`);
    });
  });

  describe('File Writer', function () {
    after(function () {
      fs.unlinkSync(scrapeDir + '/0-test.1_2');
    });

    it('should validate user-submitted filename', function () {
      const validFilename = '0-test.1_2';
      const invalidChar = '0-test.1_2!';
      const invalidHyphenPrefix = '-0-test.1_2';
      const invalidPeriodPrefix = '.0-test.1_2';
      const invalidUnderscorePrefix = '_0-test.1_2';

      expect(htmlScraperPost.filenameValidate(validFilename)).to.equal(true);
      expect(htmlScraperPost.filenameValidate(invalidChar)).to.equal(false);
      expect(htmlScraperPost.filenameValidate(invalidHyphenPrefix)).to.equal(false);
      expect(htmlScraperPost.filenameValidate(invalidPeriodPrefix)).to.equal(false);
      expect(htmlScraperPost.filenameValidate(invalidUnderscorePrefix)).to.equal(false);
    });

    it('should correctly format newlines in file body', function () {
      const mustache = '{{# scrape }}\r\n  <body>\r\n    <section id="one" class="test">{{ test_5 }}</section>\r\n    <section id="two" class="test">{{ test_6 }}</section>\r\n    <script/>\r\n    <textarea/>\r\n  </body>\r\n{{/ scrape }}';

      expect(htmlScraperPost.newlineFormat(mustache)).to.equal(`{{# scrape }}
  <body>
    <section id="one" class="test">{{ test_5 }}</section>
    <section id="two" class="test">{{ test_6 }}</section>
    <script/>
    <textarea/>
  </body>
{{/ scrape }}
`);
    });

    it('should write file to destination', function () {
      const fileMustache =
`{{# scrape }}
  <body>
    <section id="one" class="test">{{ test_5 }}</section>
    <section id="two" class="test">{{ test_6 }}</section>
    <script/>
    <textarea/>
  </body>
{{/ scrape }}
`;
      const fileJson = htmlScraperPost.newlineFormat(JSON.stringify(jsons.jsonForData, null, 2));
      const fileName = '0-test.1_2';
      const fileFullPath = scrapeDir + '/' + fileName;

      fs.ensureDirSync(scrapeDir);
      fs.writeFileSync(fileFullPath, '');
      const fileBefore = fs.readFileSync(fileFullPath);
      htmlScraperPost.filesWrite(scrapeDir, fileName, fileMustache, fileJson, null);
      const fileAfter = fs.readFileSync(fileFullPath);

      expect(fileAfter).to.not.equal('');
      expect(fileAfter).to.not.equal(fileBefore);
    });
  });
});
