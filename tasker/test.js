'use strict';

const runSequence = require('run-sequence');

try {
  require('gulp-eslint');
  require('gulp-mocha');
  require('chai');
}
catch (err) {
  return;
}

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');

gulp.task('test:eslint:extend', function () {
  return gulp.src(['excludes/extend/*.js', 'excludes/extend/*/*.js', 'excludes/extend/*/*/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test:eslint:fepper', function () {
  return gulp.src('core/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test:eslint:tasker', function () {
  return gulp.src('tasker/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test:eslint:root', function () {
  return gulp.src('*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test:eslint:test', function () {
  return gulp.src('test/tests/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test:eslint:ui', function () {
  return gulp.src('ui/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test:eslint', (cb) => {
  runSequence(
    'test:eslint:extend',
    'test:eslint:fepper',
    'test:eslint:tasker',
    'test:eslint:root',
    'test:eslint:test',
    'test:eslint:ui',
    cb
  );
});

gulp.task('test:mocha:core', function () {
  return gulp.src('test/tests/*.js', {read: false})
    .pipe(mocha());
});

gulp.task('test:mocha:ui', function () {
  return gulp.src('ui/test/tests/*.js', {read: false})
    .pipe(mocha());
});

gulp.task('test:mocha', (cb) => {
  runSequence(
    'test:mocha:core',
    'test:mocha:ui',
    cb
  );
});
