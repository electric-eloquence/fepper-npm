'use strict';

const Feplet = require('feplet');
const fs = require('fs-extra');
const marked = require('marked');

module.exports = class {
  constructor(options, html) {
    this.options = options;
    this.conf = options.conf;
    this.rootDir = options.rootDir;
    this.utils = options.utils;

    this.html = html;
  }

  main() {
    return (req, res) => {
console.warn(req)
      fs.readFile(`${this.rootDir}/README.md`, this.conf.enc, (err, dat) => {
        const successMsg = 'Installation success!';
        const ts = this.utils.deepGet(req, 'query.ts') ? req.query.ts : '';
        const successSimple = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body>${successMsg}<br><a href="/?ts=${ts}">Open Fepper UI</a></body></html>`;

        if (!dat) {
          res.send(successSimple);

          return;
        }

        let htmlMd;

        try {
          htmlMd = marked(dat);
          // Escape curly braces so they don't get interpreted as stashes.
          htmlMd = htmlMd.replace(/\{/g, '&lcub;');
          htmlMd = htmlMd.replace(/\}/g, '&rcub;');
        }
        catch (err1) /* istanbul ignore next */ {
          const internalServerError = 500;

          this.utils.error(err1);
          res.status(internalServerError).send(this.utils.httpCodes[internalServerError] + ' - ' + err1);

          return;
        }

        let outputFpt = this.html.headWithMsg;
        outputFpt += this.html.success;
        outputFpt += htmlMd + '\n';
        outputFpt += '<p>&nbsp;</p>\n';
        outputFpt += '<p>&nbsp;</p>\n';
        outputFpt += this.html.foot;

        const output = Feplet.render(
          outputFpt,
          {
            title: successMsg,
            main_id: 'success-page',
            main_class: 'success-page',
            msg_class: 'success',
            message: `<h1>${successMsg}</h1>`,
            origin: req.headers.host,
            search: ts ? `?ts=${ts}` : ''
          }
        );

        res.send(output);
      });
    };
  }
};
