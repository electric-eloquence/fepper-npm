'use strict';

const spawn = require('child_process').spawn;
const gulp = require('gulp');

const utils = require('../core/lib/utils');

const publicDir = utils.pathResolve(global.conf.ui.paths.public.root);

gulp.task('version', cb => {
  // Output fepper-cli version.
  const npmLsGlobal = spawn('npm', ['ls', '-g', 'fepper-cli', '--depth=0'], {stdio: 'inherit'});

  npmLsGlobal.on('error', err => {
    utils.error(err);
  });

  // Output fepper version.
  process.chdir(global.rootDir);

  const npmLsFepper = spawn('npm', ['ls', 'fepper', '--depth=0'], {stdio: 'inherit'});

  npmLsFepper.on('error', err => {
    utils.error(err);
  });

  // Output fepper-ui version.
  process.chdir(publicDir);

  const npmLsFepperUi = spawn('npm', ['ls', 'fepper-ui', '--depth=0'], {stdio: 'inherit'});

  npmLsFepperUi.on('error', err => {
    utils.error(err);
  });

  cb();
});
