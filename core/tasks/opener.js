'use strict';

const fs = require('fs-extra');

const open = require('../lib/open');

module.exports = class {
  constructor(options) {
    this.conf = options.conf;
    this.rootDir = options.rootDir;
  }

  main() {
    const origin = 'http://localhost:' + this.conf.express_port;
    const log = `${this.rootDir}/install.log`;
    const timestamp = Date.now();

    // Write timestamp to file system to validate browser is on same machine to prevent attacks with HTML scraper from
    // another machine.
    fs.writeFileSync(`${this.rootDir}/.timestamp`, timestamp);

    if (fs.existsSync(log)) {
      // An option to delay launch in case other asynchronous tasks need to complete.
      setTimeout(() => {
        fs.unlinkSync(log);
        open(origin + '/success?ts=' + timestamp);
      }, this.conf.timeout_main * 2);
    }
    else {
      // An option to delay launch in case other asynchronous tasks need to complete.
      setTimeout(() => {
        open(origin + '?ts=' + timestamp);
      }, this.conf.timeout_main);
    }
  }
};
