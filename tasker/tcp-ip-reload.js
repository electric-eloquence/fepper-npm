'use strict';

const gulp = require('gulp');

const refresh = require('../core/lib/gulp-refresh');

const conf = global.conf;
const pubDir = global.conf.ui.paths.public;
const srcDir = global.conf.ui.paths.source;
const pubDirRel = global.conf.ui.pathsRelative.public;
const srcDirRel = global.conf.ui.pathsRelative.source;

// Not using template literals because VIM doesn't syntax highlight the slash+asterisks correctly.

gulp.task('tcp-ip-reload:listen', function () {
  refresh.listen({port: conf.livereload_port});
});

gulp.task('tcp-ip-reload:annotations', function () {
  return gulp.src(pubDir.annotations + '/**/*')
    .pipe(refresh());
});

gulp.task('tcp-ip-reload:assets', function () {
  return gulp.src(pubDir.images + '/**/*')
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

// Watch in the srcDir so we don't pick up css changes from ui:copy:styles.
// Assuming the copy completes before the browser refreshes.
gulp.task('tcp-ip-reload:otherStyles', function () {
  return gulp.src(srcDir.css + '/**/!(*.css)')
    .pipe(refresh());
});

gulp.task('tcp-ip-reload:scripts', function () {
  return gulp.src(pubDir.js + '/**/*')
    .pipe(refresh());
});

gulp.task('tcp-ip-reload:watch', function () {
  // We cannot use absolute paths in the first param for gulp.watch(). Therefore we must specify cwd in the 2nd.
  // Must use '/**/*' and not '/**' because '/**' watches '..'
  gulp.watch(srcDirRel.annotations + '/**/*', {cwd: global.rootDir}, ['ui:build']);
  gulp.watch(srcDirRel.css + '/*', {cwd: global.rootDir}, ['ui:copy:styles']);
  gulp.watch(srcDirRel.css + '/!(*.css)', {cwd: global.rootDir}, ['tcp-ip-reload:otherStyles']);
  gulp.watch(srcDirRel.cssBld + '/**/*', {cwd: global.rootDir}, ['ui:copy:styles']);
  gulp.watch(srcDirRel.cssBld + '/**/!(*.css)', {cwd: global.rootDir}, ['tcp-ip-reload:otherStyles']);
  gulp.watch(srcDirRel.data + '/_data.json', {cwd: global.rootDir}, ['data']);
  gulp.watch(srcDirRel.data + '/listitems.json', {cwd: global.rootDir}, ['ui:build']);
  gulp.watch(srcDirRel.images + '/**/*', {cwd: global.rootDir}, ['ui:copy:assets']);
  gulp.watch(srcDirRel.js + '/**/*', {cwd: global.rootDir}, ['ui:copy:scripts']);
  gulp.watch(srcDirRel.meta + '/**/*', {cwd: global.rootDir}, ['ui:compile']);
  gulp.watch(srcDirRel.patterns + '/**/*', {cwd: global.rootDir}, ['data']);
  gulp.watch(pubDirRel.annotations + '/**/*', {cwd: global.rootDir}, ['tcp-ip-reload:annotations']);
  gulp.watch(pubDirRel.css + '/**/*.css', {cwd: global.rootDir}, ['tcp-ip-reload:injectStyles']);
  gulp.watch(pubDirRel.images + '/**/*', {cwd: global.rootDir}, ['tcp-ip-reload:assets']);
  gulp.watch(pubDirRel.js + '/**/*', {cwd: global.rootDir}, ['tcp-ip-reload:scripts']);
  gulp.watch(pubDirRel.root + '/index.html', {cwd: global.rootDir}, ['tcp-ip-reload:index']);
});
