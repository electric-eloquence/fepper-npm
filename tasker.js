/**
 * Primary gulpfile for running this application's tasks.
 *
 * The tasks listed here are for general use by developers and non-developers.
 */
'use strict';

const fs = require('fs-extra');
const gulp = require('gulp');
const requireDir = require('require-dir');
const runSequence = require('run-sequence');
const slash = require('slash');
const utils = require('fepper-utils');

const Fepper = require('./core/fepper');

// Set globals.
// Determine rootDir whether running headless or whether running a full implementation.
// global.appDir as set here might be temporary and be reset as the app_dir value from conf.yml.
const thisDir = global.appDir = slash(__dirname);
let rootDir = '';
let isHeaded = false;

if (process.env.HEADED) {
  isHeaded = true;
}

if (process.env.ROOT_DIR) {
  rootDir = slash(process.env.ROOT_DIR);

  if (!fs.existsSync(rootDir)) {
    rootDir = '';
  }
}
else {
  // utils.findup() will replace backslashes with slashes.
  rootDir = utils.findup('fepper.command', thisDir);

  if (rootDir) {
    isHeaded = true;
  }
}

// The only existing headless use-case is testing.
if (!isHeaded) {
  rootDir = `${thisDir}/test`;
}

if (!rootDir) {
  utils.error('It appears you are trying to run Fepper from a critically broken environment! Exiting!');

  return;
}

global.rootDir = rootDir;

utils.conf(isHeaded); // This resets global.appDir if conf.app_dir differs from it.
utils.pref(isHeaded);

if (!global.conf || !global.pref) {
  return;
}

// Instantiate a Fepper object and attach it to the global object.
global.fepper = new Fepper();

// Proceed with tasking.
const conf = global.conf;

// Require tasks in task directories.
requireDir('./tasker');

// Optionally require auxiliary, contrib, and custom tasks.
const extendDir = conf.extend_dir;
const auxDir = `${extendDir}/auxiliary`;
const conFile = `${extendDir}/contrib.js`;
const cusFile = `${extendDir}/custom.js`;
const auxExists = fs.existsSync(auxDir);
const conExists = fs.existsSync(conFile);
const cusExists = fs.existsSync(cusFile);

if (fs.existsSync(`${extendDir}/node_modules`)) {
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
  // Resorting to this long, rather unreadable block of code to obviate requiring the large Glob NPM.
  // (Yes, other dependencies also depend on Glob, so if Fepper were to stay in sync with at least one of them, there
  // wouldn't be any additional download overhead, but we don't want this bit of additional maintenance upkeep.)
  //
  // Require scripts ending in "~extend.js" at Level 1 and Level 2 below the "extend" directory.
  // Choosing for...of loops and their readability in exchange for performance.

  // Level 0 declarations.
  const dirsAtLevel0 = [];
  const level0 = extendDir;
  const basenamesAtLevel0 = fs.readdirSync(level0);
  const suffix = '~extend.js';

  for (let basenameAtLevel0 of basenamesAtLevel0) {
    try {
      const fileAtLevel0 = `${level0}/${basenameAtLevel0}`;
      const statAtLevel0 = fs.statSync(fileAtLevel0);

      if (statAtLevel0.isDirectory()) {
        dirsAtLevel0.push(fileAtLevel0);
      }
    }
    catch (err) {
      utils.error(err);
    }
  }

  for (let dirAtLevel0 of dirsAtLevel0) {
    // Level 1 declarations.
    const dirsAtLevel1 = [];
    const basenamesAtLevel1 = fs.readdirSync(dirAtLevel0);

    for (let basenameAtLevel1 of basenamesAtLevel1) {
      try {
        const fileAtLevel1 = `${dirAtLevel0}/${basenameAtLevel1}`;
        const statAtLevel1 = fs.statSync(fileAtLevel1);

        if (statAtLevel1.isFile() && fileAtLevel1.indexOf(suffix) === fileAtLevel1.length - suffix.length) {
          require(fileAtLevel1);
        }
        else if (statAtLevel1.isDirectory()) {
          dirsAtLevel1.push(fileAtLevel1);
        }
      }
      catch (err) {
        utils.error(err);
      }
    }

    for (let dirAtLevel1 of dirsAtLevel1) {
      // Level 2 declarations.
      const basenamesAtLevel2 = fs.readdirSync(dirAtLevel1);

      for (let basenameAtLevel2 of basenamesAtLevel2) {
        try {
          const fileAtLevel2 = `${dirAtLevel1}/${basenameAtLevel2}`;
          const statAtLevel2 = fs.statSync(fileAtLevel2);

          if (statAtLevel2.isFile() && fileAtLevel2.indexOf(suffix) === fileAtLevel2.length - suffix.length) {
            require(fileAtLevel2);
          }
        }
        catch (err) {
          utils.error(err);
        }
      }
    }
  }
}

// Main tasks.
gulp.task('default', cb => {
  let args = [];

  args.push('once');
  args.push('tcp-ip-load:init');

  if (conExists && cusExists) {

    // TCP-IP overrides must run after tcp-ip-load:init in order for there to be a global.expressApp object to override.
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

  if (conExists && cusExists) {
    args.push(['contrib:data:postprocess', 'custom:data:postprocess']);
  }

  args.push('ui:build');

  if (conf.ui.cleanPublic) {
    args.push('ui:copy');
    args.push('ui:copy-styles');
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
    'install:copy',
    cb
  );
});

gulp.task('once', cb => {
  let args = [];

  if (conExists && cusExists) {
    args.push(['contrib:once', 'custom:once']);
    args.push(['contrib:data', 'custom:data']);
  }

  args.push('fepper:data');

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
  args.push('tcp-ip-load:init');

  if (conExists && cusExists) {

    // TCP-IP overrides must run after tcp-ip-load:init in order for there to be a global.expressApp object to override.
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

  // An added measure for power usage, delete any lingering install.log, normally deleted by the plain `fp` task.
  const log = `${rootDir}/install.log`;

  if (fs.existsSync(log)) {
    fs.unlinkSync(log);
  }

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
    'test:eslint',
    'test:mocha',
    cb
  );
});
