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

const extendDir = global.conf.extend_dir;
const publicDir = global.conf.ui.paths.public.root;
const rootDir = global.rootDir;

let binNpm = 'npm';
let binNpx = 'npx';

// Spawn npm.cmd if Windows and not BASH.
if (process.env.ComSpec && process.env.ComSpec.toLowerCase() === 'c:\\windows\\system32\\cmd.exe') {
  binNpm = 'npm.cmd';
  binNpx = 'npx.cmd';
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

function fpUpdate(cb) {
  // Update global npm.
  utils.log('Running `npm --global update` on fepper-cli...');
  spawnSync(binNpm, ['update', '-g', 'fepper-cli'], {stdio: 'inherit'});

  // Update core npms.
  process.chdir(rootDir);

  // Find the latest fepper-npm release and update package.json.
  spawnSync(binNpx, ['npm-check-updates', '--upgrade', 'fepper'], {stdio: 'inherit'});

  utils.log(`Running \`npm update\` in ${rootDir}...`);
  spawnSync(binNpm, ['update'], {stdio: 'inherit'});
  spawnSync(binNpm, ['install', '--ignore-scripts'], {stdio: 'inherit'});

  // Update distro files.
  downloadFileFromRepo('LICENSE');
  downloadFileFromRepo('README.md');
  downloadFileFromRepo('fepper.command');

  const runDir = 'run';

  if (!fs.existsSync(runDir)) {
    fs.ensureDirSync(runDir);
  }

  downloadFileFromRepo(`${runDir}/install-base.js`);
  downloadFileFromRepo(`${runDir}/install-windows.js`);
  downloadFileFromRepo(`${runDir}/install.js`);

  // Update extension npms.
  if (fs.existsSync(extendDir)) {
    process.chdir(extendDir);

    // If the fp-stylus extension is installed, find the latest release and update package.json.
    const extendPackages = fs.readFileSync('package.json', global.conf.enc);

    if (extendPackages.indexOf('fp-stylus') > -1) {
      spawnSync(binNpx, ['npm-check-updates', '--upgrade', 'fp-stylus'], {stdio: 'inherit'});
    }

    utils.log(`Running \`npm update\` in ${extendDir}...`);
    spawnSync(binNpm, ['update'], {stdio: 'inherit'});
    spawnSync(binNpm, ['install', '--ignore-scripts'], {stdio: 'inherit'});
  }

  // Update public dir npms.
  if (fs.existsSync(publicDir)) {
    process.chdir(publicDir);

    // Find the latest feplet and fepper-ui releases and update public/package.json.
    spawnSync(binNpx, ['npm-check-updates', '--upgrade', 'feplet'], {stdio: 'inherit'});
    spawnSync(binNpx, ['npm-check-updates', '--upgrade', 'fepper-ui'], {stdio: 'inherit'});

    utils.log(`Running \`npm update\` in ${publicDir}...`);
    spawnSync(binNpm, ['update'], {stdio: 'inherit'});
    spawnSync(binNpm, ['install', '--ignore-scripts'], {stdio: 'inherit'});
  }

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
