'use strict';

const fs = require('fs-extra');

const open = require('open');

module.exports = class {
  constructor(options, ui) {
    this.options = options;
    this.conf = options.conf;
    this.rootDir = options.rootDir;
    this.ui = ui;
  }

  timestamp() {
    const timestamp = Date.now().toString();

    // Write timestamp to file system to validate browser is on same machine to prevent attacks with HTML POSTS from
    // another machine.
    fs.outputFileSync(`${this.rootDir}/.timestamp`, timestamp);

    return timestamp;
  }

  main() /* istanbul ignore next */ {
    const origin = 'http://localhost:' + this.conf.express_port;
    const log = `${this.rootDir}/install.log`;

    const timestamp = this.timestamp();

    if (fs.existsSync(log)) {
      // The reason for copying the static dir here is so the public static dir exists immediately after installation.
      // However, we don't want to copy the entire static site on each build thereafter, only after static generation.
      this.ui.copyStatic();
      fs.removeSync(log);
      open(origin + '/success?ts=' + timestamp);
    }
    else {
      open(origin + '?ts=' + timestamp);
    }
  }
};
