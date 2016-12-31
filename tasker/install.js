/**
 * Using gulp to copy these dirs because we need to parse patternlab-config.json to know their destinations.
 */
'use strict';

const fs = require('fs-extra');
const gulp = require('gulp');

const utils = require('../core/lib/utils');

const extendDir = global.conf.extend_dir;
const publicDir = global.conf.ui.paths.public.root;
const sourceDir = global.conf.ui.paths.source.root;

gulp.task('install:copy', function (cb) {
  if (!fs.existsSync(utils.pathResolve(extendDir))) {
    return gulp.src('./excludes/extend/**')
      .pipe(gulp.dest(utils.pathResolve(extendDir)));
  }
  if (!fs.existsSync(utils.pathResolve(publicDir))) {
    return gulp.src('./excludes/public/**')
      .pipe(gulp.dest(utils.pathResolve(publicDir)));
  }
  if (!fs.existsSync(utils.pathResolve(sourceDir))) {
    return gulp.src('./excludes/profiles/main/source/**')
      .pipe(gulp.dest(utils.pathResolve(sourceDir)));
  }
  cb();
});

gulp.task('install:copy-base', function (cb) {
  if (!fs.existsSync(utils.pathResolve(sourceDir))) {
    return gulp.src('./excludes/profiles/base/source/**')
      .pipe(gulp.dest(utils.pathResolve(sourceDir)));
  }
  cb();
});
