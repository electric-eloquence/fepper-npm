'use strict';

const gulp = require('gulp');
const runSequence = require('run-sequence');
const utils = require('fepper-utils');

const ui = global.fepper.ui;

gulp.task('ui:build', function (cb) {
  ui.build();
  // Finish up.
  runSequence(
    'ui:copy',
    'ui:copy-styles',
    cb
  );
});

gulp.task('ui:clean', function (cb) {
  ui.clean();
  cb();
});

gulp.task('ui:compile', function (cb) {
  ui.compile()
    .catch((err) => {
      utils.error(err);
    })
    .then(() => {
      // Finish up.
      runSequence(
        'ui:copy',
        'ui:copy-styles',
        cb
      );
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

gulp.task('ui:v', function (cb) {
  ui.build('v');
  cb();
});
