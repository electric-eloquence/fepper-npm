'use strict';

const htmlObj = require('../lib/html');

exports.main = function (req, res) {
  // Gatekept by fepper-ui/scripts/html-scraper-ajax.js.

  let output = '';
  output += htmlObj.headWithMsg;
  output += htmlObj.scraperTitle;
  output += '<script src="node_modules/fepper-ui/scripts/html-scraper-ajax.js"></script>\n';
  output += htmlObj.foot;
  output = output.replace('{{ title }}', 'Fepper HTML Scraper');
  output = output.replace('{{ main_id }}', 'scraper');
  output = output.replace('{{ main_class }}', 'scraper');
  output = output.replace('{{ msg_class }}', '');
  output = output.replace('{{ message }}', '');

  res.send(output);
};
