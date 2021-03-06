'use strict';

const diveSync = require('diveSync');
const fs = require('fs-extra');

module.exports = class {
  #ui;

  constructor(options, ui) {
    this.#ui = ui;

    this.options = options;
    this.appDir = options.appDir;
    this.conf = options.conf;
    this.pref = options.pref;
    this.rootDir = options.rootDir;
    this.utils = options.utils;

    this.assetsPublic = this.conf.ui.paths.public.images;
    this.patternsPublic = this.conf.ui.paths.public.patterns;
    this.scriptsPublic = this.conf.ui.paths.public.js;
    this.rootPublic = this.conf.ui.paths.public.root;
    this.staticPublic = this.conf.ui.paths.public.static;
    this.staticSource = this.conf.ui.paths.source.static;
    this.stylesPublic = this.conf.ui.paths.public.css;

    this.assetsRelative = this.assetsPublic.replace(`${this.rootPublic}/`, '');
    this.scriptsRelative = this.scriptsPublic.replace(`${this.rootPublic}/`, '');
    this.stylesRelative = this.stylesPublic.replace(`${this.rootPublic}/`, '');

    this.pagesPrefix = this.conf.ui.paths.source.pages.replace(`${this.conf.ui.paths.source.patterns}/`, '');
  }

  get patternlab() {
    return this.#ui.patternlab;
  }

  generatePages() {
    const files = [];

    // Resorting to this long, rather unreadable block of code to obviate requiring the large glob npm.
    // Choosing for...of loops and their readability in exchange for performance.

    // Level 0 declarations.
    const dirsAtLevel0 = [];
    const level0 = this.patternsPublic;
    const basenamesAtLevel0 = fs.readdirSync(level0);

    for (const basenameAtLevel0 of basenamesAtLevel0) {
      try {
        const fileAtLevel0 = `${level0}/${basenameAtLevel0}`;
        const statAtLevel0 = fs.statSync(fileAtLevel0);

        if (statAtLevel0.isDirectory() && basenameAtLevel0.indexOf(`${this.pagesPrefix}-`) === 0) {
          dirsAtLevel0.push(fileAtLevel0);
        }
      }
      catch (err) /* istanbul ignore next */ {
        this.utils.error(err);
      }
    }

    for (const dirAtLevel0 of dirsAtLevel0) {
      // Level 1 declarations.
      const basenamesAtLevel1 = fs.readdirSync(dirAtLevel0);

      for (const basenameAtLevel1 of basenamesAtLevel1) {
        try {
          const fileAtLevel1 = `${dirAtLevel0}/${basenameAtLevel1}`;
          const statAtLevel1 = fs.statSync(fileAtLevel1);

          if (statAtLevel1.isFile()) {
            files.push(fileAtLevel1);
          }
        }
        catch (err) /* istanbul ignore next */ {
          this.utils.error(err);
        }
      }
    }

    const homepagePattern = this.patternlab.getPattern(this.conf.ui.defaultPattern);
    const homepageLink = homepagePattern ? (homepagePattern.patternLink || '') : '';
    const outfileExtension = this.conf.ui.outfileExtension;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (
        file.endsWith(outfileExtension) &&
        !file.endsWith('.markup-only' + outfileExtension) &&
        !file.endsWith('index.html') // Thus far, "index.html" is always hard-coded as is (not with outfileExtension).
      ) {
        let regex;
        let regexStr;
        let tmpStr = fs.readFileSync(file, this.conf.enc);

        // Strip Pattern Lab css and js.
        // eslint-disable-next-line max-len
        regexStr = '\\s*<!\\-\\- Begin Pattern Lab \\(Required for Pattern Lab to run properly\\) \\-\\->[\\S\\s]*?<!\\-\\- End Pattern Lab \\-\\->\\s*';
        regex = new RegExp(regexStr, 'g');
        tmpStr = tmpStr.replace(regex, '');

        tmpStr = this.convertCacheBusters(tmpStr);
        tmpStr = this.convertPaths(tmpStr);
        tmpStr = this.convertHomepageLinks(tmpStr, homepageLink);
        tmpStr = this.convertLinksSibling(tmpStr);
        tmpStr = this.utils.beautifyTemplate(tmpStr);

        try {
          // Copy homepage to index.html.
          if (homepageLink && file.endsWith(homepageLink)
          ) {
            fs.outputFileSync(`${this.staticSource}/index.html`, tmpStr);
          }
          else {
            let outfilePath;

            for (let i = 0; i < this.patternlab.ingredients.patterns.length; i++) {
              const pattern = this.patternlab.ingredients.patterns[i];

              if (file.includes(pattern.patternLink)) {
                const pathParts = pattern.relPathTrunc.split('/').slice(1);

                if (pathParts.length) {
                  outfilePath = pathParts
                    .map(pathPart => pathPart.replace(/^\d+-/, '').replace(/~/g, '-'))
                    .join('-')
                    + outfileExtension;

                  break;
                }
              }
            }

            if (outfilePath) {
              fs.outputFileSync(`${this.staticSource}/${outfilePath}`, tmpStr);
            }
          }
        }
        catch (err) /* istanbul ignore next */ {
          this.utils.error(err);
        }
      }
    }
  }

  // Strip cacheBuster params. Using the "convert" naming convention for consistency.
  convertCacheBusters(content_) {
    let content = content_;

    content = content.replace(/((href|src)\s*=\s*"[^"]*)\?\d+/gi, '$1');
    content = content.replace(/((href|src)\s*=\s*'[^']*)\?\d+/gi, '$1');

    return content;
  }

  convertPaths(content) {
    return content.replace(/(href|src)\s*=\s*("|')..\/..\//gi, '$1=$2');
  }

  convertHomepageLinks(content_, homepageLink) {
    let content = content_;

    if (homepageLink && content.includes(homepageLink)) {
      const homepageRegex = new RegExp('(href=")\\.\\.\\/' + homepageLink, 'gi');
      content = content.replace(homepageRegex, '$1index.html');
    }

    return content;
  }

  convertLinksSibling(content_) {
    const outfileExtension = this.conf.ui.outfileExtension;
    const content = this.patternlab.ingredients.patterns.reduce((acc_, cur) => {
      let acc = acc_;

      if (acc.includes(cur.patternLink)) {
        const pathParts = cur.relPathTrunc.split('/').slice(1);
        let pathNew;

        /* istanbul ignore else */
        if (pathParts.length) {
          pathNew = pathParts
            .map(pathPart => pathPart.replace(/^\d+-/, '').replace(/~/g, '-'))
            .join('-')
            + outfileExtension;
        }
        else {
          return acc;
        }

        const regex = new RegExp('(href=")\\.\\.\\/' + cur.patternLink, 'g');
        acc = acc.replace(regex, '$1' + pathNew);
      }

      return acc;
    }, content_);

    return content;
  }

  copyAssetsDir() {
    fs.copySync(this.assetsPublic, `${this.staticSource}/${this.assetsRelative}`);
  }

  copyNpms() {
    const npmsSrc = `${this.rootPublic}/node_modules`;
    const npmsDest = `${this.staticSource}/node_modules`;
    let tmpStr;

    try {
      tmpStr = fs.readFileSync(`${this.staticSource}/index.html`, this.conf.enc);
    }
    catch (err) /* istanbul ignore next */ {
      this.utils.error(err);

      return;
    }

    if (/<script[^>]+src="[^>]*node_modules/.test(tmpStr)) {
      // Replace old node_modules dir with new.
      fs.removeSync(npmsDest);
      fs.copySync(npmsSrc, npmsDest);

      // Unlink symbolic links.
      diveSync(
        npmsDest,
        {all: true},
        (err, file) => {
          /* istanbul ignore if */
          if (err) {
            this.utils.error(err);
          }

          const stat = fs.lstatSync(file);

          if (stat.isSymbolicLink()) {
            fs.unlinkSync(file);
          }
        }
      );
    }
  }

  copyScriptsDir() {
    diveSync(
      this.scriptsPublic,
      {
        recursive: false,
        directories: true,
        filter: (path, dir) => {
          return dir;
        }
      },
      (err, file) => {
        /* istanbul ignore if */
        if (err) {
          this.utils.error(err);
        }

        try {
          const suffix = file.replace(`${this.rootPublic}/`, '');

          fs.copySync(file, `${this.staticSource}/${suffix}`);
        }
        catch (err1) /* istanbul ignore next */ {
          this.utils.error(err1);
        }
      }
    );
  }

  copyStylesDir() {
    fs.copySync(this.stylesPublic, `${this.staticSource}/${this.stylesRelative}`);
  }

  deletePages() {
    const outfileExtension = this.conf.ui.outfileExtension;

    fs.ensureDirSync(this.staticPublic);
    diveSync(
      this.staticPublic,
      {
        directories: true
      },
      (err, file) => {
        /* istanbul ignore if */
        if (err) {
          this.utils.error(err);
        }

        if (file.endsWith(outfileExtension)) {
          fs.removeSync(file);
        }
      }
    );
  }

  main() {
    // Delete old static public html pages.
    this.deletePages();

    // Delete old assets, scripts, styles in static public dir.
    fs.emptyDirSync(`${this.staticPublic}/${this.assetsRelative}`);
    fs.emptyDirSync(`${this.staticPublic}/${this.scriptsRelative}`);
    fs.emptyDirSync(`${this.staticPublic}/${this.stylesRelative}`);

    try {
      // Copy assets, scripts, styles directories to static source dir.
      this.copyAssetsDir();
      this.copyScriptsDir();
      this.copyStylesDir();
    }
    catch (err) /* istanbul ignore next */ {
      this.utils.error(err);

      return;
    }

    // Generate new static site pages.
    this.generatePages();

    // Copy npms if necessary.
    this.copyNpms();

    // Copy webserved directories.
    const webservedDirsFull = this.pref.backend.webserved_dirs;

    if (Array.isArray(webservedDirsFull)) {
      const webservedDirsShort = this.utils.webservedDirnamesTruncate(webservedDirsFull);

      this.utils.webservedDirsCopy(webservedDirsFull, webservedDirsShort, this.staticSource);
    }
  }
};
