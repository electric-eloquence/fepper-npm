/**
 * Using gulp to copy these dirs because we need to parse patternlab-config.json to know their destinations.
 */
'use strict';

const spawnSync = require('child_process').spawnSync;
const fs = require('fs-extra');
const gulp = require('gulp');
const slash = require('slash');

const utils = require('../core/lib/utils');

const cwd = process.cwd();
const extendDir = utils.pathResolve(global.conf.extend_dir);
const publicDir = utils.pathResolve(global.conf.ui.paths.public.root);
const sourceDir = utils.pathResolve(global.conf.ui.paths.source.root);

let binNpm = 'npm';

// Spawn npm.cmd if Windows and not BASH.
if (process.env.ComSpec === 'C:\\WINDOWS\\system32\\cmd.exe') {
  binNpm = 'npm.cmd';
}

gulp.task('install:copy', cb => {
  // Copy source dir if it doesn't exist.
  if (!fs.existsSync(sourceDir)) {
    fs.copySync('excludes/profiles/main/source', sourceDir);
  }

  // Copy extend dir if it doesn't exist.
  if (!fs.existsSync(extendDir)) {
    fs.copySync('excludes/extend', extendDir);
  }

  // Run npm install in extend dir if no extend/node_modules dir.
  if (!fs.existsSync(`${extendDir}/node_modules`)) {
    process.chdir(extendDir);
    utils.log(`Working directory changed to ${extendDir}.`);
    spawnSync(binNpm, ['install'], {stdio: 'inherit'});
  }

  // Run npm install in public dir if no public/node_modules dir.
  if (!fs.existsSync(`${publicDir}/node_modules`)) {
    process.chdir(publicDir);
    utils.log(`Working directory changed to ${publicDir}.`);
    spawnSync(binNpm, ['install'], {stdio: 'inherit'});
  }

  // Finish up.
  process.chdir(cwd);
  utils.log(`Working directory changed to ${slash(cwd)}.`);

  cb();
});

gulp.task('install:copy-base', cb => {
  if (!fs.existsSync(sourceDir)) {
    fs.copySync('excludes/profiles/base/source', sourceDir);
  }

  cb();
});
