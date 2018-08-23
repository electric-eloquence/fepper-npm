/**
 * Using gulp to copy these dirs because we need to parse patternlab-config.json to know their destinations.
 */
'use strict';

const spawnSync = require('child_process').spawnSync;

const fs = require('fs-extra');
const gulp = require('gulp');
const utils = require('fepper-utils');

const cwd = process.cwd();
const extendDir = global.conf.extend_dir;
const publicDir = global.conf.ui.paths.public.root;
const sourceDir = global.conf.ui.paths.source.root;

let binNpm = 'npm';

// Spawn npm.cmd if Windows and not BASH.
if (process.env.ComSpec && process.env.ComSpec.toLowerCase() === 'c:\\windows\\system32\\cmd.exe') {
  binNpm = 'npm.cmd';
}

// For consistency when outputting to console.
function adaptSlashes(path_) {
  let path = path_;

  if (binNpm === 'npm.cmd') {
    path = path_.replace(/\//g, '\\');
  }

  return path;
}

gulp.task('install:copy', (cb) => {
  // Copy source dir if it doesn't exist.
  if (!fs.existsSync(sourceDir)) {
    fs.copySync('excludes/profiles/main/source', sourceDir);
  }

  // Copy extend dir if it doesn't exist.
  if (!fs.existsSync(extendDir)) {
    fs.copySync('excludes/profiles/main/extend', extendDir);
  }

  // Run npm install in extend dir if no extend/node_modules dir.
  if (!fs.existsSync(`${extendDir}/node_modules`)) {
    process.chdir(extendDir);
    utils.log(`Working directory changed to ${adaptSlashes(extendDir)}.`);
    spawnSync(binNpm, ['install'], {stdio: 'inherit'});
  }

  // Run npm install in public dir if no public/node_modules dir.
  if (!fs.existsSync(`${publicDir}/node_modules`)) {
    process.chdir(publicDir);
    utils.log(`Working directory changed to ${adaptSlashes(publicDir)}.`);
    spawnSync(binNpm, ['install'], {stdio: 'inherit'});
  }

  // Finish up.
  process.chdir(cwd);
  utils.log(`Working directory changed to ${cwd}.`);

  cb();
});

gulp.task('install:copy-base', (cb) => {
  if (!fs.existsSync(sourceDir)) {
    fs.copySync('excludes/profiles/base/source', sourceDir);
  }

  if (!fs.existsSync(extendDir)) {
    fs.copySync('excludes/profiles/base/extend', extendDir);
  }

  cb();
});
