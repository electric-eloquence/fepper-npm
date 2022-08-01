'use strict';

const Feplet = require('feplet');

module.exports = class {
  #fpExpress;

  constructor(fpExpress) {
    this.#fpExpress = fpExpress;

    this.options = fpExpress.options;
    this.conf = this.options.conf;
    this.utils = this.options.utils;

    this.html = fpExpress.html;
  }

  get gatekeeper() {
    return this.#fpExpress.gatekeeper;
  }

  cors() /* istanbul ignore next */ {
    return (req, res) => {
      if (!this.gatekeeper.gatekeep(req)) {
        this.gatekeeper.render('the HTML Scraper')(req, res);

        return;
      }

      fetch(req.query.url)
        .then((response) => {
          if (response.ok) {
            return response.text();
          }
          else {
            return response.status;
          }
        })
        .then((output) => {
          if (typeof output === 'string') {
            res.send(output);
          }
          else {
            res.writeHead(output).end();
          }
        })
        .catch((err) => {
          this.utils.error(err);
          res.sendStatus(500);
        });
    };
  }

  xhr() {
    return (req, res) => {
      /* istanbul ignore if */
      if (!this.gatekeeper.gatekeep(req)) {
        this.gatekeeper.render('the HTML Scraper')(req, res);

        return;
      }

      let message = '';
      let msgClass = '';
      let selectorRaw = '';
      let url = '';

      if (req.query) {
        message = req.query.message || '';
        msgClass = req.query.msg_class || '';
        selectorRaw = req.query.selector_raw || '';
        url = req.query.url || '';
      }

      let outputFpt = '\n<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>';
      outputFpt += `\n      <div id="message" class="message ${msgClass}">${message}</div>`;
      outputFpt += this.html.loadingAnimation;
      outputFpt += this.html.scraperHeading;
      outputFpt += this.html.landingBody;
      outputFpt += this.html.helpText;
      outputFpt += this.html.scraperStage;
      outputFpt += '\n</body></html>';

      const output = Feplet.render(
        outputFpt,
        {
          main_id: 'fepper-html-scraper',
          url,
          selector_raw: selectorRaw,
          help_buttons: this.html.helpButtons,
          help_text: this.html.scraperHelpText
        }
      );

      res.send(output);
    };
  }

  main() {
    return (req, res) => {
      // Gatekept by /webserved/html-scraper-ajax.js.

      let outputFpt = this.html.headPattern;
      outputFpt += '\n      <script src="/webserved/html-scraper-ajax.js"></script>';
      outputFpt += this.html.foot;

      let patternlabFoot;

      // Disable UI navigation on the success page so users must refresh the browser.
      if (this.utils.deepGet(req, 'query.msg_class') !== 'success') {
        patternlabFoot = Feplet.render(
          this.html.getImmutableFooter(this.conf),
          {
            portReloader: this.conf.livereload_port,
            portServer: this.conf.express_port
          }
        );
      }

      const output = Feplet.render(
        outputFpt,
        {
          title: t("Fepper HTML Scraper"), // eslint-disable-line quotes
          main_id: 'fepper-html-scraper',
          msg_class: this.utils.deepGet(req, 'query.msg_class') || '',
          message: this.utils.deepGet(req, 'query.message') || '',
          patternlabFoot
        }
      );

      res.send(output);
    };
  }
};
