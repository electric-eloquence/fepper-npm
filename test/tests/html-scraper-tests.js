'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

const {
  fepper,
  responseFactory
} = require('../init')();
const htmlScraper = fepper.tcpIp.fpExpress.htmlScraper;
const opener = fepper.tasks.opener;

const timestampFile = `${global.rootDir}/.timestamp`;

describe('HTML Scraper', function () {
  let timestampFromFile;

  before(function () {
    fs.removeSync(timestampFile);

    timestampFromFile = opener.timestamp();
  });

  after(function () {
    fs.removeSync(timestampFile);
  });

  it('.xhr() responds with a script tag requesting html-scraper-ajax.js', function (done) {
    new Promise((resolve) => {
      htmlScraper.xhr()(
        {
          cookies: {
            fepper_ts: timestampFromFile
          },
          query: {
            message: 'Test message',
            msg_class: 'test-message',
            selector: '.test-message',
            url: 'http://localhost:3000/patterns/04-pages-00-homepage/04-pages-00-homepage.html'
          }
        },
        responseFactory(resolve)
      );
    })
    .then((output) => {
      /* eslint-disable max-len */
      expect(output).to.equal(`
<!DOCTYPE html>
<html>
<div id="message" class="message test-message">Test message</div>

      <h1 id="scraper-heading" class="scraper-heading">Fepper HTML Scraper</h1>
      <form id="html-scraper-targeter" action="/html-scraper" method="post" name="targeter">
        <div>
          <label for="url">URL:</label>
          <input name="url" type="text" value="http://localhost:3000/patterns/04-pages-00-homepage/04-pages-00-homepage.html" style="width: 100%;">
        </div>
        <div>
          <label for="selector">Selector:</label>
          <input name="selector" type="text" value=".test-message" style="width: 100%;">
        </div>
        <textarea name="html2json" style="display: none;"></textarea>
        <div class="cf" style="padding-top: 10px;">
          <input name="url-form" type="submit" value="Submit" style="float: left;">
          <button id="help-button" style="float: right;">Help</button>
          <button id="hide-button" style="float: right;display: none;">Hide</button>
        </div>
      </form>
      <div id="help-text" style="border: 1px solid black;visibility: hidden;margin-top: 5.50px;padding: 0 20px;width: 100%">
        <p></p>
        <p>Use this tool to scrape and import .mustache templates and .json data files from actual web pages, preferably the actual backend CMS that Fepper is prototyping for. Simply enter the URL of the page you wish to scrape. Then, enter the CSS selector you wish to target (prepended with &quot;#&quot; for IDs and &quot;.&quot; for classes). Classnames and tagnames may be appended with array index notation ([n]). Otherwise, the Scraper will scrape all elements of that class or tag sequentially. Such a loosely targeted scrape will save many of the targeted fields to the .json file, but will only save the first instance of the target to a .mustache template.</p>
        <p>Upon submit, you should be able to review the scraped output on the subsequent page. If the output looks correct, enter a filename and submit again. The Scraper will save .mustache and .json files by that name in your patterns&apos; scrape directory, also viewable under the Scrape menu of the toolbar.</p>
      </div></html>`);
      /* eslint-enable max-len */
      done();
    })
    .catch((err) => {
      done(err);
    });
  });

  it('.main() responds with a script tag requesting html-scraper-ajax.js', function (done) {
    new Promise((resolve) => {
      htmlScraper.main()(
        {},
        responseFactory(resolve)
      );
    })
    .then((output) => {
      /* eslint-disable max-len */
      expect(output).to.equal(`
<!DOCTYPE html>
<html class="">
  <head>
    <title id="title">Fepper HTML Scraper</title>
    <meta charset="UTF-8">

    <!-- Disable cache -->
    <meta http-equiv="cache-control" content="max-age=0">
    <meta http-equiv="cache-control" content="no-cache">
    <meta http-equiv="expires" content="0">
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT">
    <meta http-equiv="pragma" content="no-cache">

    

    <link rel="stylesheet" href="/fepper-core/style.css" media="all">
    <script src="../../node_modules/mousetrap/mousetrap.min.js"></script>
  </head>

  <body class="text ">
    <main id="scraper" class="scraper"><script src="node_modules/fepper-ui/scripts/pattern/html-scraper-ajax.js"></script>

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
