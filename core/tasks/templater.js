/**
 * Translates templates in Pattern Lab to templates consumable by the backend.
 *
 * Converts Mustache tags into whatever type of tokens are used by the backend
 * webapp based on mappings in a YAML file named similarly to the Mustache
 * template.
 */
'use strict';

const path = require('path');

const diveSync = require('diveSync');
const fs = require('fs-extra');
const slash = require('slash');
const yaml = require('js-yaml');

module.exports = class {
  constructor(options) {
    this.conf = options.conf;
    this.pref = options.pref;
    this.rootDir = options.rootDir;
    this.utils = options.utils;

    this.srcDir = this.conf.ui.paths.source.templates;
  }

  mustacheRecurse(file) {
    const patternsDir = this.conf.ui.paths.source.patterns;

    let code;
    let code1 = '';

    try {
      // Read code which will receive token replacement.
      code = fs.readFileSync(file, this.conf.enc);
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
          let partialCode = this.mustacheRecurse(patternsDir + '/' + partial[0], patternsDir);
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
      this.utils.error(err);
    }
  }

  mustacheUnescape(escaped) {
    let unescaped = escaped.replace(/\{\s*/, '{\\s');
    unescaped = unescaped.replace(/\s*\}/, '\\s}');

    return unescaped;
  }

  templateProcess(file, templatesDirDefault, templatesExtDefault) {
    let data = null;
    let mustacheFile;
    let srcDirParam = this.srcDir;
    let stat = null;
    let stat1 = null;
    let templatesDir = '';
    let templatesExt = '';
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
        const yml = fs.readFileSync(ymlFile, this.conf.enc);
        data = yaml.safeLoad(yml);

        if (typeof data.templates_dir === 'string') {
          templatesDir = this.utils.backendDirCheck(data.templates_dir);

          // Do not maintain nested directory structure in backend if
          // templates_dir is set in exceptional YAML file.
          if (templatesDir) {
            srcDirParam = path.dirname(mustacheFile);
          }

          // Unset templates_dir in local YAML data.
          delete data.templates_dir;
        }

        if (typeof data.templates_ext === 'string') {
          templatesExt = this.utils.extNormalize(data.templates_ext);

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
      try {
        // Recurse through Mustache templates (sparingly. See comment above.)
        let code = this.mustacheRecurse(mustacheFile);
        // Iterate through tokens and replace keys for values in the code.
        code = this.tokensReplace(data, code);
        // Write translated templates.
        const dest = this.templatesWrite(mustacheFile, srcDirParam, templatesDir, templatesExt, code);

        // Log to console.
        // Headless operation is for testing, so only log this on headed operation.
        if (this.conf.headed) {
          this.utils.log('Template %s translated.', dest.replace(this.rootDir, '').replace(/^\//, ''));
        }
      }
      catch (err) {
        this.utils.error(err);
      }
    }
  }

  templatesGlob() {
    const globbed = [];
    const nosyncStr = '/_nosync';

    diveSync(
      this.srcDir,
      {
        filter: (pathname, dir) => {
          if (
            pathname.indexOf(`${nosyncStr}/`) > -1 ||
            pathname.slice(-nosyncStr.length) === nosyncStr
          ) {
            return false;
          }
          else if (dir) {
            return true;
          }
          else if (path.extname(pathname) === this.conf.ui.patternExtension) {
            return true;
          }
          else {
            return false;
          }
        }
      },
      (err, file) => {
        if (err) {
          this.utils.error(err);
        }

        globbed.push(slash(file));
      }
    );

    return globbed;
  }

  templatesWrite(file, srcDirParam, templatesDir, templatesExt, code) {
    // Determine destination for token-replaced code.
    let dest = file.replace(srcDirParam, '');

    // Replace underscore prefixes.
    dest = dest.replace(/\/_([^\/]+)$/, '/$1');
    dest = templatesDir + dest;
    dest = dest.replace(/\.mustache$/, templatesExt);

    // Write to file system.
    fs.ensureDirSync(path.dirname(dest));
    fs.outputFileSync(dest, code);

    return dest;
  }

  tokensReplace(tokens, codeParam) {
    let code = codeParam;
    let regex;
    let token;
    let unescaped;

    for (let i in tokens) {
      if (tokens.hasOwnProperty(i)) {
        unescaped = this.mustacheUnescape(i);
        regex = new RegExp('\\{\\{\\{?\\s*' + unescaped + '\\s*\\}?\\}\\}', 'g');
        token = tokens[i].replace(/^\n/, '');
        token = token.replace(/\n$/, '');
        code = code.replace(regex, token);
      }
    }

    // Delete remaining Mustache tags if configured to do so.
    if (!this.pref.templater.retain_mustache) {
      code = code.replace(/\{\{[^\(]*?(\([\S\s]*?\))?\s*\}?\}\}\s*\n?/g, '');
    }
    // Replace escaped curly braces.
    code = code.replace(/\\\{/g, '{');
    code = code.replace(/\\\}/g, '}');

    return code;
  }

  main() {
    const files = this.templatesGlob();
    const templatesDirDefault = this.utils.backendDirCheck(this.pref.backend.synced_dirs.templates_dir);
    const templatesExtDefault = this.utils.extNormalize(this.pref.backend.synced_dirs.templates_ext);

    // Search source directory for Mustache files.
    // Excluding templates in _nosync directory and those prefixed by __.
    // Trying to keep the globbing simple and maintainable.
    for (let i = 0; i < files.length; i++) {
      this.templateProcess(files[i], templatesDirDefault, templatesExtDefault);
    }
  }
};
