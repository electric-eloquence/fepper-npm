'use strict';

const utils = require('fepper-utils');

const Tasks = require('./tasks/tasks');
const TcpIp = require('./tcp-ip/tcp-ip');
const Ui = require('./ui/ui');

module.exports = class {
  constructor() {
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
