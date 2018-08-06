'use strict';

const path = require('path');

const slash = require('slash');
const utils = require('fepper-utils');

const Fepper = require('../core/fepper');

// Set up global, conf, and pref.
global.rootDir = slash(__dirname);

if (!global.fepper) {
  utils.conf();
  utils.pref();

  // Instantiate a Fepper object and attach it to the global object.
  global.fepper = new Fepper();
}
