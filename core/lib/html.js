/**
 * @file
 * Exports the HTML for assembly and token-replacement by the server app.
 */
/* eslint-disable max-len */
'use strict';

const fs = require('fs');

exports.head = `
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

    <link rel="stylesheet" href="/fepper-core/style.css" media="all">
    <script src="../../node_modules/mousetrap/mousetrap.min.js"></script>
  </head>

  <body class="text {{ body_class }}">
    <main id="{{ main_id }}" class="{{ main_class }}">`;

exports.headWithMsg = exports.head + '\n      <div id="message" class="message {{ msg_class }}">{{{ message }}}</div>';

exports.loadingAnimation = `
      <div id="load-anim">
        <style>
          #load-anim {
            display: none;
            position: absolute;
            top: 13rem;
            left: calc(50vw - 4rem);
            width: 8rem;
            height: 8rem;
          }
          #load-anim div {
            animation: load-anim 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
            border-color: #ccc transparent transparent transparent;
            border-radius: 50%;
            border-style: solid;
            border-width: 0.8rem;
            box-sizing: border-box;
            display: block;
            margin: 0.8rem;
            position: absolute;
            width: 6.4rem;
            height: 6.4rem;
          }
          #load-anim div:nth-child(1) {
            animation-delay: -0.45s;
          }
          #load-anim div:nth-child(2) {
            animation-delay: -0.3s;
          }
          #load-anim div:nth-child(3) {
            animation-delay: -0.15s;
          }
          @keyframes load-anim {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        </style>
        <div></div><div></div><div></div><div></div>
      </div>`;

exports.scraperTitle = `
      <h1 id="scraper-heading" class="scraper-heading">${t('Fepper HTML Scraper')}</h1>`;

exports.forbidden = `
    <section id="forbidden" class="error">
      <p>${t('ERROR')}! ${t('You can only use the HTML Scraper on the machine that is running this Fepper instance!')}</p>
      <p>${t('If you <em>are</em> on this machine, you may need to resync this browser with Fepper.')}</p>
      <p>${t('Please go to the command line and quit this Fepper instance. Then run <code>fp</code> (not <code>fp restart</code>).')}</p>
    </section>`;

exports.landingBody = `
      <form id="html-scraper-targeter" action="/html-scraper" method="post" name="targeter">
        <div>
          <label for="url">${t('URL:')}</label>
          <input name="url" type="text" value="{{{ url }}}" style="width: 100%;">
        </div>
        <div>
          <label for="selector">${t('Selector:')}</label>
          <input name="selector" type="text" value="{{ selector }}" style="width: 100%;">
        </div>
        <textarea name="html2json" style="display: none;"></textarea>
        <div class="cf" style="padding-top: 10px;">
          <input name="url-form" type="submit" value="${t('Submit')}" style="float: left;">
          <button id="help-button" style="float: right;">${t('Help')}</button>
          <button id="hide-button" style="float: right;display: none;">${t('Hide')}</button>
        </div>
      </form>
      <div id="help-text" style="border: 1px solid black;visibility: hidden;margin-top: 5.50px;padding: 0 20px;width: 100%">
        <p></p>
        <p>${t('Use this tool to scrape and import .mustache templates and .json data files from actual web pages, preferably the actual backend CMS that Fepper is prototyping for. Simply enter the URL of the page you wish to scrape. Then, enter the CSS selector you wish to target (prepended with &quot;#&quot; for IDs and &quot;.&quot; for classes). Classnames and tagnames may be appended with array index notation ([n]). Otherwise, the Scraper will scrape all elements of that class or tag sequentially. Such a loosely targeted scrape will save many of the targeted fields to the .json file, but will only save the first instance of the target to a .mustache template.')}</p>
        <p>${t('Upon submit, you should be able to review the scraped output on the subsequent page. If the output looks correct, enter a filename and submit again. The Scraper will save .mustache and .json files by that name in your patterns&apos; scrape directory, also viewable under the Scrape menu of the toolbar.')}</p>
      </div>`;

exports.reviewerPrefix = `
      <div style="border: 1px solid black;margin: 10px 0 20px;overflow-x: scroll;padding: 20px;width: 100%;">`;

exports.reviewerSuffix = `
      </div>`;

exports.importerPrefix = `
      <h3>${t('Does this HTML look right?')}</h3>
      <form id="html-scraper-importer" action="/html-scraper" method="post" name="importer" style="margin-bottom: 20px;">
        <div>${t('Yes, import into Fepper.')}</div>
        <label for="import-form">${t('Enter a filename to save this under (extension not necessary):')}</label>
        <input name="filename" type="text" value="" style="width: 100%">
        <input name="url" type="hidden" value="{{{ url }}}">
        <input name="selector" type="hidden" value="{{ selector }}">
        <textarea name="html2json" style="display: none;"></textarea>
        <textarea name="mustache" style="display: none;">`;

exports.json = `
        </textarea>
        <textarea name="json" style="display: none;">`;

exports.importerSuffix = `
        </textarea>
        <input name="import-form" type="submit" value="${t('Submit')}" style="margin-top: 10px;">
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
