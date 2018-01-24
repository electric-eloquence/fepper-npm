'use strict';

const fs = require('fs-extra');

const utils = require('../lib/utils');

const conf = global.conf;
const workDir = global.workDir;

const patternlab = new (require(utils.pathResolve(`${conf.ui.paths.core.lib}/patternlab.js`)))(conf.ui, workDir);
const pubDir = conf.ui.paths.public;
const srcDir = conf.ui.paths.source;

module.exports = class {
  build(arg) {
    if (typeof arg === 'undefined') {
      patternlab.build();
    }
    else if (arg === 'v') {
      patternlab.version();
    }
    else if (arg === 'patternsonly') {
      patternlab.patternsonly();
    }
    else if (arg === 'help') {
      patternlab.help();
    }
    else {
      patternlab.help();
    }
  }

  clean() {
    fs.removeSync(utils.pathResolve(pubDir.patterns));
  }

  compile() {
    return patternlab.compileui()
      .catch(err => {
        utils.error(err);
      })
      .then(() => {
        this.build();

        return Promise.resolve();
      });
  }

  compileui() {
    return patternlab.compileui()
      .catch(err => {
        utils.error(err);
      })
  }

  copy() {
    fs.copySync(utils.pathResolve(srcDir.images), utils.pathResolve(pubDir.images));
    fs.copySync(utils.pathResolve(srcDir.js), utils.pathResolve(pubDir.js));
    fs.copySync(utils.pathResolve(srcDir.static), utils.pathResolve(pubDir.static));
  }

  copyStyles() {
    fs.copySync(utils.pathResolve(srcDir.cssBld), utils.pathResolve(pubDir.cssBld));
  }
};
