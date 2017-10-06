/**
 * Using gulp to update these dirs because we need to parse patternlab-config.json to know their destinations.
 */
'use strict';

const spawnSync = require('child_process').spawnSync;
const fs = require('fs-extra');
const gulp = require('gulp');
const runSequence = require('run-sequence');

const utils = require('../core/lib/utils');

const extendDir = utils.pathResolve(global.conf.extend_dir);
const publicDir = utils.pathResolve(global.conf.ui.paths.public.root);

function npmUpdate(resolve) {
  spawnSync('npm', ['update'], {stdio: 'inherit'});

  resolve();
}

function fpUpdate(cb) {
  // Update global npm.
  new Promise(resolve => {
    utils.log('Running `npm -global update` on fepper-cli...');
    spawnSync('npm', ['update', '-g', 'fepper-cli'], {stdio: 'inherit'});

    resolve();
  })

  // Update core npms.
  .then(() => {
    return new Promise(resolve => {
      process.chdir(global.workDir);
      utils.log(`Running \`npm update\` in ${global.workDir}...`);

      npmUpdate(resolve);
    });
  })

  // Update extension npms.
  .then(() => {
    return new Promise((resolve, reject) => {
      // Skip extend dir if it doesn't exist.
      if (!fs.existsSync(extendDir)) {
        reject('There doesn\'t appear to be an extend directory!');
      }

      process.chdir(extendDir);
      utils.log(`Running \`npm update\` in ${extendDir}...`);

      npmUpdate(resolve);
    });
  })

  // Update public dir npms.
  .then(() => {
    return new Promise((resolve, reject) => {
      // Skip public dir if it doesn't exist.
      if (!fs.existsSync(publicDir)) {
        reject('There doesn\'t appear to be a public directory!');
      }

      process.chdir(publicDir);
      utils.log(`Running \`npm update\` in ${publicDir}...`);

      npmUpdate(resolve);
    });
  })

  // Finish up.
  .then(() => {
    runSequence(
      'ui:compile',
      cb
    );
  });
}

gulp.task('up', cb => {
  fpUpdate(cb);
});

gulp.task('update', cb => {
  fpUpdate(cb);
});
