/**
 * Using gulp to copy these dirs because we need to parse patternlab-config.json to know their destinations.
 */
'use strict';

const exec = require('child_process').exec;
const fs = require('fs-extra');
const gulp = require('gulp');

const utils = require('../core/lib/utils');

const cwd = process.cwd();
const extendDir = utils.pathResolve(global.conf.extend_dir);
const publicDir = utils.pathResolve(global.conf.ui.paths.public.root);
const sourceDir = utils.pathResolve(global.conf.ui.paths.source.root);

gulp.task('install:copy', function (cb) {
  new Promise(function (resolve) {
    if (!fs.existsSync(extendDir)) {
      fs.copySync('excludes/extend', extendDir);
    }
    if (!fs.existsSync(sourceDir)) {
      fs.copySync('excludes/profiles/main/source', sourceDir);
    }
    resolve();
  })
  .then(function () {
    if (!fs.existsSync(`${publicDir}/bower_components`)) {
      new Promise(function (resolve) {
        process.chdir(publicDir);
        utils.log(`Working directory changed to ${publicDir}`);
        resolve();
      })
      .then(function () {
        return new Promise(function (resolve) {
          exec('bower install', (err, stdout, stderr) => {
            if (err) {
              throw err;
            }

            if (stderr) {
              utils.log(stderr);
            }
            utils.log(stdout);

            resolve();
          });
        });
      })
      .then(function () {
        process.chdir(cwd);
        utils.log(`Working directory changed to ${cwd}`);
      });
    }
  })
  .then(function () {
    cb();
  });
});

gulp.task('install:copy-base', function (cb) {
  if (!fs.existsSync(utils.pathResolve(sourceDir))) {
    fs.copySync('excludes/profiles/base/source', sourceDir);
  }
  cb();
});
