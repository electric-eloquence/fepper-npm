'use strict';

const fs = require('fs');
if (
  !fs.existsSync(`${global.workDir}/node_modules/gulp-eslint`) ||
  !fs.existsSync(`${global.workDir}/node_modules/gulp-mocha`) ||
  !fs.existsSync(`${global.workDir}/node_modules/chai`)
) {
  return;
}

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');

gulp.task('test:eslint-extend', function () {
  return gulp.src(['excludes/extend/*.js', 'excludes/extend/*/*.js', 'excludes/extend/*/*/*.js'])
    // An ESLint bug requires that the node env be defined here and not in
    // .eslintrc.json.
    .pipe(eslint({envs: ['node']}))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test:eslint-fepper', function () {
  return gulp.src('core/**/*.js')
    // An ESLint bug requires that the node env be defined here and not in
    // .eslintrc.json.
    .pipe(eslint({envs: ['node']}))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test:eslint-tasker', function () {
  return gulp.src('tasker/**/*.js')
    // An ESLint bug requires that the node env be defined here and not in
    // .eslintrc.json.
    .pipe(eslint({envs: ['node']}))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test:eslint-root', function () {
  return gulp.src('.*.js')
    // An ESLint bug requires that the node env be defined here and not in
    // .eslintrc.json.
    .pipe(eslint({envs: ['node']}))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test:eslint-test', function () {
  return gulp.src('test/*.js')
    // An ESLint bug requires that the node env be defined here and not in
    // .eslintrc.json.
    .pipe(eslint({envs: ['node']}))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test:mocha', function () {
  return gulp.src('test/tests/*-tests.js', {read: false})
    .pipe(mocha());
});
