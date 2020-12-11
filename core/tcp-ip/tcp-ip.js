'use strict';

const html = require('../lib/html');

const ErrorResponse = require('./error-response');
const FpExpress = require('./fp-express');

module.exports = class {
  constructor(options, ui) {
    this.options = options;
    this.errorResponse = new ErrorResponse(options, html);
    this.fpExpress = new FpExpress(options, ui, html);
  }
};
