'use strict';

const gulp = global.gulp;
const tasks = global.fepper.tasks;

gulp.task('fepper:copy-assets', function (cb) {
  tasks.frontendCopy('assets');
  cb();
});

gulp.task('fepper:copy-scripts', function (cb) {
  tasks.frontendCopy('scripts');
  cb();
});

gulp.task('fepper:copy-styles', function (cb) {
  tasks.frontendCopy('styles');
  cb();
});

gulp.task('fepper:data', function (cb) {
  tasks.appendix();
  tasks.jsonCompile();
  cb();
});

gulp.task('fepper:static-generate', function (cb) {
  tasks.staticGenerate();
  cb();
});

gulp.task('fepper:template', function (cb) {
  tasks.template();
  cb();
});
