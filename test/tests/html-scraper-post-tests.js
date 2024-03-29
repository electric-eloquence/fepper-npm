'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');
const {html2json} = require('html2json');

const {
  fepper,
  responseFactory
} = require('../init')();
const {
  conf,
  rootDir
} = fepper;
const opener = fepper.tasks.opener;

const HtmlScraperPost = require('../../core/tcp-ip/html-scraper-post');

const htmlConst = `<section>
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
</section>`;
const jsonStrConst = `{
  "one": "Foo",
  "two": "Bar",
  "test": "Foot",
  "test_1": "Barf",
  "test_2": "Bazm",
  "div": "Fooz",
  "div_1": "Barz",
  "div_2": "Bazz"
}`;
const jsonFromHtmlConst = html2json(htmlConst);
const mustacheConst = `&lt;section&gt;
  &lt;div id="one" class="test"&gt;{{ one }}&lt;/div&gt;
  &lt;div id="two" class="test"&gt;{{ two }}&lt;/div&gt;
  &lt;div class="test"&gt;{{ test }}&lt;/div&gt;
  &lt;div class="test"&gt;{{ test_1 }}&lt;/div&gt;
  &lt;div class="test"&gt;{{ test_2 }}&lt;/div&gt;
  &lt;div&gt;{{ div }}&lt;/div&gt;
  &lt;div&gt;{{ div_1 }}&lt;/div&gt;
  &lt;div&gt;{{ div_2 }}&lt;/div&gt;
  &lt;code&gt;&lt;/code&gt;
  &lt;br /&gt;
  &lt;p&gt;&lt;/p&gt;
  &lt;figure&gt;&lt;/figure&gt;
  &lt;!-- comment --&gt;
&lt;/section&gt;`;
const scrapeDir = conf.ui.paths.source.scrape;
const scrapeFile0 = '0-test.1_0';
const scrapeFile1 = '0-test.1_1';
const scrapeFile2 = '0-test.1_2';
const scrapeFile0Json = `${scrapeDir}/${scrapeFile0}.json`;
const scrapeFile1Json = `${scrapeDir}/${scrapeFile1}.json`;
const scrapeFile2Json = `${scrapeDir}/${scrapeFile2}.json`;
const scrapeFile0Mustache = `${scrapeDir}/${scrapeFile0}.mustache`;
const scrapeFile1Mustache = `${scrapeDir}/${scrapeFile1}.mustache`;
const scrapeFile2Mustache = `${scrapeDir}/${scrapeFile2}.mustache`;
const timestampFile = `${rootDir}/.timestamp`;

describe('HTML Scraper Post', function () {
  let htmlScraperPost;
  let jsons;
  let scrapeLimitTimeOrig;

  before(function () {
    htmlScraperPost = new HtmlScraperPost(
      null,
      null,
      fepper.tcpIp.fpExpress
    );
    jsons = htmlScraperPost.htmlToJsons(htmlConst);
    scrapeLimitTimeOrig = conf.scrape.limit_time;
  });

  after(function () {
    fs.removeSync(scrapeFile0Json);
    fs.removeSync(scrapeFile0Mustache);
    fs.removeSync(scrapeFile1Json);
    fs.removeSync(scrapeFile1Mustache);
    fs.removeSync(scrapeFile2Json);
    fs.removeSync(scrapeFile2Mustache);
  });

  describe('.selectorObjectify()', function () {
    it('identifies the CSS class with no index', function () {
      const selector = '.class_test-0';
      const selectorObj = htmlScraperPost.selectorObjectify(selector, '');

      expect(selectorObj.name).to.equal('class_test-0');
      expect(selectorObj.index).to.equal(-1);
      expect(selectorObj.type).to.equal('class');
    });

    // Selection by array notation happens on the client-side, but leaving test as legacy for a sense of completeness.
    it('identifies the CSS class and index', function () {
      const selector = '.class_test-0[0]';
      const selectorObj = htmlScraperPost.selectorObjectify(selector, '0');

      expect(selectorObj.name).to.equal('class_test-0');
      expect(selectorObj.index).to.equal(0);
      expect(selectorObj.type).to.equal('class');
    });

    it('identifies the CSS id with no index', function () {
      const selector = '#id_test-0';
      const selectorObj = htmlScraperPost.selectorObjectify(selector, '');

      expect(selectorObj.name).to.equal('id_test-0');
      expect(selectorObj.index).to.equal(-1);
      expect(selectorObj.type).to.equal('id');
    });

    // Selection by array notation happens on the client-side, but leaving test as legacy for a sense of completeness.
    it('identifies the CSS id and index', function () {
      const selector = '#id_test-0[1]';
      const selectorObj = htmlScraperPost.selectorObjectify(selector, '1');

      expect(selectorObj.name).to.equal('id_test-0');
      expect(selectorObj.index).to.equal(1);
      expect(selectorObj.type).to.equal('id');
    });

    it('identifies the HTML tag with no index', function () {
      const selector = 'h1';
      const selectorObj = htmlScraperPost.selectorObjectify(selector, '');

      expect(selectorObj.name).to.equal('h1');
      expect(selectorObj.index).to.equal(-1);
      expect(selectorObj.type).to.equal('tag');
    });

    // Selection by array notation happens on the client-side, but leaving test as legacy for a sense of completeness.
    it('identifies the CSS id and index', function () {
      const selector = 'h1[2]';
      const selectorObj = htmlScraperPost.selectorObjectify(selector, '2');

      expect(selectorObj.name).to.equal('h1');
      expect(selectorObj.index).to.equal(2);
      expect(selectorObj.type).to.equal('tag');
    });
  });

  describe('.targetHtmlGet()', function () {
    it('gets all selectors of a given class if given no index', function () {
      const selectorObj = {
        name: 'test',
        index: -1,
        type: 'class'
      };
      const html2jsonObj = htmlScraperPost.elementsSelect(selectorObj, jsonFromHtmlConst);
      const targetHtmlObj = htmlScraperPost.targetHtmlGet(html2jsonObj);

      expect(targetHtmlObj.all).to.equal(`<div id="one" class="test">Foo</div>
<!-- SCRAPER SELECTION 1 -->
<div id="two" class="test">Bar</div>
<!-- SCRAPER SELECTION 2 -->
<div class="test">Foot</div>
<!-- SCRAPER SELECTION 3 -->
<div class="test">Barf</div>
<!-- SCRAPER SELECTION 4 -->
<div class="test">Bazm</div>
`);
      expect(targetHtmlObj.single).to.equal('<div id="one" class="test">Foo</div>\n');
    });

    it('gets one selector of a given class if given an index', function () {
      const selectorObj = {
        name: 'test',
        index: 1,
        type: 'class'
      };
      const html2jsonObj = htmlScraperPost.elementsSelect(selectorObj, jsonFromHtmlConst);
      const targetHtmlObj = htmlScraperPost.targetHtmlGet(html2jsonObj);

      expect(targetHtmlObj.all).to.equal('<div id="two" class="test">Bar</div>\n');
      expect(targetHtmlObj.single).to.equal('<div id="two" class="test">Bar</div>\n');
    });

    it('gets one selector of a given id', function () {
      const selectorObj = {
        name: 'one',
        index: -1,
        type: 'id'
      };
      const jsonFromHtml = html2json(htmlConst);
      const html2jsonObj = htmlScraperPost.elementsSelect(selectorObj, jsonFromHtml);
      const targetHtmlObj = htmlScraperPost.targetHtmlGet(html2jsonObj);

      expect(targetHtmlObj.all).to.equal('<div id="one" class="test">Foo</div>\n');
      expect(targetHtmlObj.single).to.equal('<div id="one" class="test">Foo</div>\n');
    });

    it('gets all selectors of a given tagname if given no index', function () {
      const selectorObj = {
        name: 'div',
        index: -1,
        type: 'tag'
      };
      const jsonFromHtml = html2json(htmlConst);
      const html2jsonObj = htmlScraperPost.elementsSelect(selectorObj, jsonFromHtml);
      const targetHtmlObj = htmlScraperPost.targetHtmlGet(html2jsonObj);

      expect(targetHtmlObj.all).to.equal(`<div id="one" class="test">Foo</div>
<!-- SCRAPER SELECTION 1 -->
<div id="two" class="test">Bar</div>
<!-- SCRAPER SELECTION 2 -->
<div class="test">Foot</div>
<!-- SCRAPER SELECTION 3 -->
<div class="test">Barf</div>
<!-- SCRAPER SELECTION 4 -->
<div class="test">Bazm</div>
<!-- SCRAPER SELECTION 5 -->
<div>Fooz</div>
<!-- SCRAPER SELECTION 6 -->
<div>Barz</div>
<!-- SCRAPER SELECTION 7 -->
<div>Bazz</div>
`);
      expect(targetHtmlObj.single).to.equal('<div id="one" class="test">Foo</div>\n');
    });

    it('gets one selector of a given tagname if given an index', function () {
      const selectorObj = {
        name: 'div',
        index: 1,
        type: 'tag'
      };
      const jsonFromHtml = html2json(htmlConst);
      const html2jsonObj = htmlScraperPost.elementsSelect(selectorObj, jsonFromHtml);
      const targetHtmlObj = htmlScraperPost.targetHtmlGet(html2jsonObj);

      expect(targetHtmlObj.all).to.equal('<div id="two" class="test">Bar</div>\n');
      expect(targetHtmlObj.single).to.equal('<div id="two" class="test">Bar</div>\n');
    });
  });

  describe('.htmlSanitize()', function () {
    let htmlSan;

    before(function () {
      htmlSan = htmlScraperPost.htmlSanitize(htmlConst);
    });

    it('replaces script tags with code tags', function () {
      expect(htmlSan).to.equal(`<section>
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
</section>`);
      expect(htmlConst).to.have.string('script');
      expect(htmlConst).to.not.have.string('code');
      expect(htmlSan).to.not.have.string('script');
      expect(htmlSan).to.have.string('code');
    });

    it('replaces textarea tags with figure tags', function () {
      expect(htmlConst).to.have.string('textarea');
      expect(htmlConst).to.not.have.string('figure');
      expect(htmlSan).to.not.have.string('textarea');
      expect(htmlSan).to.have.string('figure');
    });
  });

  describe('.htmlToJsons()', function () {
    it('returns a JSON object', function () {
      expect(jsons.jsonForMustache).to.be.an('object');
      expect(jsons.jsonForMustache).to.not.be.empty;
    });

    it('returns an array', function () {
      expect(jsons.jsonForData).to.be.an('object');
      expect(jsons.jsonForData).to.not.be.empty;
    });

    it('returns a JSON object of data pulled from non-empty elements', function () {
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

    it('creates multiple array elements when the selector targets multiple DOM elements', function () {
      const htmlVar = `
<div class="test">Foo</div>
<div class="test">Bar</div>
<div class="test">Foot</div>
<div class="test">Barf</div>
<div class="test">Bazm</div>
`;
      const selectorObj = {
        name: 'test',
        index: -1,
        type: 'class'
      };
      const jsonFromHtml = html2json(htmlVar);
      const html2jsonObj = htmlScraperPost.elementsSelect(selectorObj, jsonFromHtml);
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

    it('recursively retrieves nested HTML data from within a selected element', function () {
      const htmlVar = `
<div id="test1">Foot</div>
<div id="test2">
  <div class="nested">
    <div class="nested-further">Barf</div>
  </div>
</div>
<div id="test3">Bazm</div>
`;
      const selectorObj = {
        name: 'test2',
        index: -1,
        type: 'id'
      };
      const jsonFromHtml = html2json(htmlVar);
      const html2jsonObj = htmlScraperPost.elementsSelect(selectorObj, jsonFromHtml);
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

  describe('.jsonToMustache()', function () {
    it('returns HTML with Mustache tags', function () {
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

  describe('.main()', function () {
    let timestampFromFile;

    before(function () {
      fs.removeSync(scrapeFile0Json);
      fs.removeSync(scrapeFile0Mustache);
      fs.removeSync(scrapeFile1Json);
      fs.removeSync(scrapeFile1Mustache);
      fs.removeSync(timestampFile);

      scrapeLimitTimeOrig = conf.scrape.limit_time;
      conf.scrape.limit_time = 1000;
      timestampFromFile = opener.timestamp();
    });

    after(function () {
      fs.removeSync(timestampFile);
    });

    it('redirects with error message if invalid filename is submitted', function (done) {
      const invalidChar = '0-test.1_0!';

      new Promise(
        (resolve) => {
          const htmlScraperPost = new HtmlScraperPost(
            {
              body: {
                filename: invalidChar,
                json: jsonStrConst,
                mustache: mustacheConst
              },
              cookies: {
                fepper_ts: timestampFromFile
              }
            },
            responseFactory(resolve),
            fepper.tcpIp.fpExpress
          );

          htmlScraperPost.main();
        })
        .then((response) => {
          expect(response.status).to.equal(303);
          // eslint-disable-next-line max-len
          expect(response.headers.Location).to.equal('/html-scraper?msg_class=error&message=ERROR!%20Invalid%20filename!&url=&selector_raw=');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it(
      'redirects with success message if valid filename, json, and mustache are submitted, and within limit',
      function (done) {
        new Promise(
          (resolve) => {
            const htmlScraperPost = new HtmlScraperPost(
              {
                body: {
                  filename: scrapeFile0,
                  json: jsonStrConst,
                  mustache: mustacheConst
                },
                cookies: {
                  fepper_ts: timestampFromFile
                }
              },
              responseFactory(resolve),
              fepper.tcpIp.fpExpress
            );

            htmlScraperPost.main();
          })
          .then((response) => {
            expect(response.status).to.equal(303);
            // eslint-disable-next-line max-len
            expect(response.headers.Location).to.equal('/html-scraper?msg_class=success&message=SUCCESS!%20Refresh%20the%20browser%20to%20check%20that%20your%20template%20appears%20under%20the%20%26quot%3BScrape%26quot%3B%20menu.&url=&selector_raw=');
            done();
          })
          .catch((err) => {
            done(err);
          });
      }
    );

    it(
      'redirects with error message if valid filename, json, and mustache are submitted, but limit is exceeded',
      function (done) {
        new Promise(
          (resolve) => {
            const htmlScraperPost = new HtmlScraperPost(
              {
                body: {
                  filename: scrapeFile1,
                  json: jsonStrConst,
                  mustache: mustacheConst
                },
                cookies: {
                  fepper_ts: timestampFromFile
                }
              },
              responseFactory(resolve),
              fepper.tcpIp.fpExpress
            );

            htmlScraperPost.main();
          })
          .then((response) => {
            expect(response.status).to.equal(303);
            // eslint-disable-next-line max-len
            expect(response.headers.Location).to.equal('/html-scraper?msg_class=error&message=ERROR!%20Too%20many%20requests%20per%20minute!&url=&selector_raw=');
            done();
          })
          .catch((err) => {
            done(err);
          });
      }
    );

    it('scrapes and renders if url, selector, and html2json are submitted', function (done) {
      new Promise(
        (resolve) => {
          const htmlScraperPost = new HtmlScraperPost(
            {
              body: {
                url: 'http://localhost:3000/patterns/04-pages-00-homepage/04-pages-00-homepage.html',
                selector: '#one',
                html2json: JSON.stringify(jsonFromHtmlConst)
              },
              cookies: {
                fepper_ts: timestampFromFile
              }
            },
            responseFactory(resolve),
            fepper.tcpIp.fpExpress
          );

          htmlScraperPost.main();
        })
        .then((response) => {
          /* eslint-disable max-len */
          expect(response.responseText).to.equal(`
<!DOCTYPE html>
<html class="">
  <head>
    <title id="title">Fepper HTML Scraper</title>
    <meta charset="utf-8">

    <!-- Disable cache -->
    <meta http-equiv="cache-control" content="max-age=0">
    <meta http-equiv="cache-control" content="no-cache">
    <meta http-equiv="expires" content="0">
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT">
    <meta http-equiv="pragma" content="no-cache">

    
    <link rel="stylesheet" href="/webserved/pattern.css">
    <link rel="stylesheet" href="/_styles/bld/style.css">
    <link rel="stylesheet" href="/webserved/html-scraper.css">
    <script src="/node_modules/mousetrap/mousetrap.min.js"></script>
    <script src="/annotations/annotations.js"></script>
    <script src="/_scripts/src/variables.styl" type="text/javascript"></script>
  </head>

  <body class="">
    <main id="fepper-html-scraper" class="">
      <div id="message" class="message "></div>
      <div id="load-anim">
        <div></div><div></div><div></div><div></div>
      </div>
      <h1 id="scraper__heading">Fepper HTML Scraper</h1>
      <div id="scraper__reviewer">&#x3C;div id=&#x22;one&#x22; class=&#x22;test&#x22;&#x3E;Foo&#x3C;/div&#x3E;<br>
      </div>
      <h3>Does this HTML look right?</h3>
      <form id="scraper__importer" action="/html-scraper" method="post" name="importer">
        <div>Yes, import into Fepper.</div>
        <label for="filename">Enter a filename to save this under (extension not necessary):</label>
        <input name="filename" type="text" value="">
        <input name="url" type="hidden" value="http://localhost:3000/patterns/04-pages-00-homepage/04-pages-00-homepage.html">
        <input name="selector_raw" type="hidden" value="">
        <textarea name="html2json"></textarea>
        <textarea name="mustache"><div id="one" class="test">{{ one }}</div>

        </textarea>
        <textarea name="json">{
  "one": "Foo"
}
        </textarea>
        <input id="scraper__importer__submit" name="submit_importer" type="submit" value="Submit">
      </form>
      <h3>Otherwise, correct the URL and selector and submit again.</h3>
      <form id="scraper__targeter" action="/html-scraper" method="post" name="targeter">
        <div>
          <label for="url">URL:</label>
          <input name="url" type="text" value="http://localhost:3000/patterns/04-pages-00-homepage/04-pages-00-homepage.html">
        </div>
        <div>
          <label for="selector_raw">Selector:</label>
          <input name="selector_raw" type="text" value="">
          <input name="selector" type="hidden" value="">
          <input name="index" type="hidden" value="">
        </div>
        <textarea name="html2json"></textarea>
        <input id="scraper__targeter__submit" name="submit_targeter" type="submit" value="Submit">
        <button id="help-hide">Hide</button><button id="help-show">Help</button>
      </form>
      <div id="help-text">
        <p></p>
        <p>Use this tool to scrape and import .mustache templates and .json data files from actual web pages, preferably the actual backend CMS that Fepper is prototyping for. Simply enter the URL of the page you wish to scrape. Then, enter the CSS selector you wish to target (prepended with &quot;#&quot; for IDs and &quot;.&quot; for classes). Classnames and tagnames may be appended with array index notation ([n]). Otherwise, the Scraper will scrape all elements of that class or tag sequentially. Such a loosely targeted scrape will save many of the targeted fields to the .json file, but will only save the first instance of the target to a .mustache template.</p>
        <p>Upon submit, you should be able to review the scraped output on the subsequent page. If the output looks correct, enter a filename and submit again. The Scraper will save .mustache and .json files by that name in your patterns&apos; scrape directory, also viewable under the Scrape menu of the toolbar.</p>
      </div>
      <iframe id="scraper__stage" sandbox="allow-same-origin allow-scripts"></iframe>
      <script src ="/webserved/html-scraper-dhtml.js"></script>
    </main>
    <!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->
<script type="text/json" id="sg-pattern-data-footer" class="sg-pattern-data">
  
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

  </body>
</html>`);
          /* eslint-enable max-len */
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('redirects with error message if no url, selector, html2json, or filename submitted', function (done) {
      new Promise(
        (resolve) => {
          const htmlScraperPost = new HtmlScraperPost(
            {
              cookies: {
                fepper_ts: timestampFromFile
              }
            },
            responseFactory(resolve),
            fepper.tcpIp.fpExpress
          );

          htmlScraperPost.main();
        })
        .then((response) => {
          expect(response.status).to.equal(303);
          expect(response.headers.Location)
            .to.equal('/html-scraper?msg_class=error&message=ERROR!%20Incorrect%20submission!&url=&selector_raw=');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  // Testing .filesWrite at the end to work after the setting and resetting of conf.scrape.limit_time.
  // It is important to test the security at the unit level in .filesWrite(), as well as integrated into .main().
  describe('.filesWrite())', function () {
    let mustache;
    let jsonStr;
    let scrapeFile1JsonExistsBefore;
    let scrapeFile1MustacheExistsBefore;
    let scrapeFile2JsonExistsBefore;
    let scrapeFile2MustacheExistsBefore;

    before(function () {
      fs.removeSync(scrapeFile1Json);
      fs.removeSync(scrapeFile1Mustache);
      fs.removeSync(scrapeFile2Json);
      fs.removeSync(scrapeFile2Mustache);

      mustache = htmlScraperPost.htmlSanitize(htmlScraperPost.jsonToMustache(jsons.jsonForMustache, jsons.jsonForData));
      jsonStr = JSON.stringify(jsons.jsonForData, null, 2) + '\n';
      scrapeFile1JsonExistsBefore = fs.existsSync(scrapeFile1Json);
      scrapeFile1MustacheExistsBefore = fs.existsSync(scrapeFile1Mustache);
      scrapeFile2JsonExistsBefore = fs.existsSync(scrapeFile2Json);
      scrapeFile2MustacheExistsBefore = fs.existsSync(scrapeFile2Mustache);
    });

    after(function () {
      conf.scrape.limit_time = scrapeLimitTimeOrig;
    });

    it('validates user-submitted filename', function () {
      const validFilename = '0-test.1_0';
      const invalidChar = '0-test.1_0!';
      const invalidHyphenPrefix = '-0-test.1_0';
      const invalidPeriodPrefix = '.0-test.1_0';
      const invalidUnderscorePrefix = '_0-test.1_0';
      const sameAsScraperFile = '00-html-scraper.mustache';

      expect(htmlScraperPost.filenameValidate(validFilename)).to.be.true;
      expect(htmlScraperPost.filenameValidate(invalidChar)).to.be.false;
      expect(htmlScraperPost.filenameValidate(invalidHyphenPrefix)).to.be.false;
      expect(htmlScraperPost.filenameValidate(invalidPeriodPrefix)).to.be.false;
      expect(htmlScraperPost.filenameValidate(invalidUnderscorePrefix)).to.be.false;
      expect(htmlScraperPost.filenameValidate(sameAsScraperFile)).to.be.false;
    });

    it('correctly formats newlines in file body', function () {
      const mustacheWithCR = mustache.replace(/\n/g, '\r\n');

      expect(mustache).to.not.equal(mustacheWithCR);
      expect(mustache).to.not.have.string('\r');
      expect(mustacheWithCR).to.have.string('\r');
      expect(htmlScraperPost.newlineFormat(mustacheWithCR)).to.equal(mustache);
    });

    it('correctly formats newlines in stringified json', function () {
      const jsonStrWithCR = jsonStr.replace(/\n/g, '\r\n');

      expect(jsonStr).to.not.equal(jsonStrWithCR);
      expect(jsonStr).to.not.have.string('\r');
      expect(jsonStrWithCR).to.have.string('\r');
      expect(htmlScraperPost.newlineFormat(jsonStrWithCR)).to.equal(jsonStr);
    });

    it('writes file to destination', function (done) {
      setTimeout(() => {
        htmlScraperPost.filesWrite(scrapeDir, scrapeFile1, mustache, jsonStr);

        const scrapeFile1JsonExistsAfter = fs.existsSync(scrapeFile1Json);
        const scrapeFile1MustacheExistsAfter = fs.existsSync(scrapeFile1Mustache);

        expect(scrapeFile1JsonExistsBefore).to.be.false;
        expect(scrapeFile1MustacheExistsBefore).to.be.false;

        expect(scrapeFile1JsonExistsAfter).to.be.true;
        expect(scrapeFile1MustacheExistsAfter).to.be.true;
        done();
      }, 1100);
    });

    it('does not write file to destination if limit is exceeded', function () {
      htmlScraperPost.filesWrite(scrapeDir, scrapeFile2, mustache, jsonStr);

      const scrapeFile2JsonExistsAfter = fs.existsSync(scrapeFile2Json);
      const scrapeFile2MustacheExistsAfter = fs.existsSync(scrapeFile2Mustache);

      expect(scrapeFile2JsonExistsBefore).to.be.false;
      expect(scrapeFile2MustacheExistsBefore).to.be.false;

      expect(scrapeFile2JsonExistsAfter).to.be.false;
      expect(scrapeFile2MustacheExistsAfter).to.be.false;
    });
  });
});
