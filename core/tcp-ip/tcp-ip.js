'use strict';

const FpExpress = require('./fp-express');

module.exports = class {
  constructor(options) {
    this.fpExpress = new FpExpress(options);
  }

  express() {
    return this.fpExpress.main();
  }
};
