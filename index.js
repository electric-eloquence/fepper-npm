'use strict';

/* THIS FILE IS DEPRECATED. IT WILL BE REMOVED. */
console.warn('fepper-cli <= v1.1.0 is deprecated for fepper-npm >= v0.29.0.');
console.warn('Please run `fp update`.');

const cp = require('child_process');
const path = require('path');

const argv = ['--gulpfile', path.resolve(__dirname, 'tasker.js')];

// Set up array of args for submission to Gulp.
argv[2] = process.argv[2] ? process.argv[2] : 'default';

// Args containing spaces are wrapped in double quotes by the fp bash script.
// Now, parse the process.argv array for those wrapped args, and create a new
// array where they are formatted correctly.
if (process.argv[3]) {
  let j = 3;
  let quoted = false;

  for (let i = 3; i < process.argv.length; i++) {
    if (quoted) {
      argv[j] += ` ${process.argv[i]}`;
    }
    else {
      argv[j] = process.argv[i];
    }

    if (argv[j][0] === '"') {
      quoted = true;
    }
    else if (argv[j].slice(-1) === '"') {
      quoted = false;
    }

    if (!quoted) {
      j++;
    }
  }
}

const indexOfD = argv.indexOf('-d');
const indexOfDebug = argv.indexOf('--debug');

if (indexOfD > -1 || indexOfDebug > -1) {
  process.env.DEBUG = true;

  if (indexOfD > -1) {
    argv.splice(indexOfD, 1);
  }
  else if (indexOfDebug > -1) {
    argv.splice(indexOfDebug, 1);
  }
}

if (process.env.ROOT_DIR) {
  process.env.NODE_PATH = path.resolve(process.env.ROOT_DIR, 'node_modules');
}

const binPath = path.resolve('node_modules', '.bin');
let binGulp = path.resolve(binPath, 'gulp');

// Spawn gulp.cmd if Windows and not BASH.
if (process.env.ComSpec && process.env.ComSpec.toLowerCase() === 'c:\\windows\\system32\\cmd.exe') {
  binGulp = path.resolve(binPath, 'gulp.cmd');
}

// Spawn gulp task with arguments.
cp.spawn(binGulp, argv, {stdio: 'inherit', env: process.env});
