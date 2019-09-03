'use strict';

const path = require('path');

const slash = require('slash');
const utils = require('fepper-utils');

const Tasks = require('./tasks/tasks');
const TcpIp = require('./tcp-ip/tcp-ip');
const Ui = require('./ui/ui');

module.exports = class {
  constructor(cwd) {
    // global.appDir and global.rootDir are used in the gulp app, fepper-utils, extensions, etc.
    // The Pattern Lab fork contained within Fepper uses global in case it is invoked completely independent of Fepper.
    // This strays from the object-oriented paradigm, but where oo is applicable, try to refrain from using global.
    global.appDir = global.appDir || slash(path.resolve(__dirname, '..'));
    global.rootDir = global.rootDir || utils.findupRootDir(cwd, __dirname);
    // utils.conf() and utils.pref() depend on global.appDir and global.rootDir.
    global.conf = utils.conf(); // This runs utils.uiConfigNormalize().
    global.pref = utils.pref();

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
    this.options = options;

    this.tasks = new Tasks(options);
    this.ui = new Ui(options);
    this.tcpIp = new TcpIp(options, this.ui);

    global.fepper = this;
  }
};
