/**
 * Using gulp to copy these dirs because we need to parse patternlab-config.json to know their destinations.
 */
'use strict';

const spawnSync = require('child_process').spawnSync;
const fs = require('fs-extra');
const gulp = require('gulp');

const utils = require('../core/lib/utils');

const cwd = process.cwd();
const extendDir = utils.pathResolve(global.conf.extend_dir);
const publicDir = utils.pathResolve(global.conf.ui.paths.public.root);
const sourceDir = utils.pathResolve(global.conf.ui.paths.source.root);

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
    spawnSync('npm', ['install'], {stdio: 'inherit'});
  }

  // Run npm install in public dir if no public/node_modules dir.
  if (!fs.existsSync(`${publicDir}/node_modules`)) {
    process.chdir(cwd);
    process.chdir(publicDir);
    utils.log(`Working directory changed to ${publicDir}.`);
    spawnSync('npm', ['install'], {stdio: 'inherit'});
  }

  // Finish up.
  process.chdir(cwd);
  utils.log(`Working directory changed to ${cwd}.`);

  cb();
});

gulp.task('install:copy-base', cb => {
  if (!fs.existsSync(sourceDir)) {
    fs.copySync('excludes/profiles/base/source', sourceDir);
  }

  cb();
});
