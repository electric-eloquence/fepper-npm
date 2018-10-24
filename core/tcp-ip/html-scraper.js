'use strict';

const request = require('request');

module.exports = class {
  constructor(options, html, gatekeeper) {
    this.conf = options.conf;
    this.utils = options.utils;

    this.html = html;
    this.gatekeeper = gatekeeper;
  }

  cors() {
    return (req, res) => {
      if (!this.gatekeeper.gatekeep(req)) {
        this.gatekeeper.render(req, res);

        return;
      }

      try {
        request(req.query.url, (error, response, body) => {
          if (!error && response.statusCode === 200) {
            res.send(body);
          }
          else {
            res.status(response.statusCode).end();
          }
        });
      }
      catch (err) {
        this.utils.error(err);
      }
    };
  }

  xhr() {
    return (req, res) => {
      if (!this.gatekeeper.gatekeep(req)) {
        this.gatekeeper.render()(req, res);

        return;
      }

      let message = '';
      let msgClass = '';
      let output = '';
      let selector = '';
      let url = '';

      if (req.query) {
        if (typeof req.query.message === 'string') {
          message = req.query.message;
        }
        if (typeof req.query.msg_class === 'string') {
          msgClass = req.query.msg_class;
        }
        if (typeof req.query.selector === 'string') {
          selector = req.query.selector;
        }
        if (typeof req.query.url === 'string') {
          url = req.query.url;
        }
      }

      output += '<!DOCTYPE html>\n';
      output += '<html>\n';
      output += `<div id="message" class="message ${msgClass}">${message}</div>\n`;
      output += this.html.scraperTitle;
      output += this.html.landingBody;
      output += '</html>\n';

      output = output.replace('{{ main_id }}', 'scraper');
      output = output.replace('{{ main_class }}', 'scraper');
      output = output.replace('{{ url }}', url);
      output = output.replace('{{ selector }}', selector);

      const srcPatterns = `${this.conf.ui.paths.source.patterns}/`;
      const srcScrape = this.conf.ui.paths.source.scrape;
      const scrapePrefix = srcScrape.replace(srcPatterns, '');
      const scrapePath = `/patterns/${scrapePrefix}-00-html-scraper/${scrapePrefix}-00-html-scraper.html`;
      let attributes = '';

      if (req.headers.referer.indexOf(scrapePath) > -1) {
        attributes = 'target="_blank"';
      }
      output = output.replace('{{ attributes }}', attributes);

      res.send(output);
    };
  }

  main() {
    return (req, res) => {
      // Gatekept by fepper-ui/scripts/html-scraper-ajax.js.

      let output = '';
      output += this.html.headWithMsg;
      output += this.html.scraperTitle;
      output += '<script src="node_modules/fepper-ui/scripts/html-scraper-ajax.js"></script>\n';
      output += this.html.foot;
      output = output.replace('{{ title }}', 'Fepper HTML Scraper');
      output = output.replace('{{ main_id }}', 'scraper');
      output = output.replace('{{ main_class }}', 'scraper');
      output = output.replace('{{ msg_class }}', '');
      output = output.replace('{{ message }}', '');

      res.send(output);
    };
  }
};
