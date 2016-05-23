'use strict';

var htmlObj = require('../lib/html');

exports.main = function (req, res) {
  var message = '';
  var msgClass = '';
  var output = '';
  var target = '';
  var url = '';

  if (req.query) {
    if (typeof req.query.msg_class === 'string') {
      msgClass = req.query.msg_class;
    }
    if (typeof req.query.message === 'string') {
      message = req.query.message;
    }
  }

  output += '<link rel="stylesheet" href="/fepper-core/style.css" media="all"\n>';
  output += '<section>\n';
  output += '<div class="' + msgClass + '">' + message + '</div>\n';
  output += htmlObj.scraperTitle;
  output += htmlObj.landingBody;
  output += '</section>';
  output = output.replace('{{ attributes }}', ' target="_blank"');
  output = output.replace('{{ message }}', message);
  output = output.replace('{{ url }}', url);
  output = output.replace('{{ target }}', target);
  res.end(output);
};
