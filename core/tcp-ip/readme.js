'use strict';

const Feplet = require('feplet');
const fs = require('fs-extra');
const marked = require('marked');

module.exports = class {
  constructor(options, html) {
    this.conf = options.conf;
    this.rootDir = options.rootDir;
    this.utils = options.utils;

    this.html = html;
  }

  main() {
    return (req, res) => {
      fs.readFile(`${this.rootDir}/README.md`, this.conf.enc, (err, dat) => {
        if (err) {
          this.utils.error(err);
        }

        if (!dat) {
          const notFound = 404;

          res.status(notFound).send(this.utils.httpCodes[notFound]);

          return;
        }

        let htmlMd;

        try {
          htmlMd = marked(dat);
          // Escape curly braces so they don't get interpreted as stashes.
          htmlMd = htmlMd.replace(/\{/g, '&lbrace;');
          htmlMd = htmlMd.replace(/\}/g, '&rbrace;');
        }
        catch (err1) {
          const internalServerError = 500;

          this.utils.error(err1);
          res.status(internalServerError).send(this.utils.httpCodes[internalServerError] + ' - ' + err1);

          return;
        }

        let outputFpt = this.html.head;
        outputFpt += htmlMd + '\n';
        outputFpt += this.html.foot;

        const output = Feplet.render(
          outputFpt,
          {
            title: 'Fepper',
            main_id: 'readme',
            main_class: 'readme'
          }
        );

        res.send(output);
      });
    };
  }
};
