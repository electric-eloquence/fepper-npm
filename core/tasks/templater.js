/**
 * Compiles templates in Pattern Lab to templates in backend.
 *
 * Converts Mustache tags into whatever type of tokens are used by the backend
 * webapp based on mappings in a YAML file named similarly to the Mustache
 * template.
 */
'use strict';

const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');
const yaml = require('js-yaml');

const utils = require('../lib/utils');

const conf = global.conf;
const pref = global.pref;
const workDir = global.workDir;

const patternsDir = utils.pathResolve(conf.ui.paths.source.patterns);
const srcDir = utils.pathResolve(conf.ui.paths.source.templates);

exports.mustacheRecurse = function (file) {
  let code;
  let code1 = '';

  try {
    // Read code which will receive token replacement.
    code = fs.readFileSync(file, conf.enc);
    // Split by Mustache tag for parsing.
    let codeSplit = code.split('{{');

    for (let i = 0; i < codeSplit.length; i++) {
      // Signal the OK to recurse by appending partial tags with the .mustache
      // extension. We do NOT want to recurse EVERY included partial because
      // then the outputted file will not contain any partials, which defeats
      // the purpose of recursing templates in the first place.
      if (/^>\s*[\w\-\.\/~]+\.mustache\s*\}\}/.test(codeSplit[i])) {
        let partial = codeSplit[i].split('}}');
        partial[0] = partial[0].replace(/^>\s*/, '').trim();
        let partialCode = exports.mustacheRecurse(patternsDir + '/' + partial[0], patternsDir);
        code1 += partialCode;

        for (let j = 0; j < partial.length; j++) {
          if (j > 0) {
            code1 += partial[j];

            if (j < partial.length - 1) {
              code1 += '}}';
            }
          }
        }
      }
      else {
        if (i > 0) {
          code1 += '{{' + codeSplit[i];
        }
        else {
          code1 += codeSplit[i];
        }
      }
    }

    return code1;
  }
  catch (err) {
    utils.error(err);
  }
};

exports.mustacheUnescape = function (escaped) {
  let unescaped = escaped.replace(/\{\s*/, '{\\s');
  unescaped = unescaped.replace(/\s*\}/, '\\s}');

  return unescaped;
};

exports.templateProcess = function (file, templatesDirDefault, templatesExtDefault) {
  let code;
  let data = null;
  let dest;
  let mustacheFile;
  let srcDirParam = srcDir;
  let stat = null;
  let stat1 = null;
  let templatesDir = '';
  let templatesExt = '';
  let yml;
  let ymlFile = '';

  // Exclude files prefixed by __
  if (path.basename(file).slice(0, 2) === '__') {
    return;
  }

  if (path.extname(file) === '.yml') {
    mustacheFile = file.replace(/\.yml$/, '.mustache');
    ymlFile = file;
  }
  else if (path.extname(file) === '.mustache') {
    mustacheFile = file;
    ymlFile = file.replace(/\.mustache$/, '.yml');
  }

  try {
    stat = fs.statSync(mustacheFile);
  }
  catch (err) {
    // Only process templates that actually exist.
    return;
  }

  try {
    stat1 = fs.statSync(ymlFile);
  }
  catch (err) {
    // Fail gracefully.
  }

  // Return on stat fail. Exclude non-files.
  if (!stat || !stat.isFile()) {
    return;
  }

  // Try to read YAML file if it exists.
  if (stat1 && stat1.isFile()) {
    // Read YAML file and store keys/values in tokens object.
    try {
      yml = fs.readFileSync(ymlFile, conf.enc);
      data = yaml.safeLoad(yml);

      if (typeof data.templates_dir === 'string') {
        templatesDir = utils.backendDirCheck(data.templates_dir);

        // Do not maintain nested directory structure in backend if
        // templates_dir is set in exceptional YAML file.
        if (templatesDir) {
          srcDirParam = path.dirname(mustacheFile);
        }

        // Unset templates_dir in local YAML data.
        delete data.templates_dir;
      }

      if (typeof data.templates_ext === 'string') {
        templatesExt = utils.extCheck(data.templates_ext);

        // Unset templates_dir in local YAML data.
        delete data.templates_ext;
      }
    }
    catch (err) {
      // Fail gracefully.
      data = null;
    }
  }

  if (templatesDirDefault && !templatesDir) {
    templatesDir = templatesDirDefault;
  }

  if (templatesExtDefault && !templatesExt) {
    templatesExt = templatesExtDefault;
  }

  if (templatesDir && templatesExt) {
    // Recurse through Mustache templates (sparingly. See comment above.)
    code = exports.mustacheRecurse(mustacheFile);
    // Iterate through tokens and replace keys for values in the code.
    code = exports.tokensReplace(data, code);
    // Write compiled templates.
    dest = exports.templatesWrite(mustacheFile, srcDirParam, templatesDir, templatesExt, code);

    // Log to console.
    utils.log('Template %s synced.', dest.replace(workDir, '').replace(/^\//, ''));
  }
};

exports.templatesGlob = function () {
  const globbed = glob.sync(srcDir + '/*.mustache');
  const globbed1 = glob.sync(srcDir + '/!(_nosync)/**/*.mustache');

  return globbed.concat(globbed1);
};

exports.templatesWrite = function (file, srcDirParam, templatesDir, templatesExt, code) {
  // Determine destination for token-replaced code.
  let dest = file.replace(srcDirParam, '');

  // Replace underscore prefixes.
  dest = dest.replace(/\/_([^\/]+)$/, '/$1');
  dest = templatesDir + dest;
  dest = dest.replace(/\.mustache$/, templatesExt);

  // Write to file system.
  fs.mkdirpSync(path.dirname(dest));
  fs.writeFileSync(dest, code);

  return dest;
};

exports.tokensReplace = function (tokens, codeParam) {
  let code = codeParam;
  let regex;
  let token;
  let unescaped;

  for (let i in tokens) {
    if (tokens.hasOwnProperty(i)) {
      unescaped = exports.mustacheUnescape(i);
      regex = new RegExp('\\{\\{\\{?\\s*' + unescaped + '\\s*\\}?\\}\\}', 'g');
      token = tokens[i].replace(/^\n/, '');
      token = token.replace(/\n$/, '');
      code = code.replace(regex, token);
    }
  }

  // Delete remaining Mustache tags if configured to do so.
  if (!pref.templater.retain_mustache) {
    code = code.replace(/\{\{[^\(]*?(\([\S\s]*?\))?\s*\}?\}\}\s*\n?/g, '');
  }
  // Replace escaped curly braces.
  code = code.replace(/\\\{/g, '{');
  code = code.replace(/\\\}/g, '}');

  return code;
};

exports.main = function () {
  const files = exports.templatesGlob();
  const templatesDirDefault = utils.backendDirCheck(pref.backend.synced_dirs.templates_dir);
  const templatesExtDefault = utils.extCheck(pref.backend.synced_dirs.templates_ext);

  // Search source directory for Mustache files.
  // Excluding templates in _nosync directory and those prefixed by __.
  // Trying to keep the globbing simple and maintainable.
  for (let i = 0; i < files.length; i++) {
    exports.templateProcess(files[i], templatesDirDefault, templatesExtDefault);
  }
};
