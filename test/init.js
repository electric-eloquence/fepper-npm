'use strict';

const Fepper = require('../core/fepper');

module.exports = () => {
  return {
    fepper: new Fepper(__dirname),
    responseFactory: (resolve) => {
      const response = {
        send: (output) => {
          resolve(output);
        },
        status: () => response
      };

      return response;
    }
  };
};
