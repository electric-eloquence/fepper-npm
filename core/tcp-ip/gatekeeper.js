'use strict';

const fs = require('fs-extra');

module.exports = class {
  constructor(options, html) {
    this.conf = options.conf;
    this.rootDir = options.rootDir;
    this.html = html;
  }

  /**
   * Ensure that browser-driven operations on the file system are performed from a browser on the same machine as that
   * file system. This does not need to be submitted as a callback, and therefore, does not need to be a closure.
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

    if (req.cookies.fepper_ts && timestampStr && req.cookies.fepper_ts === timestampStr) {
      return req.cookies.fepper_ts;
    }
    else {
      return '';
    }
  }

  render() {
    return (req, res) => {
      let output = `
<!DOCTYPE html>
<html>
  <body>
`;
      output += this.html.forbidden;
      output += `
  </body>
</html>`;

      res.send(output);
    };
  }

  respond() {
    return (req, res) => {
      if (this.gatekeep(req)) {
        res.send(req.cookies.fepper_ts);
      }
      else {
        res.status(404).end();
      }
    };
  }
};
