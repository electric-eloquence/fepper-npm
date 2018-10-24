'use strict';

const fs = require('fs');

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
        }
        catch (err1) {
          const internalServerError = 500;

          this.utils.error(err1);
          res.status(internalServerError).send(this.utils.httpCodes[internalServerError] + ' - ' + err1);

          return;
        }

        let output = this.html.head;
        output += htmlMd + '\n';
        output += this.html.foot;
        output = output.replace('{{ title }}', 'Fepper');
        output = output.replace('{{{ patternlabHead }}}', '');
        output = output.replace('{{ main_id }}', 'readme');
        output = output.replace('{{ main_class }}', 'readme');
        output = output.replace('{{{ patternlabFoot }}}', '');

        res.send(output);
      });
    };
  }
};
