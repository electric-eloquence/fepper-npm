'use strict';

const Fepper = require('../core/fepper');

module.exports = () => {
  return {
    fepper: new Fepper(__dirname),
    responseFactory: (resolve) => {
      const response = {
        end: (responseText) => {
          response.responseText = responseText;

          resolve(response);
        },
        send: (responseText) => {
          response.responseText = responseText;

          resolve(response);
        },
        sendStatus: (status) => {
          response.status = status;

          resolve(response);
        },
        writeHead: (status, headers) => {
          response.status = status;
          response.headers = headers;

          return response;
        }
      };

      return response;
    }
  };
};
