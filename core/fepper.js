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
    // They stray from the object-oriented paradigm, but where oo is applicable, try to refrain from using global.
    global.appDir = slash(path.resolve(__dirname, '..'));

    let rootDir = '';

    if (cwd) {
      rootDir = slash(cwd);
    }
    else if (process.env.ROOT_DIR) {
      rootDir = slash(process.env.ROOT_DIR);
    }
    else {
      // utils.findup() will replace backslashes with slashes.
      rootDir = utils.findup('fepper.command', __dirname);
    }

    if (!rootDir) {
      utils.error('Fepper cannot find the directory in which to start working! ' +
        'You may need to submit it as a constructor argument! Exiting!');
      throw new Error('EINVAL');
    }

    global.rootDir = rootDir;

    utils.conf(); // This runs utils.uiConfigNormalize().
    utils.pref();

    if (!global.conf) {
      throw new Error('ENOENT');
    }

    if (!global.pref) {
      throw new Error('ENOENT');
    }

    const options = {};

    this.appDir = options.rootDir = global.appDir;
    this.conf = options.conf = global.conf;
    this.pref = options.pref = global.pref;
    this.rootDir = options.rootDir = global.rootDir;
    this.utils = options.utils = utils;

    this.tasks = new Tasks(options);
    this.ui = new Ui(options);
    this.tcpIp = new TcpIp(options, this.ui);
  }
};
