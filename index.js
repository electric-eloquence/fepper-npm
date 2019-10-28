#!/usr/bin/env node
'use strict';

const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const yaml = require('js-yaml');

const confFile = './conf.yml';
const enc = 'utf8';
const isWindows = (process.env.ComSpec && process.env.ComSpec.toLowerCase() === 'c:\\windows\\system32\\cmd.exe');

try {
  const yml = fs.readFileSync(confFile, enc);
  const conf = yaml.safeLoad(yml);
  let killZombies = isWindows ? false : conf.kill_zombies;

  // Don't run this loop (or kill zombies) if Windows.
  if (killZombies) {
    // Only kill zombies on default and restart tasks.
    // Since no arg after element 1 means the default task, we only need to check when process.argv.length > 2.
    if (process.argv.length > 2) {
      let i;

      for (i = 0; i < process.argv.length; i++) {
        if (
          process.argv[i] === 'default' ||
          process.argv[i] === 'restart'
        ) {
          break;
        }
      }

      // If the previous loop was not broken by discovery of a zombie-killing task, do not kill zombies.
      if (i === process.argv.length) {
        killZombies = false;
      }
    }
  }

  if (killZombies) {
    const spawnObj = cp.spawnSync('pgrep', ['-x', 'gulp']);
    const gulpPids = spawnObj.stdout.toString(enc).trim().split('\n');

    for (let gulpPid of gulpPids) {
      if (!/^\d+$/.test(gulpPid)) {
        continue;
      }

      cp.spawnSync('kill', [gulpPid], {stdio: 'inherit'});
      // eslint-disable-next-line no-console
      console.log(`Killing gulp process ${gulpPid}.`);
    }
  }
}
catch {}

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = process.cwd();
}

process.env.NODE_PATH = path.join(process.env.ROOT_DIR, 'node_modules');

// Set up array of args for submission to gulp.
const appDir = process.env.APP_DIR || path.join(process.env.NODE_PATH, 'fepper');
const tasker = path.join(appDir, 'tasker.js');
const argv = ['--gulpfile', tasker];

// Set up array of args for submission to gulp.
if (process.argv.length < 3) {
  argv.push('default');
}
else {
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];

    if (arg === '-d' || arg === '--debug') {
      process.env.DEBUG = true;

      continue;
    }
    else {
      argv.push(arg);
    }
  }
}

const binPath = path.join(process.env.NODE_PATH, '.bin');
let binGulp = path.join(binPath, 'gulp');

// Spawn gulp.cmd if Windows.
if (isWindows) {
  binGulp = path.join(binPath, 'gulp.cmd');
}

// Spawn gulp task with arguments.
cp.spawn(binGulp, argv, {stdio: 'inherit', env: process.env});
