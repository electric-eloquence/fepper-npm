/**
 * @file
 * Exports the HTML for assembly and token-replacement by the server app.
 */
 /* eslint-disable max-len */
'use strict';

exports.head = `
<!DOCTYPE html>
<html>
  <head>
    <title id="title">{{ title }}</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta charset="UTF-8">

    <!-- never cache -->
    <meta http-equiv="cache-control" content="max-age=0">
    <meta http-equiv="cache-control" content="no-cache">
    <meta http-equiv="expires" content="0">
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT">
    <meta http-equiv="pragma" content="no-cache">
    <link rel="stylesheet" href="/fepper-core/style.css" media="all">
  </head>

  <body style="width: 100%;" class="text">
    <main id="{{ main_id }}" class="{{ main_class }}">`;

exports.headWithMsg = exports.head + '\n      <div id="message" class="message {{ msg_class }}">{{ message }}</div>';

exports.scraperTitle = `
      <h1 id="scraper-heading" class="scraper-heading">Fepper HTML Scraper</h1>`;

exports.forbidden = `
    <section id="forbidden" class="error">
      <p>Error! You can only use the HTML Scraper on the machine that is running this Fepper instance!</p>
      <p>If you <em>are</em> on this machine, you may need to resync this browser with Fepper.</p>
      <p>Please go to the command line and quit this Fepper instance. Then run <code>fp</code> (not <code>fp restart</code>).</p>
    </section>`;

exports.landingBody = `
      <form id="html-scraper-targeter" action="/html-scraper" method="post" name="targeter" {{ attributes }}>
        <div>
          <label for="url">URL:</label>
          <input name="url" type="text" value="{{ url }}" style="width: 100%;" />
        </div>
        <div>
          <label for="selector">Target Selector:</label>
          <input name="selector" type="text" value="{{ selector }}" style="width: 100%;" />
        </div>
        <textarea name="html2json" style="display: none;"></textarea>
        <div class="cf" style="padding-top: 10px;">
          <input name="url-form" type="submit" value="Submit" style="float: left;" />
          <button id="help-button" style="float: right;">Help</button>
        </div>
      </form>
      <div id="help-text" style="border: 1px solid black;visibility: hidden;margin-top: 5.50px;padding: 0 20px;width: 100%">
        <p></p>
        <p>Use this tool to scrape and import Mustache templates and JSON data files from actual web pages, preferably the actual backend CMS that Fepper is prototyping for. Simply enter the URL of the page you wish to scrape. Then, enter the CSS selector you wish to target (prepended with "#" for IDs and "." for classes). Classnames and tagnames may be appended with array index notation ([n]). Otherwise, the Scraper will scrape all elements of that class or tag sequentially. Such a loosely targeted scrape will save many of the targeted fields to the JSON file, but will only save the first instance of the target to a Mustache template.</p>
  <p>Upon submit, you should be able to review the scraped output on the subsequent page. If the output looks correct, enter a filename and submit again. The Scraper will save Mustache and JSON files by that name in your patterns&apos; scrape directory, also viewable under the Scrape menu of the toolbar. The Scraper will correctly indent the Mustache code. However, the JSON parsing requires a conversion from HTML to XHTML, so don&apos;t expect an exact copy of the HTML structure of the source HTML.</p>
      </div>`;

exports.reviewerPrefix = `
      <div style="border: 1px solid black;margin: 10px 0 20px;overflow-x: scroll;padding: 20px;width: 100%;">`;

exports.reviewerSuffix = `
      </div>`;

exports.importerPrefix = `
      <h3>Does this HTML look right?</h3>
      <form id="html-scraper-importer" action="/html-scraper" method="post" name="importer" style="margin-bottom: 20px;">
        <div>Yes, import into Fepper.</div>
        <label for="import-form">Enter a filename to save this under:</label>
        <input name="filename" type="text" value="" style="width: 100%" />
        <input name="url" type="hidden" value="{{ url }}" />
        <input name="selector" type="hidden" value="{{ selector }}" />
        <textarea name="html2json" style="display: none;"></textarea>
        <textarea name="mustache" style="display: none;">`;

exports.json = `
        </textarea>
        <textarea name="json" style="display: none;">`;

exports.importerSuffix = `
        </textarea>
        <input name="import-form" type="submit" value="Submit" style="margin-top: 10px;" />
      </form>
      <h3>Otherwise, correct the URL and Target Selector and submit again.</h3>`;

exports.success = `
      <p>To open the UI, click here: <a href="http://{{ host }}" target="_blank">http://{{ host }}</a></p>
      <p>To halt Fepper, go to the command prompt where Fepper is running and press ctrl+c.</p>
      <p>The following documentation is also available in Fepper's README.md:</p>`;

exports.foot = `
    </main>
    <script src="/node_modules/jquery/dist/jquery.min.js"></script>
    <script src="/node_modules/jquery.cookie/jquery.cookie.js"></script>
    <script src="/node_modules/fepper-ui/scripts/timestamper.js"></script>
  </body>
</html>`;
