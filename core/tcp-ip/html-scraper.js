'use strict';

const Feplet = require('feplet');
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

      const srcPatterns = `${this.conf.ui.paths.source.patterns}/`;
      const srcScrape = this.conf.ui.paths.source.scrape;
      const scrapePrefix = srcScrape.replace(srcPatterns, '');
      const scrapePath = `/patterns/${scrapePrefix}-00-html-scraper/${scrapePrefix}-00-html-scraper.html`;

      let attributes = '';

      if (req.headers.referer.indexOf(scrapePath) > -1) {
        attributes = 'target="_blank"';
      }

      let message = '';
      let msgClass = '';
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

      let outputFpt = '<!DOCTYPE html>\n';
      outputFpt += '<html>\n';
      outputFpt += `<div id="message" class="message ${msgClass}">${message}</div>\n`;
      outputFpt += this.html.scraperTitle;
      outputFpt += this.html.landingBody;
      outputFpt += '</html>\n';

      const output = Feplet.render(
        outputFpt,
        {
          main_id: 'scraper',
          main_class: 'scraper',
          attributes,
          url,
          selector
        }
      );

      res.send(output);
    };
  }

  main() {
    return (req, res) => {
      // Gatekept by fepper-ui/scripts/html-scraper-ajax.js.

      let outputFpt = this.html.headWithMsg;
      outputFpt += this.html.scraperTitle;
      outputFpt += '<script src="node_modules/fepper-ui/scripts/html-scraper-ajax.js"></script>\n';
      outputFpt += this.html.foot;

      const output = Feplet.render(
        outputFpt,
        {
          title: 'Fepper HTML Scraper',
          main_id: 'scraper',
          main_class: 'scraper',
          msg_class: '',
          message: ''
        }
      );

      res.send(output);
    };
  }
};
