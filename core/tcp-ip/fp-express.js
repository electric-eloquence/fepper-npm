'use strict';

const path = require('path');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');

const html = require('../lib/html');

const Gatekeeper = require('./gatekeeper');
const HtmlScraper = require('./html-scraper');
const HtmlScraperPost = require('./html-scraper-post');
const MustacheBrowser = require('./mustache-browser');
const Readme = require('./readme');
const Success = require('./success');

module.exports = class {
  constructor(options) {
    this.conf = options.conf;
    this.pref = options.pref;
    this.html = html;

    this.gatekeeper = new Gatekeeper(options, html);
    this.htmlScraper = new HtmlScraper(options, html, this.gatekeeper);
    this.mustacheBrowser = new MustacheBrowser(options, html);
    this.readme = new Readme(options, html);
    this.success = new Success(options, html);

    const app = express();

    /* MIDDLEWARE DEPENDENCIES */

    // So variables sent via form submission can be parsed.
    app.use(bodyParser.urlencoded({extended: true}));

    // So cookies can be parsed.
    app.use(cookieParser());

    /* GET OPERATIONS */

    // HTML scraper AJAX gatekeeper response.
    app.get('/gatekeeper', this.gatekeeper.respond());

    // HTML scraper form.
    app.get('/html-scraper', this.htmlScraper.main());

    // HTML scraper AJAX for populating user pages.
    app.get('/html-scraper-xhr', this.htmlScraper.xhr());

    // HTML scraper cross-origin requests of HTML for scraping.
    app.get('/html-scraper-xhr/cors', this.htmlScraper.cors());

    // HTML scraper markup for gatekept forbidden page.
    app.get('/html-scraper-xhr/forbidden', this.gatekeeper.render());

    // Mustache browser.
    app.get('/mustache-browser', this.mustacheBrowser.main());

    // Readme page.
    app.get('/readme', this.readme.main());

    // Success page.
    app.get('/success', this.success.main());

    /* POST OPERATIONS */

    // HTML scraper and importer actions.
    app.post('/html-scraper', (req, res) => {
      const htmlScraperPost = new HtmlScraperPost(req, res, this.conf, this.gatekeeper, this.html);

      htmlScraperPost.main();
    });

    /* STATIC PAGES */

    // Fepper static files.
    app.use('/fepper-core', express.static(path.resolve(__dirname, '..', 'webserved')));

    // Webserved directories.
    // Serve the backend's static files where the document root and top-level
    // directory are configured in backend.webserved_dirs in pref.yml.
    let webservedDirs = null;

    if (Array.isArray(this.pref.backend.webserved_dirs)) {
      webservedDirs = this.pref.backend.webserved_dirs;
    }

    if (webservedDirs) {
      for (let i = 0; i < webservedDirs.length; i++) {
        let webservedDirSplit = webservedDirs[i].split('/');

        webservedDirSplit.shift();
        app.use(
          `/${webservedDirSplit.join('/')}`,
          express.static(`${this.conf.backend_dir}/${webservedDirs[i]}`)
        );
      }
    }

    // For everything else, document root = Pattern Lab's public directory.
    app.use(express.static(this.conf.ui.paths.public.root));

    this.expressApp = app;
  }

  /**
   * @return {object} The configured Express app.
   */
  main() {
    return this.expressApp;
  }
};
