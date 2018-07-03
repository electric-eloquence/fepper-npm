'use strict';

const fs = require('fs-extra');

const htmlObj = require('../lib/html');

const conf = global.conf;

/**
 * Ensure that browser-driven operations on the file system are performed from a browser on the same machine as that
 * file system.
 *
 * @param {object} req - Express request.
 * @return {string} The timestamp cookie value or empty string.
 */
exports.gatekeep = (req) => {
  const timestampFile = `${global.workDir}/.timestamp`;
  let timestampStr;

  if (fs.existsSync(timestampFile)) {
    timestampStr = fs.readFileSync(timestampFile, conf.enc);
  }

  if (req.cookies.fepper_ts && timestampStr && req.cookies.fepper_ts === timestampStr) {
    return req.cookies.fepper_ts;
  }
  else {
    return '';
  }
};

exports.render = (req, res) => {
  let output = `
<!DOCTYPE html>
<html>
  <head>
  <meta charset="UTF-8">
  </head>\n;
  <body>
`;
  output += htmlObj.forbidden;
  output += `
  </body>
</html>`;

  res.send(output);
};

exports.respond = (req, res) => {
  if (exports.gatekeep(req)) {
    res.send(req.cookies.fepper_ts);
  }
  else {
    res.status(404).end();
  }
};
