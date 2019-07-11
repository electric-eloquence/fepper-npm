'use strict';

const gulp = global.gulp;
const tasks = global.fepper.tasks;

gulp.task('help', function (cb) {
  tasks.helper.main();
  cb();
});

gulp.task('extend:help', function (cb) {
  const tasksArr = Object.keys(gulp.tasks)
    .filter((taskName) => taskName.slice(-5) === ':help')
    .filter((taskName) => taskName !== 'extend:help')
    .filter((taskName) => taskName !== 'ui:help')
    .concat([cb]);

  if (tasksArr.length > 2) {
    gulp.runSeq(...(
      tasksArr
        .filter((taskName) => taskName !== 'example:help')
    ));
  }
  else {
    gulp.runSeq(...tasksArr);
  }
});
