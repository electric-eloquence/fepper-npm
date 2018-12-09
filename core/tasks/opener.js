'use strict';

const fs = require('fs-extra');

const opn = require('opn');

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
    fs.outputFileSync(`${this.rootDir}/.timestamp`, timestamp);

    if (fs.existsSync(log)) {
      fs.removeSync(log);
      opn(origin + '/success?ts=' + timestamp);
    }
    else {
      opn(origin + '?ts=' + timestamp);
    }
  }
};
