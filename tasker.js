/**
 * Primary gulpfile for running this application's tasks.
 *
 * The tasks listed here are for general use by developers and non-developers.
 */
'use strict';

const fs = require('fs-extra');
const glob = require('glob');
const gulp = require('gulp');
const path = require('path');
const requireDir = require('require-dir');
const runSequence = require('run-sequence');
const slash = require('slash');

const utils = require('./core/lib/utils');

// Set global.conf, global.pref, global.rootDir, and global.workDir.
global.appDir = slash(__dirname);

// Determine rootDir whether running headless or whether running a full implementation.
let rootDir = utils.findup('fepper.command', __dirname);
let isHeadless = false;

if (!rootDir) {
  rootDir = utils.findup('tasker.js', __dirname);
  if (rootDir) {
    isHeadless = true;
  }
}

global.rootDir = slash(rootDir);
global.workDir = slash(rootDir);

utils.conf(isHeadless);
utils.pref(isHeadless);

// Require tasks in task directories.
requireDir('./tasker');

// Optionally require auxiliary, contrib, and custom tasks.
const auxDir = `${utils.pathResolve(conf.extend_dir)}/auxiliary`;
const conFile = `${utils.pathResolve(conf.extend_dir)}/contrib.js`;
const cusFile = `${utils.pathResolve(conf.extend_dir)}/custom.js`;
const auxExists = fs.existsSync(auxDir);
const conExists = fs.existsSync(conFile);
const cusExists = fs.existsSync(cusFile);
if (auxExists) {
  requireDir(auxDir);
}
if (conExists) {
  require(conFile);
}
if (cusExists) {
  require(cusFile);
}

// Search for extension tasks and require them.
const extendPlugins = glob.sync(utils.pathResolve(conf.extend_dir) + '/*/*/*~extend.js');
for (let i = 0; i < extendPlugins.length; i++) {
  require(extendPlugins[i]);
}

// Main tasks.
gulp.task('default', cb => {
  let args = [];

  args.push('once');
  args.push('fepper:pattern-configure');
  args.push('tcp-ip-load:init');

  if (conExists && cusExists) {
    // TCP-IP overrides need to run after tcp-ip-load:init in order for there to be a global.express object to override. 
    // They must then override it before it starts listening and tcp-ip-reload starts watching.
    args.push(['contrib:tcp-ip', 'custom:tcp-ip']);
  }

  args.push(['tcp-ip-load:listen', 'tcp-ip-reload:listen']);

  if (conExists && cusExists) {
    args.push(['contrib:watch', 'custom:watch', 'tcp-ip-load:open', 'tcp-ip-reload:watch']);
    // Probably no use-case for these contrib and custom postprocess tasks, but here just in case.
    args.push(['contrib:tcp-ip:postprocess', 'custom:tcp-ip:postprocess']);
  }
  else {
    args.push(['tcp-ip-load:open', 'tcp-ip-reload:watch']);
  }

  args.push(() => {
    cb();
    utils.log(`Listening on port ${conf.express_port}`);
  });

  runSequence.apply(null, args);
});

gulp.task('data', cb => {
  let args = [];

  if (conExists && cusExists) {
    args.push(['contrib:data', 'custom:data']);
  }

  args.push('fepper:data');
  args.push('ui:build');

  if (conExists && cusExists) {
    args.push(['contrib:data:postprocess', 'custom:data:postprocess']);
  }

  args.push(cb);

  runSequence.apply(null, args);
});

gulp.task('frontend-copy', cb => {
  let args = [];

  if (conExists && cusExists) {
    args.push(['contrib:frontend-copy', 'custom:frontend-copy']);
  }

  args.push(['fepper:copy-assets', 'fepper:copy-scripts', 'fepper:copy-styles']);

  if (conExists && cusExists) {
    args.push(['contrib:frontend-copy:postprocess', 'custom:frontend-copy:postprocess']);
  }

  args.push(cb);

  runSequence.apply(null, args);
});

gulp.task('install', cb => {
  runSequence(
    'ui:compile',
    'install:copy',
    'fepper:data',
    cb
  );
});

gulp.task('once', cb => {
  let args = [];

  if (conExists && cusExists) {
    args.push(['contrib:once', 'custom:once']);
    args.push(['contrib:data', 'custom:data']);
  }

  args.push(['fepper:data', 'fepper:pattern-configure']);

  if (conExists && cusExists) {
    args.push(['contrib:data:postprocess', 'custom:data:postprocess']);
  }

  args.push('ui:clean');
  args.push('ui:build');
  args.push('ui:copy');
  args.push('ui:copy-styles');

  if (conExists && cusExists) {
    args.push(['contrib:once:postprocess', 'custom:once:postprocess']);
  }

  args.push(cb);

  runSequence.apply(null, args);
});

gulp.task('restart', cb => {
  let args = [];

  args.push('once');
  args.push('fepper:pattern-configure');
  args.push('tcp-ip-load:init');

  if (conExists && cusExists) {
    // TCP-IP overrides need to run after tcp-ip-load:init in order for there to be a global.express object to override. 
    // They must then override it before it starts listening and tcp-ip-reload starts watching.
    args.push(['contrib:tcp-ip', 'custom:tcp-ip']);
  }

  args.push(['tcp-ip-load:listen', 'tcp-ip-reload:listen']);

  if (conExists && cusExists) {
    args.push(['contrib:watch', 'custom:watch', 'tcp-ip-reload:watch']);
    // Probably no use-case for these contrib and custom postprocess tasks, but here just in case.
    args.push(['contrib:tcp-ip:postprocess', 'custom:tcp-ip:postprocess']);
  }
  else {
    args.push('tcp-ip-reload:watch');
  }

  args.push(() => {
    cb();
    utils.log(`Listening on port ${conf.express_port}`);
  });

  runSequence.apply(null, args);
});

gulp.task('static', cb => {
  let args = [];

  if (conExists && cusExists) {
    args.push(['contrib:static', 'custom:static']);
  }

  args.push('once');
  args.push('fepper:static-generate');

  if (conExists && cusExists) {
    args.push(['contrib:static:postprocess', 'custom:static:postprocess']);
  }

  args.push(cb);

  runSequence.apply(null, args);
});

gulp.task('syncback', cb => {
  let args = [];

  if (conExists && cusExists) {
    args.push(['contrib:syncback', 'custom:syncback']);
  }

  args.push('frontend-copy');
  args.push('template');

  if (conExists && cusExists) {
    args.push(['contrib:syncback:postprocess', 'custom:syncback:postprocess']);
  }

  args.push(cb);

  runSequence.apply(null, args);
});

gulp.task('template', cb => {
  let args = [];

  if (conExists && cusExists) {
    args.push(['contrib:template', 'custom:template']);
  }

  args.push('fepper:template');

  if (conExists && cusExists) {
    args.push(['contrib:template:postprocess', 'custom:template:postprocess']);
  }

  args.push(cb);

  runSequence.apply(null, args);
});

gulp.task('test', cb => {
  runSequence(
    'test:eslint-extend',
    'test:eslint-fepper',
    'test:eslint-tasker',
    'test:eslint-root',
    'test:eslint-test',
    'test:mocha',
    cb
  );
});
