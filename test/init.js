'use strict';

const Fepper = require('../core/fepper');

// Instantiate a Fepper object and attach it to the global object.
global.fepper = new Fepper(__dirname);

// Global helpers.
global.responseFactory = (resolve) => {
  const response = {
    send: (output) => {
      resolve(output);
    },
    status: () => response
  };

  return response;
};
