'use strict';

const spawn = require('child_process').spawn;

module.exports = class {
  constructor(options) {
    this.options = options;
    this.conf = options.conf;
    this.utils = options.utils;
    this.publicDir = this.conf.ui.paths.public.root;
    this.rootDir = options.rootDir;

    // Spawn npm.cmd if Windows.
    if (
      this.conf.is_windows ||
      // eslint-disable-next-line max-len
      process.env.ComSpec && process.env.ComSpec.toLowerCase() === 'c:\\windows\\system32\\cmd.exe' // Deprecated condition.
    ) {
      this.binNpm = 'npm.cmd';
    }
    else {
      this.binNpm = 'npm';
    }
  }

  main() {
    // Output fepper-cli version.
    const npmLsGlobal = spawn(this.binNpm, ['ls', '-g', 'fepper-cli', '--depth=0'], {stdio: 'inherit'});

    npmLsGlobal.on('error', err => {
      this.utils.error(err);
    });

    // Output fepper version.
    process.chdir(this.rootDir);

    const npmLsFepper = spawn(this.binNpm, ['ls', 'fepper', '--depth=0'], {stdio: 'inherit'});

    npmLsFepper.on('error', err => {
      this.utils.error(err);
    });

    // Output fepper-ui version.
    process.chdir(this.publicDir);

    const npmLsFepperUi = spawn(this.binNpm, ['ls', 'fepper-ui', '--depth=0'], {stdio: 'inherit'});

    npmLsFepperUi.on('error', err => {
      this.utils.error(err);
    });
  }
};
