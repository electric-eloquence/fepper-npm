/**
 * Using gulp to update these dirs because we need to parse patternlab-config.json to know their destinations.
 */
'use strict';

const exec = require('child_process').exec;
const fs = require('fs-extra');
const gulp = require('gulp');

const utils = require('../core/lib/utils');

const extendDir = utils.pathResolve(global.conf.extend_dir);
const publicDir = utils.pathResolve(global.conf.ui.paths.public.root);

function npmUpdate(resolve) {
  exec('npm update', (err, stdout, stderr) => {
    if (err) {
      throw err;
    }
    if (stderr) {
      utils.log(stderr);
    }
    utils.log(stdout);
    resolve();
  });
}

gulp.task('update', cb => {
  new Promise(resolve => {
    process.chdir(global.workDir);
    utils.log(`Running \`npm update\` in ${global.workDir}...`);
    npmUpdate(resolve);
  })
  .then(() => {
    return new Promise(resolve => {
      // Skip extend dir if it doesn't exist.
      if (!fs.existsSync(extendDir)) {
        resolve();
      }

      process.chdir(extendDir);
      utils.log(`Running \`npm update\` in ${extendDir}...`);
      npmUpdate(resolve);
    });
  })
  .then(() => {
    return new Promise(resolve => {
      // Skip public dir if it doesn't exist.
      if (!fs.existsSync(publicDir)) {
        resolve();
      }

      process.chdir(publicDir);
      utils.log(`Running \`npm update\` in ${publicDir}...`);
      npmUpdate(resolve);
    });
  })
  .then(() => {
    cb();
  });
});
