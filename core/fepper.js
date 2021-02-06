'use strict';

const path = require('path');

const fs = require('fs-extra');
const slash = require('slash');

// global.appDir and global.rootDir are used in the gulp app, fepper-utils, extensions, etc.
// The Pattern Lab fork contained within Fepper uses global in case it is invoked completely independent of Fepper.
// This strays from the object-oriented paradigm, but where oo is applicable, try to refrain from using global.
global.appDir = global.appDir || slash(path.resolve(__dirname, '..'));

const utils = require('fepper-utils');

const Tasks = require('./tasks/tasks');
const TcpIp = require('./tcp-ip/tcp-ip');
const Ui = require('./ui/ui');

module.exports = class {
  constructor(cwd) {
    global.rootDir = global.rootDir || utils.findupRootDir(cwd, __dirname);
    // utils.pref() and utils.conf() depend on global.appDir and global.rootDir.
    global.pref = global.pref || utils.pref(); // pref() must run before conf() in order for i18n to work.
    global.conf = global.conf || utils.conf(); // This runs utils.uiConfigNormalize().

    /* istanbul ignore if */
    if (!global.conf) {
      throw new Error('ENOENT');
    }

    /* istanbul ignore if */
    if (!global.pref) {
      throw new Error('ENOENT');
    }

    const options = {};

    this.appDir = options.appDir = global.appDir;
    this.conf = options.conf = global.conf;
    this.pref = options.pref = global.pref;
    this.rootDir = options.rootDir = global.rootDir;
    this.utils = options.utils = utils;

    const packageDistro = fs.readJsonSync(`${options.rootDir}/package.json`, {throws: false});
    const packageNpm = fs.readJsonSync(`${options.appDir}/package.json`, {throws: false});
    const packageUi = fs.readJsonSync(`${options.conf.ui.paths.public.styleguide}/package.json`, {throws: false});

    options.distro = {
      name: this.utils.deepGet(packageDistro, 'name') || '',
      version: this.utils.deepGet(packageDistro, 'version') || ''
    };
    options.npm = {
      version: this.utils.deepGet(packageNpm, 'version') || ''
    };
    options.ui = {
      version: this.utils.deepGet(packageUi, 'version') || ''
    };

    this.options = options;

    this.ui = new Ui(options);
    this.tasks = new Tasks(options, this.ui);
    this.tcpIp = new TcpIp(options, this.ui);

    global.fepper = global.fepper || this;
  }
};
