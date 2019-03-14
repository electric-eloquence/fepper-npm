'use strict';

const path = require('path');
const spawnSync = require('child_process').spawnSync;

const fs = require('fs-extra');

module.exports = class {
  constructor(options) {
    this.options = options;
    this.appDir = options.appDir;
    this.conf = options.conf;
    this.utils = options.utils;
    this.extendDir = this.conf.extend_dir;
    this.publicDir = this.conf.ui.paths.public.root;
    this.sourceDir = this.conf.ui.paths.source.root;

    // Spawn npm.cmd if Windows.
    if (
      this.conf.is_windows ||
      // eslint-disable-next-line max-len
      process.env.ComSpec && process.env.ComSpec.toLowerCase() === 'c:\\windows\\system32\\cmd.exe' // Deprecated condition.
    ) {
      this.binNpm = 'npm.cmd';
    }
    else {
      this.binNpm = 'npm';
    }
  }

  copy() {
    // Copy source dir if it doesn't exist.
    if (!fs.existsSync(this.sourceDir)) {
      fs.copySync(`${this.appDir}/excludes/profiles/main/source`, this.sourceDir);
    }

    // Copy extend dir if it doesn't exist.
    if (!fs.existsSync(this.extendDir)) {
      fs.copySync(`${this.appDir}/excludes/profiles/main/extend`, this.extendDir);
    }

    // Run npm install in extend dir if no extend/node_modules dir.
    if (!fs.existsSync(`${this.extendDir}/node_modules`)) {
      process.chdir(this.extendDir);
      this.utils.log(`Working directory changed to ${path.resolve(this.extendDir)}.`);
      spawnSync(this.binNpm, ['install'], {stdio: 'inherit'});
    }

    // Run npm install in public dir if no public/node_modules dir.
    if (!fs.existsSync(`${this.publicDir}/node_modules`)) {
      process.chdir(this.publicDir);
      this.utils.log(`Working directory changed to ${path.resolve(this.publicDir)}.`);
      spawnSync(this.binNpm, ['install'], {stdio: 'inherit'});
    }

    // Finish up.
    const cwd = process.cwd();

    process.chdir(cwd);
    this.utils.log(`Working directory changed to ${cwd}.`);
  }

  copyBase() {
    if (!fs.existsSync(this.sourceDir)) {
      fs.copySync(`${this.appDir}/excludes/profiles/base/source`, this.sourceDir);
    }

    if (!fs.existsSync(this.extendDir)) {
      fs.copySync(`${this.appDir}/excludes/profiles/base/extend`, this.extendDir);
    }
  }
};
