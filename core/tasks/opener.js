'use strict';

const fs = require('fs-extra');
const open = require('../lib/open');

const conf = global.conf;

exports.main = () => {
  const origin = 'http://localhost:' + conf.express_port;
  const log = `${global.workDir}/install.log`;
  const timestamp = Date.now();

  // Write timestamp to file system to validate browser is on same machine to prevent attacks with HTML scraper from
  // another machine.
  fs.writeFileSync(`${global.workDir}/.timestamp`, timestamp);

  if (fs.existsSync(log)) {
    // An option to delay launch in case other asynchronous tasks need to complete.
    setTimeout(() => {
      fs.unlinkSync(log);
      open(origin + '/success?ts=' + timestamp);
    }, conf.timeout_main * 2);
  }
  else {
    // An option to delay launch in case other asynchronous tasks need to complete.
    setTimeout(() => {
      open(origin + '?ts=' + timestamp);
    }, conf.timeout_main);
  }
};
