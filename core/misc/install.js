'use strict';

const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');

const copy = require('./copy');

const excludesDir = 'node_modules/fepper-npm/excludes';

new Promise(function (resolve) {
  copy.file('conf.yml', excludesDir, resolve);
})
.then(function () {
  return new Promise(function (resolve) {
    copy.dir('extend', excludesDir, resolve);
  });
})
.then(function () {
  return new Promise(function (resolve) {
    copy.file('patternlab-config.json', excludesDir, resolve);
  });
})
.then(function () {
  return new Promise(function (resolve) {
    copy.file('pref.yml', excludesDir, resolve);
  });
})
.then(function () {
  var binGulp = path.resolve('node_modules', '.bin', 'gulp');
  exec(`${binGulp} --gulpfile node_modules/fepper-npm/tasker.js install`, (err, stdout, stderr) => {
    if (err) {
      throw err;
    }

    fs.writeFileSync('install.log', stdout);
    if (stderr) {

      /* eslint-disable no-console */
      console.log(stderr);

      /* eslint-enable no-console */
      fs.appendFileSync('install.log', stderr);
    }
  });
});
