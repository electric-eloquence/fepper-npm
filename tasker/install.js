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
    // Copy source dir if it doesn't exist.
    if (!fs.existsSync(sourceDir)) {
      fs.copySync('excludes/profiles/main/source', sourceDir);
    }
    resolve();
  })
  .then(function () {
    return new Promise(function (resolve) {
      // Copy extend dir if it doesn't exist.
      if (!fs.existsSync(extendDir)) {
        fs.copySync('excludes/extend', extendDir);
        resolve();
      }
      else {
        // Skip to next .then() if extend dir has its npms installed.
        if (fs.existsSync(`${extendDir}/node_modules`)) {
          resolve();
        }
        // Run npm install in extend dir if no extend/node_modules dir.
        else {
          new Promise(function (resolve1) {
            process.chdir(extendDir);
            utils.log(`Working directory changed to ${extendDir}.`);
            resolve1();
          })
          .then(function () {
            return new Promise(function (resolve1) {
              exec('npm install', (err, stdout, stderr) => {
                if (err) {
                  throw err;
                }

                if (stderr) {
                  utils.log(stderr);
                }
                utils.log(stdout);

                resolve1();
              });
            });
          })
          .then(function () {
            process.chdir(cwd);
            resolve();
          });
        }
      }
    });
  })
  .then(function () {
    // Run npm install in public dir if no public/node_modules dir.
    return new Promise(function (resolve) {
      if (fs.existsSync(`${publicDir}/node_modules`)) {
        resolve();
      }
      else {
        new Promise(function (resolve1) {
          process.chdir(publicDir);
          utils.log(`Working directory changed to ${publicDir}.`);
          resolve1();
        })
        .then(function () {
          return new Promise(function (resolve1) {
            exec('npm install', (err, stdout, stderr) => {
              if (err) {
                throw err;
              }

              if (stderr) {
                utils.log(stderr);
              }
              utils.log(stdout);

              resolve1();
            });
          });
        })
        .then(function () {
          process.chdir(cwd);
          utils.log(`Working directory changed to ${cwd}.`);
          resolve();
        });
      }
    });
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
