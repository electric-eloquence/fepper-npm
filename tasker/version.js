'use strict';

const gulp = global.gulp;
const tasks = global.fepper.tasks;

gulp.task('version', function (cb) {
  tasks.version();
  cb();
});
