/**
 * Using gulp to update these dirs because we need to parse patternlab-config.json to know their destinations.
 */
'use strict';

const https = require('https');
const spawnSync = require('child_process').spawnSync;

const fs = require('fs-extra');
const gulp = require('gulp');
const runSequence = require('run-sequence');
const utils = require('fepper-utils');

const enc = global.conf.enc;
const extendDir = global.conf.extend_dir;
const publicDir = global.conf.ui.paths.public.root;
const rootDir = global.rootDir;

const isWindows = (
  global.conf.is_windows ||
  process.env.ComSpec && process.env.ComSpec.toLowerCase() === 'c:\\windows\\system32\\cmd.exe' // Deprecated condition.
);

let binNpm = 'npm';

// Spawn npm.cmd if Windows and not BASH.
if (isWindows) {
  binNpm = 'npm.cmd';
}

function downloadFileFromRepo(file) {
  const repoDir = 'https://raw.githubusercontent.com/electric-eloquence/fepper/release';
  const writeStream = fs.createWriteStream(`${rootDir}/${file}`);

  https.get(`${repoDir}/${file}`, (res) => {
    res.pipe(writeStream);
  }).on('error', (err) => {
    utils.error(err);
  });
}

function parseNpmOutdated(npmPackage) {
  const spawnObj = spawnSync(binNpm, ['outdated', npmPackage]);
  const stdoutStr = spawnObj.stdout.toString(enc).trim();
  const stdoutRows = stdoutStr.split('\n');

  if (stdoutRows.length > 1) {
    utils.log(stdoutStr);

    const stdoutCols = stdoutRows[1].split(/ +/);

    if (stdoutCols[1] && stdoutCols[3]) {
      return {
        current: stdoutCols[1],
        latest: stdoutCols[3]
      };
    }
  }

  return null;
}

function fpUpdate(cb) {
  // Update global npm.
  utils.log('Running `npm --global update` on fepper-cli...');

  const spawnObj = spawnSync(binNpm, ['update', '-g', 'fepper-cli'], {stdio: 'inherit'});

  if (!isWindows && spawnObj.status !== 0) {
    utils.log('Running this command again as root/Administrator...');
    spawnSync('sudo', [binNpm, 'update', '-g', 'fepper-cli'], {stdio: 'inherit'});
  }

  // Update core npms.
  process.chdir(rootDir);

  // Find the latest fepper-npm release and update if updatable.
  const fepperVersions = parseNpmOutdated('fepper');

  if (fepperVersions && fepperVersions.current !== fepperVersions.latest) {
    spawnSync(binNpm, ['uninstall', '--save-dev', 'fepper']);
    spawnSync(binNpm, ['install', '--save-dev', 'fepper'], {stdio: 'inherit'});
  }

  utils.log(`Running \`npm update\` in ${rootDir}...`);
  spawnSync(binNpm, ['update'], {stdio: 'inherit'});

  // Update distro files.
  downloadFileFromRepo('CHANGELOG.md');
  downloadFileFromRepo('LICENSE');
  downloadFileFromRepo('README.md');
  downloadFileFromRepo('fepper.command');
  downloadFileFromRepo('fepper.ps1');
  downloadFileFromRepo('fepper.vbs');

  const runDir = 'run';

  if (!fs.existsSync(runDir)) {
    fs.ensureDirSync(runDir);
  }

  downloadFileFromRepo(`${runDir}/install-base.js`);
  downloadFileFromRepo(`${runDir}/install.js`);

  // Update extension npms.
  if (fs.existsSync(extendDir)) {
    process.chdir(extendDir);

    // If the fp-stylus extension is installed, find the latest release and update if updatable.
    const extendPackages = fs.readFileSync('package.json', global.conf.enc);

    if (extendPackages.indexOf('fp-stylus') > -1) {
      const fpStylusVersions = parseNpmOutdated('fp-stylus');

      if (fpStylusVersions && fpStylusVersions.current !== fpStylusVersions.latest) {
        spawnSync(binNpm, ['uninstall', '--save-dev', 'fp-stylus']);
        spawnSync(binNpm, ['install', '--save-dev', 'fp-stylus'], {stdio: 'inherit'});
      }
    }

    utils.log(`Running \`npm update\` in ${extendDir}...`);
    spawnSync(binNpm, ['update'], {stdio: 'inherit'});
  }

  // Update public dir npms.
  process.chdir(publicDir);

  // Find the latest feplet release and update if updatable.
  const fepletVersions = parseNpmOutdated('fp-stylus');

  if (fepletVersions && fepletVersions.current !== fepletVersions.latest) {
    spawnSync(binNpm, ['uninstall', '--save-dev', 'feplet']);
    spawnSync(binNpm, ['install', '--save-dev', 'feplet'], {stdio: 'inherit'});
  }

  // Find the latest feplet release and update if updatable.
  const fepperUiVersions = parseNpmOutdated('fepper-ui');

  if (fepperUiVersions && fepperUiVersions.current !== fepperUiVersions.latest) {
    spawnSync(binNpm, ['uninstall', '--save-dev', 'fepper-ui']);
    spawnSync(binNpm, ['install', '--save-dev', 'fepper-ui'], {stdio: 'inherit'});
  }

  utils.log(`Running \`npm update\` in ${publicDir}...`);
  spawnSync(binNpm, ['update', '--no-package-lock'], {stdio: 'inherit'});
  spawnSync(binNpm, ['install', '--ignore-scripts', '--no-package-lock'], {stdio: 'inherit'});

  // Finish up.
  process.chdir(global.appDir);
  runSequence(
    'ui:compile',
    cb
  );
}

gulp.task('up', cb => {
  fpUpdate(cb);
});

gulp.task('update', cb => {
  fpUpdate(cb);
});
