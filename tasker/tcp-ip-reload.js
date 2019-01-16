'use strict';

const gulp = require('gulp');

const reload = require('gulp-livereload');

const conf = global.conf;
const pubDir = global.conf.ui.paths.public;
const srcDir = global.conf.ui.paths.source;

// Not using template literals because VIM doesn't syntax highlight the slash+asterisks correctly.

gulp.task('tcp-ip-reload:listen', function () {
  reload.listen({port: conf.livereload_port});
});

gulp.task('tcp-ip-reload:annotations', function () {
  return gulp.src(pubDir.annotations + '/**/*')
    .pipe(reload());
});

gulp.task('tcp-ip-reload:index', function () {
  return gulp.src(pubDir.root + '/index.html')
    .pipe(reload());
});

gulp.task('tcp-ip-reload:styles-inject', function () {
  return gulp.src(pubDir.css + '/**/*.css')
    .pipe(reload());
});

gulp.task('tcp-ip-reload:styles-reload', function () {
  return gulp.src(pubDir.css + '/**/!(*.css)')
    .pipe(reload());
});

gulp.task('tcp-ip-reload:scripts', function () {
  return gulp.src(pubDir.js + '/**/*')
    .pipe(reload());
});

gulp.task('tcp-ip-reload:watch', function () {
  gulp.watch(srcDir.annotations + '/**/*', ['ui:build']);
  gulp.watch(srcDir.css + '/*', ['ui:copy-styles:root']);
  gulp.watch(srcDir.cssBld + '/**/*.css', ['ui:copy-styles:bld']);
  gulp.watch(srcDir.cssBld + '/**/!(*.css)', ['ui:copy-styles:other']);
  gulp.watch(srcDir.data + '/_data.json', ['data']);
  gulp.watch(srcDir.data + '/listitems.json', ['ui:build']);
  gulp.watch(srcDir.images + '/**/*', ['ui:copy-assets']);
  gulp.watch(srcDir.js + '/**/*', ['ui:copy-scripts']);
  gulp.watch(srcDir.meta + '/**/*', ['ui:compile']);
  gulp.watch(srcDir.patterns + '/**/*', ['data']);
  gulp.watch(pubDir.annotations + '/**/*', ['tcp-ip-reload:annotations']);
  gulp.watch(pubDir.css + '/**/*.css', ['tcp-ip-reload:styles-inject']);
  gulp.watch(pubDir.css + '/**/!(*.css)', ['tcp-ip-reload:styles-reload']);
  gulp.watch(pubDir.js + '/**/*', ['tcp-ip-reload:scripts']);
  gulp.watch(pubDir.root + '/index.html', ['tcp-ip-reload:index']);
});
