'use strict';

const fs = require('fs-extra');
const open = require('open');

const conf = global.conf;

exports.main = () => {
  const origin = 'http://localhost:' + conf.express_port;
  const log = `${global.workDir}/install.log`;

  if (fs.existsSync(log)) {
    // An option to delay launch in case other asynchronous tasks need to complete.
    setTimeout(() => {
      fs.unlinkSync(log);
      open(origin + '/success');
    }, conf.timeout_main * 2);
  }
  else {
    // An option to delay launch in case other asynchronous tasks need to complete.
    setTimeout(() => {
      open(origin);
    }, conf.timeout_main);
  }
};
