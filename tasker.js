/**
 * Primary gulpfile for running this application's tasks.
 *
 * The tasks listed here are for general use by developers and non-developers.
 */
'use strict';

const fs = require('fs-extra');
const gulp = global.gulp = require('gulp');
const requireDir = require('require-dir');
const slash = require('slash');
const utils = require('fepper-utils');
const t = utils.t;

// We need to set globals in order to parse prefs in order to see if the user wants to instantiate a custom subclass.
global.appDir = slash(__dirname);
const rootDir = global.rootDir = utils.findupRootDir(null, __dirname);
const pref = global.pref = utils.pref(); // pref() must run before conf() in order for i18n to work.
const conf = global.conf = utils.conf(); // This runs utils.uiConfigNormalize().

let instanceFile;

if (pref.instance_file) {
  instanceFile = `${rootDir}/${pref.instance_file}`;
}
else {
  instanceFile = './core/fepper';
}

// Instantiate Fepper.
const Fepper = require(instanceFile);
new Fepper();

// Require tasks in task directories.
requireDir('./tasker');

// Optionally require auxiliary, contrib, and custom tasks.
const extendDir = conf.extend_dir;
const auxConFile = `${extendDir}/auxiliary/auxiliary-contrib.js`;
const auxCusFile = `${extendDir}/auxiliary/auxiliary-custom.js`;
const conFile = `${extendDir}/contrib.js`;
const cusFile = `${extendDir}/custom.js`;
const auxConExists = fs.existsSync(auxConFile);
const auxCusExists = fs.existsSync(auxCusFile);
const conExists = fs.existsSync(conFile);
const cusExists = fs.existsSync(cusFile);

// Do not run this block during installation because the required files may not be in place.
if (process.argv[4] !== 'install' && fs.existsSync(extendDir)) {
  if (auxConExists) {
    require(auxConFile);
  }

  if (auxCusExists) {
    require(auxCusFile);
  }

  if (conExists) {
    require(conFile);
  }

  if (cusExists) {
    require(cusFile);
  }

  // Search for extension tasks and require them.
  // Resorting to this long, rather unreadable block of code to obviate requiring the large Glob npm.
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

  for (const basenameAtLevel0 of basenamesAtLevel0) {
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

  for (const dirAtLevel0 of dirsAtLevel0) {
    // Level 1 declarations.
    const dirsAtLevel1 = [];
    const basenamesAtLevel1 = fs.readdirSync(dirAtLevel0);

    for (const basenameAtLevel1 of basenamesAtLevel1) {
      try {
        const fileAtLevel1 = `${dirAtLevel0}/${basenameAtLevel1}`;
        const statAtLevel1 = fs.statSync(fileAtLevel1);

        if (statAtLevel1.isFile() && fileAtLevel1.slice(-suffix.length) === suffix) {
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

    for (const dirAtLevel1 of dirsAtLevel1) {
      // Level 2 declarations.
      const basenamesAtLevel2 = fs.readdirSync(dirAtLevel1);

      for (const basenameAtLevel2 of basenamesAtLevel2) {
        try {
          const fileAtLevel2 = `${dirAtLevel1}/${basenameAtLevel2}`;
          const statAtLevel2 = fs.statSync(fileAtLevel2);

          if (statAtLevel2.isFile() && fileAtLevel2.slice(-suffix.length) === suffix) {
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

function extensionsPush(taskName, argsArr, tasksArr = []) {
  let isAuxiliary = false;

  if (taskName.slice(-12) === ':postprocess') {
    isAuxiliary = true;
  }

  if (isAuxiliary) {
    if (auxConExists) {
      tasksArr.push(`contrib:${taskName}`);
    }

    if (auxCusExists) {
      tasksArr.push(`custom:${taskName}`);
    }
  }
  else {
    if (conExists) {
      tasksArr.push(`contrib:${taskName}`);
    }

    if (cusExists) {
      tasksArr.push(`custom:${taskName}`);
    }
  }

  if (tasksArr.length) {
    argsArr.push(tasksArr);
  }
}

// Check if argument matches a task. If not, output help info.
if (
  process.argv[4] !== 'default' &&
  !Object.keys(gulp.tasks).includes(process.argv[4])
) {
  global.fepper.tasks.helper.main();

  // Exit before gulp outputs that the task is not in the gulpfile.
  // Those not familar with gulp might find this confusing.
  // eslint-disable-next-line no-process-exit
  process.exit();
}

// Declare gulp tasks.

// Primary task when fp (or any of its aliases) is entered without an argument is to launch and open in browser.
gulp.task('default', function (cb) {
  const args = [];

  args.push('once');

  // TCP-IP overrides must run before the Express app starts listening and gulp starts watching the file system in order
  // to LiveReload changes.
  extensionsPush('tcp-ip', args);
  args.push(['tcp-ip-load:listen', 'tcp-ip-reload:listen']);

  const tasks = ['tcp-ip-load:open', 'tcp-ip-reload:watch'];

  extensionsPush('watch', args, tasks);

  // Probably no use-case for these tcp-ip:postprocess tasks, but here just in case.
  extensionsPush('tcp-ip:postprocess', args);

  args.push(() => {
    cb();
    // eslint-disable-next-line quotes
    utils.log(`${t("Listening on port %s")}`, conf.express_port);
  });
  gulp.runSeq(...args);
});

gulp.task('data', function (cb) {
  const args = [];

  extensionsPush('data', args);
  args.push('fepper:data');
  extensionsPush('data:postprocess', args);
  args.push('ui:build');

  if (conf.ui.cleanPublic) {
    args.push('ui:copy-assets');
    args.push('ui:copy-scripts');
    args.push('ui:copy-styles');
  }

  args.push(cb);
  gulp.runSeq(...args);
});

gulp.task('frontend-copy', function (cb) {
  const args = [];

  extensionsPush('frontend-copy', args);
  args.push(['fepper:copy-assets', 'fepper:copy-scripts', 'fepper:copy-styles']);
  extensionsPush('frontend-copy:postprocess', args);
  args.push(cb);
  gulp.runSeq(...args);
});

gulp.task('install', function (cb) {
  gulp.runSeq(
    'install:copy',
    cb
  );
});

gulp.task('once', function (cb) {
  const args = [];

  extensionsPush('once', args);

  // Data tasks grouped as follows. "once" extension tasks run before data tasks.
  // "ui" tasks and "once" postprocess tasks run after.
  extensionsPush('data', args);
  args.push('fepper:data');
  extensionsPush('data:postprocess', args);

  if (conf.ui.cleanPublic) {
    args.push('ui:clean');
  }

  args.push('ui:build');
  args.push('ui:copy-assets');
  args.push('ui:copy-scripts');
  args.push('ui:copy-styles');

  extensionsPush('once:postprocess', args);
  args.push(cb);
  gulp.runSeq(...args);
});

gulp.task('restart', function (cb) {
  const args = [];

  args.push('once');

  // TCP-IP overrides must run before the Express app starts listening and gulp starts watching the file system in order
  // to live reload changes.
  extensionsPush('tcp-ip', args);
  args.push(['tcp-ip-load:listen', 'tcp-ip-reload:listen']);

  const tasks = ['tcp-ip-reload:watch'];

  extensionsPush('watch', args, tasks);

  // Probably no use-case for these tcp-ip:postprocess tasks, but here just in case.
  extensionsPush('tcp-ip:postprocess', args);

  args.push(() => {
    cb();
    // eslint-disable-next-line quotes
    utils.log(`${t("Listening on port %s")}`, conf.express_port);
  });

  // An added measure for power-usage, delete any lingering install.log, normally deleted by the plain `fp` task.
  const log = `${rootDir}/install.log`;

  if (fs.existsSync(log)) {
    fs.removeSync(log);
  }

  gulp.runSeq(...args);
});

gulp.task('static', function (cb) {
  const args = [];

  extensionsPush('static', args);
  args.push('once');
  args.push('fepper:static-generate');
  extensionsPush('static:postprocess', args);
  args.push('ui:copy-static');
  args.push(cb);
  gulp.runSeq(...args);
});

gulp.task('syncback', function (cb) {
  const args = [];

  extensionsPush('syncback', args);
  args.push('frontend-copy');
  args.push('template');
  extensionsPush('syncback:postprocess', args);
  args.push(cb);
  gulp.runSeq(...args);
});

gulp.task('template', function (cb) {
  const args = [];

  extensionsPush('template', args);
  args.push('fepper:template');
  extensionsPush('template:postprocess', args);
  args.push(cb);
  gulp.runSeq(...args);
});

// Export gulp instance for customization, testing, etc.
module.exports = gulp;
