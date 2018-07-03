'use strict';

const fs = require('fs-extra');
const JSON = require('json5');
const path = require('path');
const yaml = require('js-yaml');

const enc = 'utf8';

// /////////////////////////////////////////////////////////////////////////////
// Conf and global vars.
// /////////////////////////////////////////////////////////////////////////////
exports.conf = (isHeadless) => {
  let conf;
  let confStr;
  let defaults;
  let defaultsStr;
  let yml;

  // Return if global.conf already set.
  if (global.conf) {
    return global.conf;
  }

  // Get default confs for Fepper core.
  try {
    yml = fs.readFileSync(`${global.appDir}/excludes/conf.yml`, enc);
    defaults = yaml.safeLoad(yml);
  }
  catch (err) {
    exports.error(err);
    exports.error('Missing or malformed excludes/conf.yml! Exiting!');

    return;
  }

  // Get default confs for UI.
  try {
    defaultsStr = fs.readFileSync(`${global.appDir}/excludes/patternlab-config.json`);
    defaults.ui = JSON.parse(defaultsStr);
    exports.normalizeUiPaths(defaults.ui);
  }
  catch (err) {
    exports.error(err);
    exports.error('Missing or malformed excludes/patternlab-config.json! Exiting!');

    return;
  }

  // Putting enc here for possible future configurability.
  defaults.enc = enc;

  // Get custom confs for Fepper core.
  if (isHeadless) {
    conf = {};
  }
  else {
    try {
      yml = fs.readFileSync(`${global.workDir}/conf.yml`, enc);
      conf = yaml.safeLoad(yml);
    }
    catch (err) {
      exports.error(err);
      exports.error('Missing or malformed conf.yml! Exiting!');

      return;
    }
  }

  // Retrieve custom values for UI.
  if (isHeadless) {
    conf.ui = {
      paths: {}
    };
  }
  else {
    try {
      confStr = fs.readFileSync(`${global.workDir}/patternlab-config.json`, enc);
      conf.ui = JSON.parse(confStr);

      // TODO: enumerate required settings and fail with console error if not present.
      if (!conf.ui.paths.public.cssBld) {
        exports.error('The conf.ui.paths.public.cssBld setting is missing from patternlab-config.json!');
        exports.error('The build will fail without this!');
        exports.error('You can probably copy conf.ui.paths.public.css to that setting for a successful build.');
        exports.error('Exiting!');

        return;
      }

      exports.normalizeUiPaths(conf.ui);
    }
    catch (err) {
      exports.error(err);
      exports.error('Missing or malformed patternlab-config.json! Exiting!');

      return;
    }
  }

  // Update Pattern Lab paths.
  try {
    let appDirShort;

    if (conf.app_dir) {
      appDirShort = conf.app_dir;
    }
    else if (global.appDir.indexOf(global.rootDir) > -1) {
      appDirShort = global.appDir.replace(global.rootDir, '');
    }

    if (appDirShort) {
      appDirShort += '/';
    }

    conf.ui.paths.core = {
      lib: `${appDirShort}ui/core/lib`
    };
  }
  catch (err) {
    exports.error('Missing or malformed excludes/patternlab-config.json! Exiting!');

    return;
  }

  // Override defaults with custom values.
  exports.extendButNotOverride(conf, defaults);

  // HTML scraper confs. Defining here because they should never be exposed to end-users.
  conf.scrape = {
    limit_error_msg: 'Submitting too many requests per minute.',
    limit_time: 30000,
    scraper_file: '00-html-scraper.mustache'
  };

  // Write to global object.
  global.conf = conf;

  return conf;
};

// The difference between confs and prefs is that confs are mandatory. However, the pref file must exist even if blank.
exports.pref = (isHeadless) => {
  let pref;
  let defaults;
  let yml;

  try {
    yml = fs.readFileSync(`${global.appDir}/excludes/pref.yml`, enc);
    defaults = yaml.safeLoad(yml);
  }
  catch (err) {
    exports.error(err);
    exports.error('Missing or malformed excludes/pref.yml! Exiting!');

    return;
  }

  if (isHeadless) {
    pref = {};
  }
  else {
    try {
      yml = fs.readFileSync(`${global.workDir}/pref.yml`, enc);
      pref = yaml.safeLoad(yml);
    }
    catch (err) {
      exports.error(err);
      exports.error('Missing or malformed pref.yml! Exiting!');

      return;
    }
  }

  exports.extendButNotOverride(pref, defaults);
  global.pref = pref;

  return pref;
};

exports.data = () => {
  let data = {};

  try {
    const dataStr = fs.readFileSync(exports.pathResolve(`${global.conf.ui.paths.source.data}/data.json`), enc);
    data = JSON.parse(dataStr);
  }
  catch (err) {
    exports.error(err);
  }

  return data;
};

// /////////////////////////////////////////////////////////////////////////////
// Data utilities.
// /////////////////////////////////////////////////////////////////////////////
/**
 * Recursively merge properties of two objects.
 *
 * @param {object} obj1 - This object's properties have priority over obj2.
 * @param {object} obj2 - If obj2 has properties obj1 doesn't, add to obj1, but do not override.
 *   Since obj1 gets mutated, the return value is only necessary for the purpose of referencing to a new variable.
 * @return {object} The mutated obj1 object.
 */
exports.extendButNotOverride = (obj1, obj2) => {
  for (let i in obj2) {
    if (obj2.hasOwnProperty(i)) {
      try {
        // Only recurse if obj2[i] is an object.
        if (obj2[i].constructor === Object) {
          // Requires 2 objects as params; create obj1[i] if undefined.
          if (typeof obj1[i] === 'undefined' || obj1[i] === null) {
            obj1[i] = {};
          }
          obj1[i] = exports.extendButNotOverride(obj1[i], obj2[i]);
        // Pop when recursion meets a non-object. If obj2[i] is a non-object,
        // only copy to undefined obj1[i]. This way, obj1 is not overriden.
        }
        else if (typeof obj1[i] === 'undefined' || obj1[i] === null) {
          obj1[i] = obj2[i];
        }
      }
      catch (err) {
        // Property in destination object not set; create it and set its value.
        if (typeof obj1[i] === 'undefined' || obj1[i] === null) {
          obj1[i] = obj2[i];
        }
      }
    }
  }

  return obj1;
};

exports.escapeReservedRegexChars = (regexStr) => {
  return regexStr.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
};

// /////////////////////////////////////////////////////////////////////////////
// File system utilities.
// /////////////////////////////////////////////////////////////////////////////
exports.backendDirCheck = (backendDir) => {
  if (typeof backendDir === 'string') {
    const fullPath = `${exports.pathResolve(global.conf.backend_dir)}/${backendDir.trim()}`;
    let stat;

    try {
      stat = fs.statSync(fullPath);
    }
    catch (err) {
      // Fail gracefully.
    }

    if (stat && stat.isDirectory()) {
      return fullPath;
    }
  }

  return '';
};

exports.extCheck = (ext) => {
  if (typeof ext === 'string') {
    let extNormalized = ext.trim();

    if (extNormalized[0] !== '.') {
      extNormalized = `.${extNormalized}`;
    }

    if (extNormalized.match(/^\.[\w\-\.\/]+$/)) {
      return extNormalized;
    }
  }

  exports.error(`The ${ext} extension contains invalid characters!`);

  return '';
};

/**
 * Because Pattern Lab :-/
 * Need to remove leading dot-slashes from properties within the paths object in patternlab-config.json.
 *
 * @param {object} uiObj - The UI configuration object.
 * @return {object} The mutated uiObj.
 */
exports.normalizeUiPaths = (uiObj) => {
  if (!uiObj || !uiObj.paths || !uiObj.paths.source) {
    throw 'Missing or malformed paths.source property!';
  }

  if (!uiObj.paths.public) {
    throw 'Missing or malformed paths.source property!';
  }

  const sourceObj = uiObj.paths.source;
  const publicObj = uiObj.paths.public;

  for (let i in sourceObj) {
    if (sourceObj.hasOwnProperty(i)) {
      if (sourceObj[i].slice(0, 2) === './') {
        sourceObj[i] = sourceObj[i].slice(2);
      }
    }
  }

  for (let i in publicObj) {
    if (publicObj.hasOwnProperty(i)) {
      if (publicObj[i].slice(0, 2) === './') {
        publicObj[i] = publicObj[i].slice(2);
      }
    }
  }

  return uiObj;
};

exports.pathResolve = (relPath, normalize) => {
  if (normalize) {
    return path.normalize(`${global.workDir}/${relPath}`);
  }
  else {
    return `${global.workDir}/${relPath}`;
  }
};

exports.findup = (filename, workDir) => {
  let dirMatch = null;
  let files = fs.readdirSync(workDir);

  if (files.indexOf(filename) > -1) {
    return workDir;
  }

  const workDirUp = path.normalize(`${workDir}/..`);
  files = fs.readdirSync(workDirUp);

  if (files.indexOf(filename) > -1) {
    return workDirUp;
  }
  else if (workDirUp !== '/') {
    dirMatch = exports.findup(filename, workDirUp);
  }
  else {
    return null;
  }

  return dirMatch;
};

// /////////////////////////////////////////////////////////////////////////////
// Logging.
// /////////////////////////////////////////////////////////////////////////////
exports.console = console; // To not trigger eslint errors on assignment.

exports.isTest = () => {
  let isGulp = false;
  let isTest = false;

  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i].slice(-5) === 'mocha') {
      isTest = true;
      break;
    }
    else if (process.argv[i].slice(-4) === 'gulp') {
      isGulp = true;
    }
    else if (isGulp && process.argv[i] === 'test') {
      isTest = true;
      break;
    }
  }

  return isTest;
};

exports.i = (obj, depth, showHidden) => {
  exports.console.dir(obj, {showHidden: showHidden, depth: depth || null});
};

exports.info = exports.console.info;

// Need to use the old function statement syntax so the arguments object works correctly.
exports.error = function () {
  if (arguments.length) {
    arguments[0] = '\x1b[31m' + arguments[0] + '\x1b[0m';
  }
  exports.console.error.apply(null, arguments);
};

exports.log = function () {
  if (!exports.isTest()) {
    if (arguments.length) {
      arguments[0] = '\x1b[36m' + arguments[0] + '\x1b[0m';
    }
    exports.console.log.apply(null, arguments);
  }
};

exports.warn = function () {
  if (arguments.length) {
    arguments[0] = '\x1b[33m' + arguments[0] + '\x1b[0m';
  }
  exports.console.warn.apply(null, arguments);
};

exports.httpCodes = {
  404: 'HTTP 404: Not Found',
  500: 'HTTP 500: Internal Server Error'
};

// /////////////////////////////////////////////////////////////////////////////
// Webserved directories.
// /////////////////////////////////////////////////////////////////////////////
/**
 * Remove first path element from webservedDirsFull and save to array.
 *
 * @param {array} webservedDirsFull - The array of webserved directories.
 * @return {array} The webserved directories stripped of configuration prefix.
 */
exports.webservedDirnamesTruncate = (webservedDirsFull) => {
  if (!webservedDirsFull || !webservedDirsFull.length) {
    return [];
  }

  const webservedDirsShort = [];

  for (let i = 0; i < webservedDirsFull.length; i++) {
    const webservedDirSplit = webservedDirsFull[i].split('/');
    webservedDirSplit.shift();
    webservedDirsShort.push(webservedDirSplit.join('/'));
  }

  return webservedDirsShort;
};

/**
 * Copy webserved_dirs to static site dir.
 *
 * @param {array} webservedDirsFull - Path to directories webserved by Fepper.
 * @param {array} webservedDirsShort - Path to directories webserved by Fepper
 *   truncated for publishing to static site.
 * @param {string} staticDir - The destination directory.
 */
exports.webservedDirsCopy = (webservedDirsFull, webservedDirsShort, staticDir) => {
  for (let i = 0; i < webservedDirsFull.length; i++) {
    fs.copySync(
      `${exports.pathResolve(global.conf.backend_dir)}/${webservedDirsFull[i]}`,
      `${staticDir}/${webservedDirsShort[i]}`
    );
  }
};
