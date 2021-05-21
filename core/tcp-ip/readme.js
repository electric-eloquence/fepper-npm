'use strict';

const Feplet = require('feplet');
const fs = require('fs-extra');
const marked = require('marked');

module.exports = class {
  constructor(fpExpress) {
    this.options = fpExpress.options;
    this.conf = this.options.conf;
    this.rootDir = this.options.rootDir;
    this.utils = this.options.utils;

    this.html = fpExpress.html;
  }

  getHtml() {
    return new Promise((resolve, reject) => {
      fs.readFile(`${this.rootDir}/README.md`, this.conf.enc, (err, dat) => {
        if (!dat) {
          reject({code: 404, msg: err || ''});

          return;
        }

        let htmlFromMd;

        try {
          htmlFromMd = marked(dat);
        }
        catch (err1) /* istanbul ignore next */ {
          this.utils.error(err1);
          reject({code: 500, msg: err1});

          return;
        }

        // Escape curly braces so they don't get interpreted as stashes.
        htmlFromMd = htmlFromMd.replace(/\{/g, '&lcub;');
        htmlFromMd = htmlFromMd.replace(/\}/g, '&rcub;');

        resolve(htmlFromMd);
      });
    });
  }

  main() {
    return (req, res) => {
      this.getHtml()
        .then((htmlFromMd) =>{
          let outputFpt = this.html.head;
          outputFpt += htmlFromMd + '\n';
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
            res.writeHead(statusData.code).send(this.utils.httpCodes[statusData.code] + ' - ' + statusData.msg);
          }
          else {
            this.utils.error(statusData.msg);

            res.writeHead(statusData.code).send(this.utils.httpCodes[statusData.code] || '');
          }
        });
    };
  }
};
