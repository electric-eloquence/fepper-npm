'use strict';

const htmlObj = require('../lib/html');

exports.main = function (req, res) {
  var output = '';

  output += htmlObj.headWithMsg;
  output += '<script src="bower_components/fepper-ui/scripts/html-scraper-ajax.js"></script>\n';
  output += htmlObj.foot;
  output = output.replace('{{ title }}', 'Fepper HTML Scraper');
  output = output.replace('{{ msg_class }}', '');
  output = output.replace('{{ message }}', '');
  res.end(output);
};
