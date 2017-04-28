'use strict';

const exec = require('child_process').exec;
const gulp = require('gulp');

const utils = require('../core/lib/utils');

const publicDir = utils.pathResolve(global.conf.ui.paths.public.root);

gulp.task('version', cb => {
  exec('npm ls -g fepper-cli --depth=0', (err, stdout, stderr) => {
    if (err) {
      utils.error(err);
    }
    else {
      if (stderr) {
        utils.log(stderr);
      }
      utils.log(stdout);
    }
  });

  new Promise(resolve => {
    process.chdir(global.rootDir);
    resolve();
  })
  .then(() => {
    return new Promise(resolve => {
      exec('npm ls fepper --depth=0', (err, stdout, stderr) => {
        if (err) {
          utils.error(err);
        }
        else {
          if (stderr) {
            utils.log(stderr);
          }
          utils.log(stdout);
        }
      });
      resolve();
    });
  })
  .then(() => {
    new Promise(resolve => {
      process.chdir(publicDir);
      resolve();
    });
  })
  .then(() => {
    new Promise(resolve => {
      exec('npm ls fepper-ui --depth=0', (err, stdout, stderr) => {
        if (err) {
          utils.error(err);
        }
        else {
          if (stderr) {
            utils.log(stderr);
          }
          utils.log(stdout);
        }
      });
      resolve();
    });
  })
  .then(() => {
    cb();
  });
});
