'use strict';

const path = require('path');

const diveSync = require('diveSync');
const fs = require('fs-extra');

module.exports = class {
  constructor(options) {
    this.options = options;
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
    else if (arg === 'help') {
      this.patternlab.help();
    }
    else {
      this.patternlab.help();
    }
  }

  clean() {
    try {
      fs.emptyDirSync(this.pubDir.patterns);
    }
    catch (err) /* istanbul ignore next */ {
      this.utils.error(err);
    }
  }

  compile() {
    this.patternlab.compile();
  }

  copyAssets() {
    try {
      fs.copySync(this.srcDir.images, this.pubDir.images);
    }
    catch (err) /* istanbul ignore next */ {
      this.utils.error(err);
    }
  }

  copyScripts() {
    try {
      fs.copySync(this.srcDir.js, this.pubDir.js);
    }
    catch (err) /* istanbul ignore next */ {
      this.utils.error(err);
    }
  }

  copyStatic() {
    if (this.utils.deepGet(this, 'srcDir.static') && this.utils.deepGet(this, 'pubDir.patterns')) {
      try {
        fs.copySync(this.srcDir.static, this.pubDir.static);
      }
      catch (err) /* istanbul ignore next */ {
        this.utils.error(err);
      }
    }
  }

  copyStylesRoot() {
    fs.ensureDirSync(this.pubDir.css);
    diveSync(
      this.srcDir.css,
      {recursive: false},
      (err, file) => {
        /* istanbul ignore if */
        if (err) {
          this.utils.error(err);
        }

        try {
          fs.copySync(file, `${this.pubDir.css}/${path.basename(file)}`);
        }
        catch (err1) /* istanbul ignore next */ {
          this.utils.error(err1);
        }
      }
    );
  }

  copyStylesBld() {
    fs.ensureDirSync(this.pubDir.cssBld);
    diveSync(
      this.srcDir.cssBld,
      {
        filter: (pathStr, dir) => {
          const pathObj = path.parse(pathStr);

          if (dir || pathObj.ext === '.css') {
            return true;
          }
          else {
            return false;
          }
        }
      },
      (err, file) => {
        /* istanbul ignore if */
        if (err) {
          this.utils.error(err);
        }

        try {
          fs.copySync(file, file.replace(this.srcDir.cssBld, this.pubDir.cssBld));
        }
        catch (err1) /* istanbul ignore next */ {
          this.utils.error(err1);
        }
      }
    );
  }

  // Making the distinction between copyStylesBld and copyStylesOther so LiveReload isn't triggered when a non-css file
  // is modified.
  copyStylesOther() {
    fs.ensureDirSync(this.pubDir.cssBld);
    diveSync(
      this.srcDir.cssBld,
      {
        filter: (pathStr, dir) => {
          const pathObj = path.parse(pathStr);

          if (dir || pathObj.ext !== '.css') {
            return true;
          }
          else {
            return false;
          }
        }
      },
      (err, file) => {
        /* istanbul ignore if */
        if (err) {
          this.utils.error(err);
        }

        try {
          fs.copySync(file, file.replace(this.srcDir.cssBld, this.pubDir.cssBld));
        }
        catch (err1) /* istanbul ignore next */ {
          this.utils.error(err1);
        }
      }
    );
  }
};
