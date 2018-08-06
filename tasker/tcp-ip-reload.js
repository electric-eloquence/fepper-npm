'use strict';

const gulp = require('gulp');

const refresh = require('../core/lib/gulp-refresh');

const conf = global.conf;
const pubDir = global.conf.ui.paths.public;
const srcDir = global.conf.ui.paths.source;

// Not using template literals because VIM doesn't syntax highlight the slash+asterisks correctly.

gulp.task('tcp-ip-reload:listen', function () {
  refresh.listen({port: conf.livereload_port});
});

gulp.task('tcp-ip-reload:annotations', function () {
  return gulp.src('pubDir.annotations' + '/**')
    .pipe(refresh());
});

gulp.task('tcp-ip-reload:assets', function () {
  return gulp.src(pubDir.images + '/**')
    .pipe(refresh());
});

gulp.task('tcp-ip-reload:index', function () {
  return gulp.src(pubDir.root + '/index.html')
    .pipe(refresh());
});

gulp.task('tcp-ip-reload:injectStyles', function () {
  return gulp.src(pubDir.css + '/**/*.css')
    .pipe(refresh());
});

// Watch in the srcDir so we don't pick up css changes from ui:copy-styles.
// Assuming the copy completes before the browser refreshes.
gulp.task('tcp-ip-reload:otherStyles', function () {
  return gulp.src(srcDir.css + '/**/!(*.css)')
    .pipe(refresh());
});

gulp.task('tcp-ip-reload:scripts', function () {
  return gulp.src(pubDir.js + '/**')
    .pipe(refresh());
});

gulp.task('tcp-ip-reload:watch', function () {
  // An option to delay launch in case other asynchronous tasks need to complete.
  setTimeout(function () {
    // We cannot use absolute paths in the first param for gulp.watch. Therefore we must specify cwd in the 2nd.
    gulp.watch(srcDir.annotations + '/**', {cwd: global.rootDir}, ['ui:build']);
    gulp.watch(srcDir.cssBld + '/**', {cwd: global.rootDir}, ['ui:copy-styles']);
    gulp.watch(srcDir.cssBld + '/**/!(*.css)', {cwd: global.rootDir}, ['tcp-ip-reload:otherStyles']);
    gulp.watch(srcDir.data + '/_data.json', {cwd: global.rootDir}, ['data']);
    gulp.watch(srcDir.data + '/listitems.json', {cwd: global.rootDir}, ['ui:build']);
    gulp.watch(srcDir.images + '/**', {cwd: global.rootDir}, ['ui:copy']);
    gulp.watch(srcDir.js + '/**', {cwd: global.rootDir}, ['ui:copy']);
    gulp.watch(srcDir.meta + '/**', {cwd: global.rootDir}, ['ui:compile']);
    gulp.watch(srcDir.patterns + '/**', {cwd: global.rootDir}, ['data']);
    gulp.watch(pubDir.annotations + '/**', {cwd: global.rootDir}, ['tcp-ip-reload:annotations']);
    gulp.watch(pubDir.css + '/**/*.css', {cwd: global.rootDir}, ['tcp-ip-reload:injectStyles']);
    gulp.watch(pubDir.images + '/**', {cwd: global.rootDir}, ['tcp-ip-reload:assets']);
    gulp.watch(pubDir.js + '/**', {cwd: global.rootDir}, ['tcp-ip-reload:scripts']);
    gulp.watch(pubDir.root + '/index.html', {cwd: global.rootDir}, ['tcp-ip-reload:index']);
  }, conf.timeout_main);
});
