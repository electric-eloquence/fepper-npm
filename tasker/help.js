'use strict';

const gulp = require('gulp');

const tasks = global.fepper.tasks;

gulp.task('help', cb => {
  tasks.helper.main();
  cb();
});
