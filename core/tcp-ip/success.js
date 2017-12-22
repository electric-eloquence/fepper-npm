'use strict';

const fs = require('fs');
const marked = require('8fold-marked');

const htmlObj = require('../lib/html');
const utils = require('../lib/utils');

const conf = global.conf;

exports.main = (req, res) => {
  fs.readFile(utils.pathResolve('README.md'), conf.enc, (err, dat) => {
    const successMsg = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body>Installation success!<br><a href="/">Open Fepper UI</a></body></html>`;

    if (!dat) {
      res.end(successMsg);

      return;
    }

    let htmlMd;

    try {
      htmlMd = marked(dat);
    }
    catch (err1) {
      utils.error(err1);
      res.end(successMsg);

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
    output = output.replace(/localhost:3000/g, req.headers.host);

    res.end(output);
  });
};
