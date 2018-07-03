'use strict';

const fs = require('fs');

const marked = require('marked');

const htmlObj = require('../lib/html');
const utils = require('../lib/utils');

const conf = global.conf;

exports.main = (req, res) => {
  fs.readFile(utils.pathResolve('README.md'), conf.enc, (err, dat) => {
    if (err) {
      utils.error(err);
    }

    if (!dat) {
      const notFound = 404;

      res.status(notFound).send(utils.httpCodes[notFound]);

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

    let output = htmlObj.head;
    output += htmlMd + '\n';
    output += htmlObj.foot;
    output = output.replace('{{ title }}', 'Fepper');

    res.send(output);
  });
};
