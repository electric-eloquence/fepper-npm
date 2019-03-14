/**
 * These tasks complete the installation process.
 * They copy the source and extend directories to their destinations defined in patternlab-config.json.
 * They run npm install in the public and extend directories.
 */
'use strict';

const gulp = require('gulp');

const tasks = global.fepper.tasks;

gulp.task('install:copy', (cb) => {
  tasks.installer.copy();
  cb();
});

gulp.task('install:copy-base', (cb) => {
  tasks.installer.copyBase();
  cb();
});
