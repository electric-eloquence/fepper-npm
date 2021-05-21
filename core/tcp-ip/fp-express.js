'use strict';

const path = require('path');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');

const ErrorResponse = require('./error-response');
const Gatekeeper = require('./gatekeeper');
const HtmlScraper = require('./html-scraper');
const HtmlScraperPost = require('./html-scraper-post');
const MarkdownEditorPost = require('./markdown-editor-post');
const MustacheBrowser = require('./mustache-browser');
const Readme = require('./readme');
const Success = require('./success');

module.exports = class {
  constructor(options, html, ui) {
    this.options = options;
    this.conf = options.conf;
    this.pref = options.pref;
    this.html = html;
    this.ui = ui;

    this.errorResponse = new ErrorResponse(this);
    this.gatekeeper = new Gatekeeper(this);
    this.htmlScraper = new HtmlScraper(this);
    this.mustacheBrowser = new MustacheBrowser(this);
    this.readme = new Readme(this);
    this.success = new Success(this);

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
    app.get('/html-scraper-xhr/forbidden', this.gatekeeper.render('HTML Scraper'));

    // Mustache browser.
    app.get('/mustache-browser', this.mustacheBrowser.main());

    // Readme page.
    app.get('/readme', this.readme.main());

    // Success page.
    app.get('/success', this.success.main());

    /* POST OPERATIONS */
    // Instantiate new objects per post because post operations generally comprise many methods. It will be easier for
    // the methods to deal with request data if those data are constructed as properties of the object.
    // Ignore coverage on post operations. The methods they employ are pretty well tested.

    // HTML scraper and importer actions.
    app.post('/html-scraper', (req, res) => /* istanbul ignore next */ {
      const htmlScraperPost = new HtmlScraperPost(req, res, this);

      htmlScraperPost.main();
    });

    // Markdown editor actions.
    app.post('/markdown-editor', (req, res) => /* istanbul ignore next */ {
      const markdownEditorPost = new MarkdownEditorPost(req, res, this);

      markdownEditorPost.main();
    });

    /* STATIC PAGES */

    // Fepper static files. No longer used since browser js and css are handled by fepper-ui.
    // However, will keep this route open for possible future or custom use.
    app.use('/webserved', express.static(path.resolve(__dirname, '..', 'webserved')));

    // Webserved directories.
    // Serve the backend's static files where the document root and top-level
    // directory are configured in backend.webserved_dirs in pref.yml.
    const webservedDirs = this.pref.backend.webserved_dirs;

    if (Array.isArray(webservedDirs)) {
      for (let i = 0; i < webservedDirs.length; i++) {
        const webservedDir = webservedDirs[i];
        const webservedDirSplit = webservedDir.split('/');

        webservedDirSplit.shift();
        app.use(
          `/${webservedDirSplit.join('/')}`,
          express.static(`${this.pref.backend.backend_dir}/${webservedDir}`)
        );
      }
    }

    // For all other static requests, document root = public directory.
    app.use(express.static(this.conf.ui.paths.public.root));

    this.app = global.expressApp = app;
  }
};
