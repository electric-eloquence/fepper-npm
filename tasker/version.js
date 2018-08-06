'use strict';

const spawn = require('child_process').spawn;

const gulp = require('gulp');
const utils = require('fepper-utils');

const publicDir = global.conf.ui.paths.public.root;

let binNpm = 'npm';

// Spawn npm.cmd if Windows and not BASH.
if (process.env.ComSpec && process.env.ComSpec.toLowerCase() === 'c:\\windows\\system32\\cmd.exe') {
  binNpm = 'npm.cmd';
}

gulp.task('version', cb => {
  // Output fepper-cli version.
  const npmLsGlobal = spawn(binNpm, ['ls', '-g', 'fepper-cli', '--depth=0'], {stdio: 'inherit'});

  npmLsGlobal.on('error', err => {
    utils.error(err);
  });

  // Output fepper version.
  process.chdir(global.rootDir);

  const npmLsFepper = spawn(binNpm, ['ls', 'fepper', '--depth=0'], {stdio: 'inherit'});

  npmLsFepper.on('error', err => {
    utils.error(err);
  });

  // Output fepper-ui version.
  process.chdir(publicDir);

  const npmLsFepperUi = spawn(binNpm, ['ls', 'fepper-ui', '--depth=0'], {stdio: 'inherit'});

  npmLsFepperUi.on('error', err => {
    utils.error(err);
  });

  cb();
});
