'use strict';

const utils = require('fepper-utils');

const Fepper = require('../core/fepper');
global.rootDir = __dirname;
global.confOrig = global.conf || utils.conf();
global.prefOrig = global.pref || utils.pref();
global.conf = {};
global.pref = {};

utils.extendButNotOverride(global.conf, global.confOrig);
global.conf.ui.paths.source.templates += '-retain-mustache';

utils.extendButNotOverride(global.pref, global.prefOrig);
global.pref.backend.synced_dirs.templates_dir += '-retain-mustache';
global.pref.backend.synced_dirs.templates_ext = '.mustache';
global.pref.templater.retain_mustache = true;

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
