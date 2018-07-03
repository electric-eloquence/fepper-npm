'use strict';

const path = require('path');

const request = require('request');

const gatekeeper = require('./gatekeeper');
const htmlObj = require('../lib/html');
const utils = require('../lib/utils');

const conf = global.conf;

exports.cors = (req, res) => {
  if (!gatekeeper.gatekeep(req)) {
    gatekeeper.render(req, res);

    return;
  }

  try {
    request(req.query.url, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        res.send(body);
      }
      else {
        res.status(response.statusCode).end();
      }
    });
  }
  catch (err) {
    utils.error(err);
  }
};

exports.main = (req, res) => {
  if (!gatekeeper.gatekeep(req)) {
    gatekeeper.render(req, res);

    return;
  }

  let message = '';
  let msgClass = '';
  let output = '';
  let selector = '';
  let url = '';

  if (req.query) {
    if (typeof req.query.msg_class === 'string') {
      msgClass = req.query.msg_class;
    }
    if (typeof req.query.message === 'string') {
      message = req.query.message;
    }
    if (typeof req.query.selector === 'string') {
      selector = req.query.selector;
    }
    if (typeof req.query.url === 'string') {
      url = req.query.url;
    }
  }

  output += '<!DOCTYPE html>\n';
  output += '<html>\n';
  output += `<div id="message" class="message ${msgClass}">${message}</div>\n`;
  output += htmlObj.scraperTitle;
  output += htmlObj.landingBody;
  output += '</html>\n';

  output = output.replace('{{ main_id }}', 'scraper');
  output = output.replace('{{ main_class }}', 'scraper');
  output = output.replace('{{ url }}', url);
  output = output.replace('{{ selector }}', selector);

  const srcPatterns = `${path.normalize(conf.ui.paths.source.patterns)}/`;
  const srcScrape = path.normalize(conf.ui.paths.source.scrape);
  const scrapePrefix = path.normalize(srcScrape.replace(srcPatterns, ''));
  const scrapePath = `/patterns/${scrapePrefix}-00-html-scraper/${scrapePrefix}-00-html-scraper.html`;
  let attributes = '';

  if (req.headers.referer.indexOf(scrapePath) > -1) {
    attributes = 'target="_blank"';
  }
  output = output.replace('{{ attributes }}', attributes);

  res.send(output);
};
