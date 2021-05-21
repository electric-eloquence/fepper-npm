'use strict';

const html = require('../lib/html');

const FpExpress = require('./fp-express');

module.exports = class {
  constructor(options, ui) {
    this.options = options;
    this.fpExpress = new FpExpress(options, html, ui);
  }
};
