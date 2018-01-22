'use strict';

const fs = require('fs-extra');
const path = require('path');

const fepperUtils = require(global.appDir + '/core/lib/utils');

// http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
exports.shuffle = function (o) {
  // eslint-disable-next-line curly
  for (let j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};

exports.logGreen = function (message) {
  console.log('\x1b[32m', message, '\x1b[0m');
};

exports.logRed = function (message) {
  console.log('\x1b[41m', message, '\x1b[0m');
};

exports.extendButNotOverride = fepperUtils.extendButNotOverride;

exports.isObjectEmpty = function (obj) {
  for (let prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return true;
};
