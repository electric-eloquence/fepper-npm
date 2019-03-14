'use strict';

const gulp = require('gulp');

const tasks = global.fepper.tasks;

gulp.task('up', cb => {
  tasks.update();
  gulp.runSequence(
    'ui:compile',
    cb
  );
});

gulp.task('update', cb => {
  tasks.update();
  gulp.runSequence(
    'ui:compile',
    cb
  );
});
