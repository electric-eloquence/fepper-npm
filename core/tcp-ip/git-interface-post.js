'use strict';

/* istanbul ignore file */

const {exec, execFile} = require('child_process');

const fetch = require('node-fetch');

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
        const {args} = this.req.body;

        if (this.req.body.rel_path) {
          args[1] = this.conf.ui.paths.source.patterns + '/' + this.req.body.rel_path;
        }
        else {
          args[1] = '.';
        }

        execFile('git', args, (err, stdout, stderr) => {
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
        execFile('git', this.req.body.args, (err, stdout, stderr) => {
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

  main() {
    if (!this.gatekeeper.gatekeep(this.req)) {
      this.gatekeeper.render('the Git Interface')(this.req, this.res);

      return;
    }

    const identityMessage = `${t('*** Please tell me who you are.')}` + ' \n' +
      `${t('Run')}` + ' \n' +
      `${t('  git config --global user.email "you@example.com"')}` + ' \n' +
      `${t('  git config --global user.name "Your Name"')}` + ' \n' +
      `${t('to set your account\'s default identity.')}`;
    let args0 = this.req.body.args && this.req.body.args[0];
    let childProcessExec;

    if (typeof args0 === 'string' && this.req.body.args[0].startsWith('--')) {
      args0 = this.req.body.args[0].slice(2);
    }

    childProcessExec = args0 ? this[args0].bind(this) : () => Promise.resolve('');

    process.chdir(this.rootDir);
    new Promise(
      (resolve, reject) => {
        const cmd = 'git remote --verbose';

        exec(cmd, (err, stdout, stderr) => {
          if (err || stderr) {
            this.rejectErr(reject, err, stdout, stderr);
          }
          else {
            if (/^\w+\shttps:/.test(stdout)) {
              resolve();
            }
            else {
              reject({
                message: `${t('Command failed:')} ${cmd}` + ' \n' +
                  `${t('The Git Interface only works over HTTPS.')}` + ' \n' +
                  `${t('Please check the protocol of this project\'s remote address.')}`
              });
            }
          }
        });
      })
      .then(() => {
        return new Promise(
          (resolve, reject) => {
            const cmd = 'git config --get user.email';

            exec(cmd, (err, stdout, stderr) => {
              if (stderr) {
                this.rejectErr(reject, err, stdout, stderr);
              }
              else if (err) {
                reject({
                  message: `${t('Command failed:')} ${cmd}` + ` \n${identityMessage}`
                });
              }
              else if (stdout.trim()) {
                resolve();
              }
              else {
                reject({
                  cmd,
                  message: `${t('Command failed:')} ${cmd}` + ` \n${identityMessage}`
                });
              }
            });
          });
      })
      .then(() => {
        return new Promise(
          (resolve, reject) => {
            const cmd = 'git config --get user.name';

            exec(cmd, (err, stdout, stderr) => {
              if (stderr) {
                this.rejectErr(reject, err, stdout, stderr);
              }
              else if (err) {
                reject({
                  message: `${t('Command failed:')} ${cmd}` + ` \n${identityMessage}`
                });
              }
              else if (stdout.trim()) {
                resolve();
              }
              else {
                reject({
                  message: `${t('Command failed:')} ${cmd}` + ` \n${identityMessage}`
                });
              }
            });
          });
      })
      .then(() => {
        return fetch('https://api.github.com/zen');
      })
      .then((response) => {
        if (response.ok) {
          return response.text();
        }
        else {
          return response.json();
        }
      })
      .then((output) => {
        if (typeof output === 'string') {
          return new Promise(
            (resolve, reject) => {
              execFile('gh', ['auth', 'status'], (err, stdout, stderr) => {
                // Only check for err. The success response is piped to stderr.
                if (err) {
                  this.rejectErr(reject, err, stdout, stderr);
                }
                else {
                  resolve();
                }
              });
            });
        }
        else {
          return Promise.reject(output);
        }
      })
      .then(() => {
        return childProcessExec();
      })
      .then((output) => {
        process.chdir(this.appDir);
        this.res.send(output);
      })
      .catch((err) => {
        process.chdir(this.appDir);

        if (typeof err === 'string') {
          // Status 501: Not implemented.
          this.res.writeHead(501).end(`{"message":"${t('Command failed:')} ${cmd} \n${err}"}`);
        }
        else {
          const cmd = (typeof err.cmd === 'string') ? err.cmd : '';

          if (err.name === 'FetchError') {
            if (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN') {
              err.message = `${t('Command failed:')} ${cmd}` + ` \n${t('The Git Interface requires Internet access.')}`;
            }
            else {
              err.message = `${t('Command failed:')} ${cmd}` + ` \n${err.name}: ${err.message}`;
            }
          }
          else if (err.cmd === 'gh auth status' && err.code === 'ENOENT') {
            err.message = `${t('Command failed:')} ${cmd}` + ` \n${t('GitHub CLI is not installed.')}`;
          }

          this.res.writeHead(500).end(JSON.stringify(err, Object.getOwnPropertyNames(err)));
        }
      });
  }
};
