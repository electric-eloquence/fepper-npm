'use strict';

const gulp = require('gulp');

const tasks = global.fepper.tasks;

gulp.task('version', function (cb) {
  tasks.version();
  cb();
});
