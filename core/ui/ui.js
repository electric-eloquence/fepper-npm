'use strict';

const path = require('path');

const diveSync = require('diveSync');
const fs = require('fs-extra');

module.exports = class {
  constructor(options) {
    this.conf = options.conf;
    this.rootDir = options.rootDir;
    this.utils = options.utils;

    this.patternlab =
      new (require(`${this.conf.ui.paths.core}/lib/patternlab.js`))(this.conf.ui, this.rootDir);
    this.pubDir = this.conf.ui.paths.public;
    this.srcDir = this.conf.ui.paths.source;
  }

  build(arg) {
    if (typeof arg === 'undefined') {
      this.patternlab.build();
    }
    else if (arg === 'v') {
      this.patternlab.version();
    }
    else if (arg === 'patternsonly') {
      this.patternlab.patternsonly();
    }
    else if (arg === 'help') {
      this.patternlab.help();
    }
    else {
      this.patternlab.help();
    }
  }

  clean() {
    fs.removeSync(this.pubDir.patterns);
  }

  compile() {
    return this.patternlab.compileui()
      .catch(err => {
        this.utils.error(err);
      })
      .then(() => {
        this.build();
      });
  }

  compileui() {
    return this.patternlab.compileui()
      .catch(err => {
        this.utils.error(err);
      });
  }

  copy() {
    fs.copySync(this.srcDir.images, this.pubDir.images);
    fs.copySync(this.srcDir.js, this.pubDir.js);
    fs.copySync(this.srcDir.static, this.pubDir.static);
  }

  copyStyles() {
    const srcDirCss = this.srcDir.css;

    diveSync(
      srcDirCss,
      {recursive: false},
      (err, file) => {
        if (err) {
          this.utils.error(err);
        }
        fs.copyFileSync(file, `${this.pubDir.css}/${path.basename(file)}`);
      }
    );
    fs.copySync(this.srcDir.cssBld, this.pubDir.cssBld);
  }
};
