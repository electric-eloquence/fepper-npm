'use strict';

const path = require('path');
const slash = require('slash');
const utils = require('fepper-utils');

const Tasks = require('./tasks/tasks');
const TcpIp = require('./tcp-ip/tcp-ip');
const Ui = require('./ui/ui');

module.exports = class {
  constructor(cwd) {
    // global.appDir is thus far only used in fepper-utils, but is mandatory as such.
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

    this.conf = options.conf = global.conf;
    this.pref = options.pref = global.pref;
    this.rootDir = options.rootDir = global.rootDir;
    this.utils = options.utils = utils;

    this.tasks = new Tasks(options);
    this.tcpIp = new TcpIp(options);
    this.ui = new Ui(options);
  }
};
