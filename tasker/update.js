'use strict';

const gulp = global.gulp;
const tasks = global.fepper.tasks;

gulp.task('up', function (cb) {
  tasks.update();
  gulp.runSequence(
    'ui:compile',
    cb
  );
});

gulp.task('update', function (cb) {
  tasks.update();
  gulp.runSequence(
    'ui:compile',
    cb
  );
});
