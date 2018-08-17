'use strict';

const gulp = require('gulp');
const utils = require('fepper-utils');

const ui = global.fepper.ui;

gulp.task('ui:build', function (cb) {
  ui.build();
  cb();
});

gulp.task('ui:clean', function (cb) {
  ui.clean();
  cb();
});

gulp.task('ui:compile', function (cb) {
  ui.compile() // Also runs ui.build().
    .catch((err) => {
      utils.error(err);
    })
    .then(() => {
      cb();
    });
});

gulp.task('ui:compileui', function (cb) {
  ui.compileui()
    .catch((err) => {
      utils.error(err);
    })
    .then(() => {
      cb();
    });
});

gulp.task('ui:copy', function (cb) {
  ui.copy();
  cb();
});

gulp.task('ui:copy-styles', function (cb) {
  ui.copyStyles();
  cb();
});

gulp.task('ui:help', function (cb) {
  ui.build('help');
  cb();
});

gulp.task('ui:patternsonly', function (cb) {
  ui.build('patternsonly');
  cb();
});
