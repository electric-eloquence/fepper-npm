'use strict';

const gulp = require('gulp');

const utils = require('../core/lib/utils');

const Ui = require('../core/ui/ui');
const ui = new Ui();

gulp.task('ui:build', function (cb) {
  ui.build()
    .catch(err => {
      utils.error(err);
    })
    .then(() => {
      cb();
    });
});

gulp.task('ui:compile', function (cb) {
  ui.compile()
    .catch(err => {
      utils.error(err);
    })
    .then(() => {
      cb();
    });
});

gulp.task('ui:clean', function (cb) {
  ui.clean();
  cb();
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
