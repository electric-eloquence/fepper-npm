'use strict';

const FpExpress = require('./fp-express');

module.exports = class {
  constructor(options, ui) {
    this.fpExpress = new FpExpress(options, ui);
    this.ui = ui;
  }

  express() {
    return this.fpExpress.main();
  }
};
