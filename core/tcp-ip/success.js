'use strict';

const fs = require('fs');

const marked = require('marked');

const htmlObj = require('../lib/html');
const utils = require('../lib/utils');

const conf = global.conf;

exports.main = (req, res) => {
  fs.readFile(utils.pathResolve('README.md'), conf.enc, (err, dat) => {
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

      utils.error(err1);
      res.status(internalServerError).send(utils.httpCodes[internalServerError] + ' - ' + err1);

      return;
    }

    let output = '';

    output += htmlObj.headWithMsg;
    output += htmlObj.success;
    output += htmlMd + '\n';
    output += '<p>&nbsp;</p>\n';
    output += '<p>&nbsp;</p>\n';
    output += htmlObj.foot;
    output = output.replace('{{ title }}', successMsg);
    output = output.replace('{{ msg_class }}', 'success');
    output = output.replace('{{ message }}', `<h1>${successMsg}</h1>`);
    output = output.replace(/\{\{ host \}\}/g, req.headers.host);

    res.send(output);
  });
};
