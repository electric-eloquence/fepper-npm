'use strict';

/* istanbul ignore file */

const {execFile} = require('child_process');

// Exporting module.exports as a class so req and res can be responsibly scoped to the "this" keyword.
module.exports = class {
  constructor(req, res, fpExpress) {
    this.req = req;
    this.res = res;
    this.gatekeeper = fpExpress.gatekeeper;
    this.options = fpExpress.options;
    this.appDir = this.options.appDir;
    this.conf = this.options.conf;
    this.rootDir = this.options.rootDir;
    this.utils = this.options.utils;
  }

  add() {
    return new Promise(
      (resolve, reject) => {
        execFile('git', [this.req.body.args[0], '.'], (err, stdout, stderr) => {
          if (err || stderr) {
            this.rejectErr(reject, err, stdout, stderr);
          }
          else {
            resolve();
          }
        });
      });
  }

  commit() {
    return new Promise(
      (resolve, reject) => {
        execFile('git', this.req.body.args, (err, stdout, stderr) => {
          if (err || stderr) {
            this.rejectErr(reject, err, stdout, stderr);
          }
          else {
            resolve(stdout);
          }
        });
      });
  }

  pull() {
    return new Promise(
      (resolve, reject) => {
        execFile('git', [this.req.body.args[0]], (err, stdout, stderr) => {
          if (err || stderr) {
            this.rejectErr(reject, err, stdout, stderr);
          }
          else {
            resolve(stdout);
          }
        });
      });
  }

  push() {
    return new Promise(
      (resolve, reject) => {
        execFile('git', [this.req.body.args[0]], (err, stdout, stderr) => {
          if (err) {
            this.rejectErr(reject, err, stdout, stderr);
          }
          else if (stderr) {
            resolve(stderr);
          }
          else {
            resolve(stdout);
          }
        });
      });
  }

  rejectErr(reject, err, stdout, stderr) {
    // First, check for a JS object err to handle generic errors with an abundance of debugging info.
    // If we are looking for a specific stderr string from the shell, pass err as null.
    if (err) {
      reject(err);
    }
    else if (stderr) {
      reject(stderr);
    }
    else {
      reject(stdout);
    }
  }

  remote() {
    return new Promise(
      (resolve, reject) => {
        execFile('git', [this.req.body.args[0]], (err, stdout, stderr) => {
          if (stderr.startsWith('fatal:')) {
            // Since we are looking for this specific stderr string from the shell, pass err as null.
            this.rejectErr(reject, null, stdout, stderr);
          }
          else if (err || stderr) {
            this.rejectErr(reject, err, stdout, stderr);
          }
          else {
            resolve(stdout);
          }
        });
      });
  }

  version() {
    return new Promise(
      (resolve, reject) => {
        execFile('git', [this.req.body.args[0]], (err, stdout, stderr) => {
          if (!stdout.startsWith('git version')) {
            // We want to return a 501 Not Implemented status if Git is not installed.
            // Pass err as null so stderr gets picked up as a string.
            this.rejectErr(reject, null, stdout, stderr);
          }
          else {
            resolve(stdout);
          }
        });
      });
  }

  main() {
    if (!this.gatekeeper.gatekeep(this.req)) {
      this.gatekeeper.render('the Git Integrator')(this.req, this.res);

      return;
    }

    let args0 = this.req.body.args[0];
    let childProcessExec;

    if (this.req.body.args[0].startsWith('--')) {
      args0 = this.req.body.args[0].slice(2);
    }

    childProcessExec = this[args0].bind(this);

    process.chdir(this.rootDir);
    childProcessExec()
      .then((output) => {
        process.chdir(this.appDir);
        this.res.send(output);
      })
      .catch((err) => {
        process.chdir(this.appDir);

        if (typeof err === 'string') {
          // Status 501: Not implemented.
          this.res.writeHead(501).end(err);
        }
        else {
          this.res.writeHead(500).end(JSON.stringify(err, Object.getOwnPropertyNames(err)));
        }
      });
  }
};
