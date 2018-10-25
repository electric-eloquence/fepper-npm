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
        const successMsg = 'Installation success!';
        const successSimple = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body>${successMsg}<br><a href="/">Open Fepper UI</a></body></html>`;

        if (!dat) {
          res.send(successSimple);

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

        let output = '';

        output += this.html.headWithMsg;
        output += this.html.success;
        output += htmlMd + '\n';
        output += '<p>&nbsp;</p>\n';
        output += '<p>&nbsp;</p>\n';
        output += this.html.foot;
        output = output.replace('{{ title }}', successMsg);
        output = output.replace('{{{ patternlabHead }}}', '');
        output = output.replace('{{ main_id }}', 'success-page');
        output = output.replace('{{ main_class }}', 'success-page');
        output = output.replace('{{ msg_class }}', 'success');
        output = output.replace('{{ message }}', `<h1>${successMsg}</h1>`);
        output = output.replace(/\{\{ host \}\}/g, req.headers.host);
        output = output.replace('{{{ patternlabFoot }}}', '');

        res.send(output);
      });
    };
  }
};
