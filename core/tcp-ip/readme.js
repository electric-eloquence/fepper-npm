'use strict';

const fs = require('fs');
const marked = require('8fold-marked');

const htmlObj = require('../lib/html');
const utils = require('../lib/utils');

const conf = global.conf;

exports.main = function (req, res) {
  fs.readFile(utils.pathResolve('README.md'), conf.enc, function (err, dat) {
    if (err) {
      utils.error(err);
    }

    if (!dat) {
      res.end(utils.httpCodes['404']);

      return;
    }

    let htmlMd;

    try {
      htmlMd = marked(dat);
    }
    catch (err) {
      utils.error(err);
      res.end(err);

      return;
    }

    let output = htmlObj.head;
    output += htmlMd + '\n';
    output += htmlObj.foot;
    output = output.replace('{{ title }}', 'Fepper');
    res.end(output);
  });
};
