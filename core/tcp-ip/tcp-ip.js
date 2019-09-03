'use strict';

const FpExpress = require('./fp-express');

module.exports = class {
  constructor(options, ui) {
    this.options = options;
    this.fpExpress = new FpExpress(options, ui);
  }
};
