'use strict';

const Feplet = require('feplet');
const request = require('request');

module.exports = class {
  constructor(options, html, gatekeeper) {
    this.options = options;
    this.conf = options.conf;
    this.utils = options.utils;

    this.html = html;
    this.gatekeeper = gatekeeper;
  }

  cors() /* istanbul ignore next */ {
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
      /* istanbul ignore if */
      if (!this.gatekeeper.gatekeep(req)) {
        this.gatekeeper.render()(req, res);

        return;
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

      let outputFpt = '\n<!DOCTYPE html>\n';
      outputFpt += '<html>\n';
      outputFpt += `<div id="message" class="message ${msgClass}">${message}</div>\n`;
      outputFpt += this.html.scraperTitle;
      outputFpt += this.html.landingBody;
      outputFpt += '</html>';

      const output = Feplet.render(
        outputFpt,
        {
          main_id: 'scraper',
          main_class: 'scraper',
          url,
          selector
        }
      );

      res.send(output);
    };
  }

  main() {
    return (req, res) => {
      // Gatekept by fepper-ui/scripts/pattern/html-scraper-ajax.js.

      let outputFpt = this.html.headWithMsg;
      outputFpt += this.html.scraperTitle;
      outputFpt += '<script src="node_modules/fepper-ui/scripts/pattern/html-scraper-ajax.js"></script>\n';
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
