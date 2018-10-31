'use strict';

const gulp = require('gulp');

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
  ui.compile(); // Also runs ui.build().
  cb();
});

gulp.task('ui:compileui', function (cb) {
  ui.compileui();
  cb();
});

gulp.task('ui:copy:assets', function (cb) {
  ui.copyAssets();
  cb();
});

gulp.task('ui:copy:scripts', function (cb) {
  ui.copyScripts();
  cb();
});

gulp.task('ui:copy:static', function (cb) {
  ui.copyStatic();
  cb();
});

gulp.task('ui:copy:styles', function (cb) {
  ui.copyStyles();
  cb();
});

gulp.task('ui:help', function (cb) {
  ui.build('help');
  cb();
});
