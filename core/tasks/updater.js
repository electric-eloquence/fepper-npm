'use strict';

const https = require('https');
const path = require('path');
const spawnSync = require('child_process').spawnSync;

const fs = require('fs-extra');

module.exports = class {
  constructor(options) {
    this.options = options;
    this.appDir = options.appDir;
    this.conf = options.conf;
    this.utils = options.utils;
    this.extendDir = this.conf.extend_dir;
    this.publicDir = this.conf.ui.paths.public.root;
    this.rootDir = options.rootDir;
    this.tmpDir = `${this.rootDir}/.tmp`;

    // Spawn npm.cmd if Windows.
    if (this.conf.is_windows) {
      this.binNpm = 'npm.cmd';
      this.conf.is_windows = true;
    }
    else {
      this.binNpm = 'npm';
      this.conf.is_windows = false;
    }
  }

  main() {
    const downloadFileFromRepo = (file, repoDir) => {
      const fileDest = `${this.rootDir}/${file}`;
      const fileTmp = `${this.tmpDir}/${file}`;
      const writeStream = fs.createWriteStream(fileTmp);
      let stat;

      if (!this.conf.is_windows) {
        try {
          stat = fs.statSync(fileDest);
        }
        catch {}
      }

      https.get(`${repoDir}/${file}`, (res) => {
        res.pipe(writeStream)
          .on('close', () => {
            fs.readFile(fileTmp, () => {
              fs.moveSync(fileTmp, fileDest, {overwrite: true});

              if (stat && stat.mode) {
                fs.chmodSync(fileDest, stat.mode);
              }
            });
          });
      })
      .on('error', (err) => {
        this.utils.error(err);
      });
    };

    const parseNpmOutdated = (npmPackage, addlArgsArr = []) => {
      const spawnObj = spawnSync(this.binNpm, ['outdated', npmPackage].concat(addlArgsArr));
      const stdoutStr = spawnObj.stdout.toString(this.conf.enc).trim();
      const stdoutRows = stdoutStr.split('\n');

      if (stdoutRows.length > 1) {
        this.utils.log(stdoutStr);

        const stdoutCols = stdoutRows[1].split(/ +/);

        if (stdoutCols[1] && stdoutCols[3]) {
          return {
            current: stdoutCols[1],
            latest: stdoutCols[3]
          };
        }
      }

      return null;
    };

    // Prep.
    if (!fs.existsSync(this.tmpDir)) {
      fs.mkdirSync(this.tmpDir);
    }

    if (!fs.existsSync(`${this.tmpDir}/run`)) {
      fs.mkdirSync(`${this.tmpDir}/run`);
    }

    // Update global npm.
    this.utils.log('Running `npm --global update` on fepper-cli...');

    const fepperCliVersions = parseNpmOutdated('fepper-cli', ['--global']);

    if (fepperCliVersions && fepperCliVersions.current !== fepperCliVersions.latest) {
      const spawnObj = spawnSync(this.binNpm, ['uninstall', '--global', 'fepper-cli'], {stdio: 'inherit'});

      if (this.conf.is_windows || spawnObj.status === 0) {
        spawnSync(this.binNpm, ['install', '--global', 'fepper-cli'], {stdio: 'inherit'});
      }
      else {
        this.utils.log('Running this command again as root/Administrator...');
        spawnSync('sudo', [this.binNpm, 'uninstall', '--global', 'fepper-cli']);
        spawnSync('sudo', [this.binNpm, 'install', '--global', 'fepper-cli'], {stdio: 'inherit'});
      }
    }

    // Update core npms.
    process.chdir(this.rootDir);
    this.utils.log(`Running \`npm update\` in ${path.resolve(this.rootDir)}...`);

    // Find the latest fepper-npm release and update if updatable.
    const fepperVersions = parseNpmOutdated('fepper');

    if (fepperVersions && fepperVersions.current !== fepperVersions.latest) {
      spawnSync(this.binNpm, ['uninstall', '--save-dev', 'fepper']);
      spawnSync(this.binNpm, ['install', '--save-dev', 'fepper'], {stdio: 'inherit'});
    }

    // Find the latest fepper-utils release and update if updatable.
    const fepperUtilsVersions = parseNpmOutdated('fepper-utils');

    if (fepperUtilsVersions && fepperUtilsVersions.current !== fepperUtilsVersions.latest) {
      spawnSync(this.binNpm, ['uninstall', '--save-dev', 'fepper-utils']);
      spawnSync(this.binNpm, ['install', '--save-dev', 'fepper-utils'], {stdio: 'inherit'});
    }

    spawnSync(this.binNpm, ['update'], {stdio: 'inherit'});

    const rootPackageJson = fs.readJsonSync('./package.json', {throws: false});

    if (rootPackageJson && rootPackageJson.repository && rootPackageJson.repository.url) {
      let repoDir = rootPackageJson.repository.url.replace('git+', '');
      repoDir = repoDir.replace('.git', '/release');
      repoDir = repoDir.replace('github', 'raw.githubusercontent');

      // Update distro files.
      downloadFileFromRepo('CHANGELOG.md', repoDir);
      downloadFileFromRepo('LICENSE', repoDir);
      downloadFileFromRepo('README.md', repoDir);
      downloadFileFromRepo('fepper.command', repoDir);
      downloadFileFromRepo('fepper.ps1', repoDir);
      downloadFileFromRepo('fepper.vbs', repoDir);

      const runDir = 'run';

      if (!fs.existsSync(runDir)) {
        fs.ensureDirSync(runDir);
      }

      downloadFileFromRepo(`${runDir}/install-base.js`, repoDir);
      downloadFileFromRepo(`${runDir}/install.js`, repoDir);
    }

    // Update extension npms.
    if (fs.existsSync(this.extendDir)) {
      process.chdir(this.extendDir);
      this.utils.log(`Running \`npm update\` in ${path.resolve(this.extendDir)}...`);

      // If the fp-stylus extension is installed, find the latest release and update if updatable.
      const extendPackageJson = fs.readJsonSync('./package.json', {throws: false});

      if (
        extendPackageJson && extendPackageJson.devDependencies &&
        Object.keys(extendPackageJson.devDependencies).indexOf('fp-stylus') > -1
      ) {
        const fpStylusVersions = parseNpmOutdated('fp-stylus');

        if (fpStylusVersions && fpStylusVersions.current !== fpStylusVersions.latest) {
          spawnSync(this.binNpm, ['uninstall', '--save-dev', 'fp-stylus']);
          spawnSync(this.binNpm, ['install', '--save-dev', 'fp-stylus'], {stdio: 'inherit'});
        }
      }

      spawnSync(this.binNpm, ['update'], {stdio: 'inherit'});
    }

    // Update public dir npms.
    process.chdir(this.publicDir);
    this.utils.log(`Running \`npm update\` in ${path.resolve(this.publicDir)}...`);

    // Find the latest feplet release and update if updatable.
    const fepletVersions = parseNpmOutdated('feplet');

    if (fepletVersions && fepletVersions.current !== fepletVersions.latest) {
      spawnSync(this.binNpm, ['uninstall', '--save-dev', 'feplet']);
      spawnSync(this.binNpm, ['install', '--save-dev', 'feplet'], {stdio: 'inherit'});
    }

    // Find the latest feplet release and update if updatable.
    const fepperUiVersions = parseNpmOutdated('fepper-ui');

    if (fepperUiVersions && fepperUiVersions.current !== fepperUiVersions.latest) {
      spawnSync(this.binNpm, ['uninstall', '--save-dev', 'fepper-ui']);
      spawnSync(this.binNpm, ['install', '--save-dev', 'fepper-ui'], {stdio: 'inherit'});
    }

    spawnSync(this.binNpm, ['update', '--no-package-lock'], {stdio: 'inherit'});
    spawnSync(this.binNpm, ['install', '--ignore-scripts', '--no-package-lock'], {stdio: 'inherit'});

    // Finish up.
    process.chdir(this.appDir);
  }
};
