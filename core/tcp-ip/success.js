'use strict';

const fs = require('fs');
const marked = require('8fold-marked');

const htmlObj = require('../lib/html');
const utils = require('../lib/utils');

const conf = global.conf;

exports.main = function (req, res) {
  fs.readFile(utils.pathResolve('README.md'), conf.enc, function (err, dat) {
    const successMsg = 'Installation success!';

    if (!dat) {
      res.end(successMsg);
      return;
    }

    var htmlMd = marked(dat);
    var output = '';

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
