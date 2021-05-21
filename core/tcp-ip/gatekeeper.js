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
    const timestampFile = `${this.rootDir}/.timestamp`;
    let timestampStr;

    if (fs.existsSync(timestampFile)) {
      timestampStr = fs.readFileSync(timestampFile, this.conf.enc);
    }

    if (this.utils.deepGet(req, 'cookies.fepper_ts') === timestampStr) {
      return req.cookies.fepper_ts;
    }
    else {
      return '';
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

      res.status(403).send(output);
    };
  }

  respond() {
    return (req, res) => {
      if (this.gatekeep(req)) {
        res.writeHead(200).end(req.cookies.fepper_ts);
      }
      else {
        res.writeHead(404).end();
      }
    };
  }
};
