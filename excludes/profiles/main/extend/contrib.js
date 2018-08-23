/**
 * Put tasks defined in ~extend.js appended files within the more general tasks listed below.
 */
'use strict';

const gulp = require('gulp');

gulp.task('contrib:data', [
]);

gulp.task('contrib:frontend-copy', [
// Comment or delete if you wish to disable this.
  'stylus:frontend-copy'
]);

gulp.task('contrib:once', [
// Comment or delete if you wish to disable this.
  'stylus:once'
]);

gulp.task('contrib:static', [
]);

gulp.task('contrib:syncback', [
]);

gulp.task('contrib:tcp-ip', [
]);

gulp.task('contrib:template', [
]);

gulp.task('contrib:watch', [
// Comment or delete if you wish to disable this.
  'stylus:watch'
]);
