'use strict';

const util = require('util');

const fs = require('fs-extra');

module.exports = class {
  constructor(fpExpress) {
    this.html = fpExpress.html;
    this.options = fpExpress.options;
    this.conf = this.options.conf;
    this.rootDir = this.options.rootDir;
    this.utils = this.options.utils;
  }

  /**
   * Ensure that browser-driven operations on the file system are performed from a browser on the same machine as that
   * file system. This does not get submitted as an Express callback argument.
   *
   * @param {object} req - Express request.
   * @returns {string} The timestamp cookie value or empty string.
   */
  gatekeep(req) {
    const dateNow = Date.now();
    const timestampFile = `${this.rootDir}/.timestamp`;
    const timestampLockFile = `${this.rootDir}/.timestamp.lock`;
    let timestampStr;

    if (fs.existsSync(timestampLockFile)) {
      const timestampLock = Number(fs.readFileSync(timestampLockFile, this.conf.enc));

      // Severely hamper brute-force attempts to guess the timestamp by limiting guesses to once every 5 seconds.
      if (isNaN(timestampLock) || (dateNow - timestampLock) < 5000) {
        return;
      }
    }

    if (fs.existsSync(timestampFile)) {
      timestampStr = fs.readFileSync(timestampFile, this.conf.enc);
    }

    if (this.utils.deepGet(req, 'cookies.fepper_ts') === timestampStr) {
      fs.removeSync(timestampLockFile);

      return req.cookies.fepper_ts;
    }
    else {
      // Only write timestamp lockfile on incorrect guesses.
      fs.outputFileSync(timestampLockFile, dateNow.toString());

      return;
    }
  }

  render(subst) {
    return (req, res) => {
      let output = `
<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"></head>
  <body>
`;
      output += util.format(this.html.forbidden, subst);
      output += `
  </body>
</html>`;

      res.writeHead(403).end(output);
    };
  }

  respond() {
    return (req, res) => {
      const gatekeepResult = this.gatekeep(req);

      if (typeof gatekeepResult === 'string') {
        res.writeHead(200).end(req.cookies.fepper_ts);
      }
      else {
        this.render(req.query.tool)(req, res);
      }
    };
  }
};
