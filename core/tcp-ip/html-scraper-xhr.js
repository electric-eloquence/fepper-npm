'use strict';

const path = require('path');

const htmlObj = require('../lib/html');

const conf = global.conf;

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

  output += '<!DOCTYPE html>\n';
  output += '<html>\n';
  output += '<link rel="stylesheet" href="/fepper-core/style.css" media="all" />\n';
  output += '<section>\n';
  output += `<div class="${msgClass}">${message}</div>\n`;
  output += htmlObj.scraperTitle;
  output += htmlObj.landingBody;
  output += '</section>';
  output += '</html>\n';
  output = output.replace('{{ message }}', message);
  output = output.replace('{{ url }}', url);
  output = output.replace('{{ target }}', target);

  let srcPatterns = `${path.normalize(conf.ui.paths.source.patterns)}/`;
  let srcScrape = path.normalize(conf.ui.paths.source.scrape);
  var scrapePrefix = path.normalize(srcScrape.replace(srcPatterns, ''));
  var scrapePath = `/patterns/${scrapePrefix}-00-html-scraper/${scrapePrefix}-00-html-scraper.html`;

  let attributes = '';
  if (req.headers.referer.indexOf(scrapePath) > -1) {
    attributes = 'target="_blank"';
  }
  output = output.replace('{{ attributes }}', attributes);

  res.end(output);
};
