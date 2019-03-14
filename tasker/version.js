'use strict';

const gulp = require('gulp');

const tasks = global.fepper.tasks;

gulp.task('version', cb => {
  tasks.version();
  cb();
});
