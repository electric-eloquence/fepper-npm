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

  getHtml() {
    return new Promise((resolve, reject) => {
      fs.readFile(`${this.rootDir}/README.md`, this.conf.enc, (err, dat) => {
        if (!dat) {
          reject({code: 404, msg: err || ''});

          return;
        }

        let htmlMd;

        try {
          htmlMd = marked(dat);
        }
        catch (err1) /* istanbul ignore next */ {
          this.utils.error(err1);
          reject({code: 500, msg: err1});

          return;
        }

        // Escape curly braces so they don't get interpreted as stashes.
        htmlMd = htmlMd.replace(/\{/g, '&lcub;');
        htmlMd = htmlMd.replace(/\}/g, '&rcub;');

        resolve(htmlMd);
      });
    });
  }

  main() {
    return (req, res) => {
      this.getHtml()
        .then((htmlMd) =>{
          let outputFpt = this.html.head;
          outputFpt += htmlMd + '\n';
          outputFpt += this.html.foot;

          const output = Feplet.render(
            outputFpt,
            {
              title: 'Fepper',
              body_class: 'text',
              main_id: 'readme',
              main_class: 'readme'
            }
          );

          res.send(output);
        })
        .catch((statusData) => {
          /* istanbul ignore if */
          if (statusData.code === 500) {
            res.status(statusData.code).send(this.utils.httpCodes[statusData.code] + ' - ' + statusData.msg);
          }
          else {
            this.utils.error(statusData.msg);

            res.status(statusData.code).send(this.utils.httpCodes[statusData.code] || '');
          }
        });
    };
  }
};
