/**
 * @file
 * Exports the HTML for assembly and token-replacement by the server app.
 */
/* eslint-disable max-len */
'use strict';

const fs = require('fs');

exports.headBoilerplate = `
<!DOCTYPE html>
<html class="{{ html_class }}">
  <head>
    <title id="title">{{ title }}</title>
    <meta charset="utf-8">

    <!-- Disable cache -->
    <meta http-equiv="cache-control" content="max-age=0">
    <meta http-equiv="cache-control" content="no-cache">
    <meta http-equiv="expires" content="0">
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT">
    <meta http-equiv="pragma" content="no-cache">

    {{{ patternlabHead }}}
    {{{ stylesheets }}}
    {{{ scripts }}}
  </head>

  <body class="{{ body_class }}">
    <main id="{{ main_id }}" class="{{ main_class }}">
      <div id="message" class="message {{ msg_class }}">{{{ message }}}</div>`;

exports.head = exports.headBoilerplate
  .replace('{{{ stylesheets }}}', '<link rel="stylesheet" href="/webserved/core.css">');

exports.headMustache = exports.headBoilerplate
  .replace(
    '{{{ stylesheets }}}',
    `<link rel="stylesheet" href="/webserved/prism-twilight.css">
    <link rel="stylesheet" href="/webserved/mustache-browser.css">`
  )
  .replace(
    '{{{ scripts }}}',
    '<script src="/webserved/mustache-browser.js"></script>'
  );

exports.headPattern = exports.headBoilerplate
  .replace(
    '{{{ stylesheets }}}',
    `<link rel="stylesheet" href="/webserved/pattern.css">
    <link rel="stylesheet" href="/_styles/bld/style.css">`)
  .replace(
    '{{{ scripts }}}',
    `<script src="/node_modules/mousetrap/mousetrap.min.js"></script>
    <script src="/annotations/annotations.js"></script>
    <script src="/_scripts/src/variables.styl" type="text/javascript"></script>`);

exports.headScraper = exports.headBoilerplate
  .replace(
    '{{{ stylesheets }}}',
    `<link rel="stylesheet" href="/webserved/pattern.css">
    <link rel="stylesheet" href="/_styles/bld/style.css">
    <link rel="stylesheet" href="/webserved/html-scraper.css">`)
  .replace(
    '{{{ scripts }}}',
    `<script src="/node_modules/mousetrap/mousetrap.min.js"></script>
    <script src="/annotations/annotations.js"></script>
    <script src="/_scripts/src/variables.styl" type="text/javascript"></script>`);

exports.loadingAnimation = `
      <div id="load-anim">
        <div></div><div></div><div></div><div></div>
      </div>`;

exports.scraperHeading = `
      <h1 id="scraper__heading">${t('Fepper HTML Scraper')}</h1>`;

exports.forbidden = `
    <section id="forbidden" class="error forbidden gatekept">
      <p>${t('ERROR')}! ${t('You can only use %s on the machine that is running this Fepper instance!')}</p>
      <p>${t('If you <em>are</em> on this machine, you may need to resync this browser with Fepper.')}</p>
      <p>${t('Please go to the command line and quit this Fepper instance. Then run fp (not fp restart).')}</p>
    </section>`;

exports.landingBody = `
      <form id="scraper__targeter" action="/html-scraper" method="post" name="targeter">
        <div>
          <label for="url">${t('URL:')}</label>
          <input name="url" type="text" value="{{{ url }}}">
        </div>
        <div>
          <label for="selector_raw">${t('Selector:')}</label>
          <input name="selector_raw" type="text" value="{{ selector_raw }}">
          <input name="selector" type="hidden" value="{{ selector }}">
          <input name="index" type="hidden" value="{{ index }}">
        </div>
        <textarea name="html2json"></textarea>
        <input id="scraper__targeter__submit" name="submit_targeter" type="submit" value="${t('Submit')}">
        {{{ help_buttons }}}
      </form>`;

exports.helpButtons = `<button id="help-hide">${t('Hide')}</button><button id="help-show">${t('Help')}</button>`;

exports.helpText = `
      <div id="help-text">{{{ help_text }}}      </div>`;

exports.scraperHelpText = `
        <p></p>
        <p>${t('Use this tool to scrape and import .mustache templates and .json data files from actual web pages, preferably the actual backend CMS that Fepper is prototyping for. Simply enter the URL of the page you wish to scrape. Then, enter the CSS selector you wish to target (prepended with &quot;#&quot; for IDs and &quot;.&quot; for classes). Classnames and tagnames may be appended with array index notation ([n]). Otherwise, the Scraper will scrape all elements of that class or tag sequentially. Such a loosely targeted scrape will save many of the targeted fields to the .json file, but will only save the first instance of the target to a .mustache template.')}</p>
        <p>${t('Upon submit, you should be able to review the scraped output on the subsequent page. If the output looks correct, enter a filename and submit again. The Scraper will save .mustache and .json files by that name in your patterns&apos; scrape directory, also viewable under the Scrape menu of the toolbar.')}</p>\n`;

exports.scraperStage = `
      <iframe id="scraper__stage" sandbox="allow-same-origin allow-scripts"></iframe>`;

exports.reviewerPrefix = `
      <div id="scraper__reviewer">`;

exports.reviewerSuffix = `
      </div>`;

exports.importerPrefix = `
      <h3>${t('Does this HTML look right?')}</h3>
      <form id="scraper__importer" action="/html-scraper" method="post" name="importer">
        <div>${t('Yes, import into Fepper.')}</div>
        <label for="filename">${t('Enter a filename to save this under (extension not necessary):')}</label>
        <input name="filename" type="text" value="">
        <input name="url" type="hidden" value="{{{ url }}}">
        <input name="selector_raw" type="hidden" value="{{ selector_raw }}">
        <textarea name="html2json"></textarea>
        <textarea name="mustache">`;

exports.json = `
        </textarea>
        <textarea name="json">`;

exports.importerSuffix = `
        </textarea>
        <input id="scraper__importer__submit" name="submit_importer" type="submit" value="${t('Submit')}">
      </form>
      <h3>${t('Otherwise, correct the URL and selector and submit again.')}</h3>`;

exports.success = `
      <p>${t('To open the UI, click here:')} <a href="http://{{ origin }}{{ search }}" target="_blank">http://{{ origin }}</a></p>
      <p>${t('To halt Fepper, go to the command prompt where Fepper is running and press ctrl+c.')}</p>
      <p>${t('The following documentation is also available in Fepper&apos;s README.md:')}</p>`;

exports.foot = `
    </main>
    {{{ patternlabFoot }}}
  </body>
</html>`;

exports.getImmutableHeader = (conf) => {
  return fs.readFileSync(`${conf.ui.paths.core}/immutable/immutable-header.mustache`, conf.enc);
};

exports.getImmutableFooter = (conf) => {
  return fs.readFileSync(`${conf.ui.paths.core}/immutable/immutable-footer.mustache`, conf.enc);
};
