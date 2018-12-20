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

function downloadFileFromRepo(file, repoDir) {
  const writeStream = fs.createWriteStream(`${rootDir}/${file}`);

  https.get(`${repoDir}/${file}`, (res) => {
    res.pipe(writeStream);
  }).on('error', (err) => {
    utils.error(err);
  });
}

function parseNpmOutdated(npmPackage, addlArgsArr = []) {
  const spawnObj = spawnSync(binNpm, ['outdated', npmPackage].concat(addlArgsArr));
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

function slashPerOS(directoryPath) {
  if (isWindows) {
    return directoryPath.replace(/\//g, '\\');
  }
  else {
    return directoryPath;
  }
}

function fpUpdate(cb) {
  // Update global npm.
  utils.log('Running `npm --global update` on fepper-cli...');

  const fepperCliVersions = parseNpmOutdated('fepper-cli', ['--global']);

  if (fepperCliVersions && fepperCliVersions.current !== fepperCliVersions.latest) {
    const spawnObj = spawnSync(binNpm, ['uninstall', '--global', 'fepper-cli'], {stdio: 'inherit'});

    if (isWindows || spawnObj.status === 0) {
      spawnSync(binNpm, ['install', '--global', 'fepper-cli'], {stdio: 'inherit'});
    }
    else {
      utils.log('Running this command again as root/Administrator...');
      spawnSync('sudo', [binNpm, 'uninstall', '--global', 'fepper-cli']);
      spawnSync('sudo', [binNpm, 'install', '--global', 'fepper-cli'], {stdio: 'inherit'});
    }
  }

  // Update core npms.
  process.chdir(rootDir);
  utils.log(`Running \`npm update\` in ${slashPerOS(rootDir)}...`);

  // Find the latest fepper-npm release and update if updatable.
  const fepperVersions = parseNpmOutdated('fepper');

  if (fepperVersions && fepperVersions.current !== fepperVersions.latest) {
    spawnSync(binNpm, ['uninstall', '--save-dev', 'fepper']);
    spawnSync(binNpm, ['install', '--save-dev', 'fepper'], {stdio: 'inherit'});
  }

  // Find the latest fepper-utils release and update if updatable.
  const fepperUtilsVersions = parseNpmOutdated('fepper-utils');

  if (fepperUtilsVersions && fepperUtilsVersions.current !== fepperUtilsVersions.latest) {
    spawnSync(binNpm, ['uninstall', '--save-dev', 'fepper-utils']);
    spawnSync(binNpm, ['install', '--save-dev', 'fepper-utils'], {stdio: 'inherit'});
  }

  spawnSync(binNpm, ['update'], {stdio: 'inherit'});

  const rootPackageJson = fs.readJsonSync('./package.json');

  if (rootPackageJson.repository && rootPackageJson.repository.url) {
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
  if (fs.existsSync(extendDir)) {
    process.chdir(extendDir);
    utils.log(`Running \`npm update\` in ${slashPerOS(extendDir)}...`);

    // If the fp-stylus extension is installed, find the latest release and update if updatable.
    const extendPackageJson = fs.readJsonSync('./package.json');

    if (
      extendPackageJson.devDependencies &&
      Object.keys(extendPackageJson.devDependencies).indexOf('fp-stylus') > -1
    ) {
      const fpStylusVersions = parseNpmOutdated('fp-stylus');

      if (fpStylusVersions && fpStylusVersions.current !== fpStylusVersions.latest) {
        spawnSync(binNpm, ['uninstall', '--save-dev', 'fp-stylus']);
        spawnSync(binNpm, ['install', '--save-dev', 'fp-stylus'], {stdio: 'inherit'});
      }
    }

    spawnSync(binNpm, ['update'], {stdio: 'inherit'});
  }

  // Update public dir npms.
  process.chdir(publicDir);
  utils.log(`Running \`npm update\` in ${slashPerOS(publicDir)}...`);

  // Find the latest feplet release and update if updatable.
  const fepletVersions = parseNpmOutdated('feplet');

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
