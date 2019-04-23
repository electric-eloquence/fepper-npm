'use strict';

const gulp = global.gulp;
const tasks = global.fepper.tasks;

gulp.task('help', function (cb) {
  tasks.helper.main();
  cb();
});
