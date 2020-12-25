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
const Feplet = require('feplet');
const fs = require('fs-extra');
const slash = require('slash');
const yaml = require('js-yaml');

let t;

module.exports = class {
  constructor(options) {
    this.options = options;
    this.conf = options.conf;
    this.pref = options.pref;
    this.rootDir = options.rootDir;
    this.utils = options.utils;

    this.srcDir = this.conf.ui.paths.source.templates;

    t = this.utils.t;
  }

  mustacheRecurse(code) {
    const partsByTag = code.split('{{');
    const patternExtension = this.conf.ui.patternExtension;
    const patternsDir = this.conf.ui.paths.source.patterns;
    let codeEscaped = '';

    for (let i = 0; i < partsByTag.length; i++) {
      const part = partsByTag[i];

      if (i === 0) {
        codeEscaped += part;
      }
      else {
        if (part[0] === '>') {
          const partsOfPart = part.split('}}');
          const regexStr = patternExtension + '\\s*\\(';
          const regex = new RegExp(regexStr);

          if (
            partsOfPart[0].trim().slice(-patternExtension.length) === patternExtension ||
            regex.test(partsOfPart[0])
          ) {
            codeEscaped += '\u0002\u0002' + part.replace('}}', '\u0003\u0003');
          }
          else {
            codeEscaped += '{{' + part;
          }
        }
        else {
          codeEscaped += '{{' + part;
        }
      }
    }

    const delimiters = '\u0002\u0002 \u0003\u0003';
    const parseArr = Feplet.parse(Feplet.scan(codeEscaped, delimiters), null, {delimiters});
    const partials = {};
    const partialsComp = {};

    for (const part of parseArr) {
      if (part.tag === '>') {
        const parenIndex = part.n.indexOf('(');
        let partPath = part.n;

        if (parenIndex > -1) {
          partPath = part.n.slice(0, parenIndex);
        }

        const codeUnescaped = fs.readFileSync(`${patternsDir}/${partPath}`, this.conf.enc);
        const recursionResults = this.mustacheRecurse(codeUnescaped);
        partials[part.n] = recursionResults.codeEscaped;
        partialsComp[part.n] = recursionResults;

        Object.assign(partials, recursionResults.partials);
        Object.assign(partialsComp, recursionResults.partialsComp);
      }
    }

    const compilation = Feplet.generate(parseArr, codeEscaped, {delimiters});

    return {
      codeEscaped,
      compilation,
      parseArr,
      partials,
      partialsComp
    };
  }

  templateProcess(file, templatesDirDefault, templatesExtDefault) {
    const patternExtension = this.conf.ui.patternExtension;
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

    if (path.extname(file) === patternExtension) {
      const regex = new RegExp(patternExtension + '$');
      mustacheFile = file;
      ymlFile = file.replace(regex, '.yml');
    }

    try {
      stat = fs.statSync(mustacheFile);
    }
    catch /* istanbul ignore next */ {
      // Only process templates that actually exist.
      return;
    }

    try {
      stat1 = fs.statSync(ymlFile);
    }
    catch {} // eslint-disable-line no-empty

    // Return on stat fail. Exclude non-files.
    /* istanbul ignore if */
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
      catch /* istanbul ignore next */ {
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
        const {
          compilation,
          partials,
          partialsComp
        } = this.mustacheRecurse(fs.readFileSync(mustacheFile, this.conf.enc));
        const codeRecursed = compilation.render({}, partials, null, partialsComp);
        // Iterate through tokens and replace keys for values in the code.
        const codeTranslated = this.tokensReplace(data, codeRecursed);
        // Write translated templates.
        const dest = this.templatesWrite(mustacheFile, srcDirParam, templatesDir, templatesExt, codeTranslated);

        let message = t('Template %s translated');
        message = message.replace('%s', '\x1b[36m' + dest.replace(this.rootDir, '').replace(/^\//, '') + '\x1b[0m');

        this.utils.log(message);
      }
      catch (err) /* istanbul ignore next */ {
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
        /* istanbul ignore if */
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
    // eslint-disable-next-line no-useless-escape
    dest = dest.replace(/\/_([^\/]+)$/, '/$1');
    dest = templatesDir + dest;
    dest = dest.replace(/\.mustache$/, templatesExt);

    // Write to file system.
    fs.ensureDirSync(path.dirname(dest));
    fs.outputFileSync(dest, code);

    return dest;
  }

  tokensReplace(tokens, codeParam) {
    const tokenKeys = Object.keys(tokens);

    let code = codeParam;
    let regex;
    let token;

    for (let tokenKey of tokenKeys) {
      regex = new RegExp('\\{\\{\\{?\\s*' + tokenKey + '\\s*\\}?\\}\\}', 'g');
      token = tokens[tokenKey].replace(/^\n/, '');
      token = token.replace(/\n$/, '');
      code = code.replace(regex, token);
    }

    // Delete remaining Mustache tags if configured to do so.
    if (!this.pref.templater.retain_mustache) {
      // eslint-disable-next-line no-useless-escape
      code = code.replace(/\{\{[^\(]*?(\([\S\s]*?\))?\s*\}?\}\}\s*\n?/g, '');
    }

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
