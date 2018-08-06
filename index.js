'use strict';

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

// The "headed" conf is for internal Fepper development only. Necessary when requiring fepper-npm with `npm link`.
const indexOfHeaded = argv.indexOf('headed');

if (indexOfHeaded > -1) {
  let rootDir;

  process.env.HEADED = true;

  if (argv[indexOfHeaded + 1]) {
    rootDir = argv.splice(indexOfHeaded + 1, 1)[0];
    process.env.NODE_PATH = path.resolve(rootDir, 'node_modules');
    process.env.ROOT_DIR = rootDir;
  }

  argv.splice(indexOfHeaded, 1);
}

const binPath = path.resolve('node_modules', '.bin');
const winGulp = path.resolve(binPath, 'gulp.cmd');

let binGulp = path.resolve(binPath, 'gulp');

// Spawn gulp.cmd if Windows and not BASH.
if (process.env.ComSpec && process.env.ComSpec.toLowerCase() === 'c:\\windows\\system32\\cmd.exe') {
  binGulp = winGulp;
}

// Spawn gulp task with arguments.
cp.spawn(binGulp, argv, {stdio: 'inherit', env: process.env});
