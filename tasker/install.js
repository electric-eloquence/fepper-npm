/**
 * Using gulp to copy these dirs because we need to parse patternlab-config.json to know their destinations.
 */
'use strict';

const fs = require('fs-extra');
const gulp = require('gulp');

const utils = require('../core/lib/utils');

const extendDir = utils.pathResolve(global.conf.extend_dir);
const publicDir = utils.pathResolve(global.conf.ui.paths.public.root);
const sourceDir = utils.pathResolve(global.conf.ui.paths.source.root);

gulp.task('install:copy', function (cb) {
  if (!fs.existsSync(extendDir)) {
    fs.copySync('excludes/extend', extendDir)
  }
  if (!fs.existsSync(publicDir)) {
    fs.copySync('excludes/public', publicDir)
  }
  if (!fs.existsSync(sourceDir)) {
    fs.copySync('excludes/profiles/main/source', sourceDir);
  }
  cb();
});

gulp.task('install:copy-base', function (cb) {
  if (!fs.existsSync(utils.pathResolve(sourceDir))) {
    fs.copySync('excludes/profiles/base/source', sourceDir);
  }
  cb();
});
