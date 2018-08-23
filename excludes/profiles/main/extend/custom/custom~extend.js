/**
 * This is an example custom task which copies Stylus files to the public directory.
 * There probably isn't any use-case for exposing CSS preprocesses to end-users, so you are encouraged to delete or
 * overwrite this demonstration.
 */
'use strict';

const gulp = require('gulp');
// Commonly used modules.
// const runSequence = require('run-sequence'); // https://www.npmjs.com/package/run-sequence
// const utils = require('fepper-utils');       // https://www.npmjs.com/package/fepper-utils

const conf = global.conf;    // Read from conf.yml
// const pref = global.pref; // Read from pref.yml

gulp.task('expose-stylus', function () {
  // conf.ui values are read from patternlab-config.json. Relative paths are converted to absolute paths.
  // Use conf.ui.pathsRelative if you need relative paths.
  return gulp.src(conf.ui.paths.source.cssSrc + '/stylus/**/*')
    .pipe(gulp.dest(conf.ui.paths.public.css));
});
