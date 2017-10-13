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

function fpUpdate(cb) {
  // Update global npm.
  utils.log('Running `npm -global update` on fepper-cli...');
  spawnSync('npm', ['update', '-g', 'fepper-cli'], {stdio: 'inherit'});

  // Update core npms.
  process.chdir(global.workDir);
  utils.log(`Running \`npm update\` in ${global.workDir}...`);
  spawnSync('npm', ['update'], {stdio: 'inherit'});

  // Update extension npms.
  if (fs.existsSync(extendDir)) {
    process.chdir(extendDir);
    utils.log(`Running \`npm update\` in ${extendDir}...`);
    spawnSync('npm', ['update'], {stdio: 'inherit'});
  }

  // Update public dir npms.
  if (fs.existsSync(publicDir)) {
    process.chdir(publicDir);
    utils.log(`Running \`npm update\` in ${publicDir}...`);
    spawnSync('npm', ['update'], {stdio: 'inherit'});
  }

  // Finish up.
  runSequence(
    'ui:compile',
    cb
  );
}

gulp.task('up', cb => {
  fpUpdate(cb);
});

gulp.task('update', cb => {
  fpUpdate(cb);
});
