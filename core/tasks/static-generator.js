'use strict';

const path = require('path');

const beautify = require('js-beautify').html;
const diveSync = require('diveSync');
const fs = require('fs-extra');
const RcLoader = require('rcloader');

module.exports = class {
  constructor(options) {
    this.conf = options.conf;
    this.rootDir = options.rootDir;
    this.utils = options.utils;

    this.assetsDir = this.conf.ui.paths.public.images;
    this.patternsDir = this.conf.ui.paths.public.patterns;
    this.scriptsDir = this.conf.ui.paths.public.js;
    this.sourceDir = this.conf.ui.paths.public.root;
    this.staticDir = this.conf.ui.paths.source.static;
    this.stylesDir = this.conf.ui.paths.public.css;

    this.assetsSuffix = this.assetsDir.replace(`${this.sourceDir}/`, '');
    this.scriptsSuffix = this.scriptsDir.replace(`${this.sourceDir}/`, '');
    this.stylesSuffix = this.stylesDir.replace(`${this.sourceDir}/`, '');
  }

  assetsDirCopy() {
    fs.copySync(this.assetsDir, `${this.staticDir}/${this.assetsSuffix}`);
  }

  pagesDelete() {
    // Unlink symbolic links.
    diveSync(
      this.staticDir,
      {
        directories: true
      },
      (err, file) => {
        if (err) {
          throw err;
        }

        if (path.extname(file) === '.html') {
          fs.unlinkSync(file);
        }
      }
    );
  }

  npmsCopy() {
    const npmsSrc = `${this.sourceDir}/node_modules`;
    const npmsDest = `${this.staticDir}/node_modules`;
    const tmpStr = fs.readFileSync(`${this.staticDir}/index.html`, this.conf.enc);

    if (/<script[^>]+src="node_modules/.test(tmpStr)) {
      // Replace old node_modules dir with new.
      fs.removeSync(npmsDest);
      fs.copySync(npmsSrc, npmsDest);

      // Unlink symbolic links.
      diveSync(
        npmsDest,
        {
          all: true
        },
        (err, file) => {
          if (err) {
            throw err;
          }

          const stat = fs.lstatSync(file);

          if (stat.isSymbolicLink()) {
            fs.unlinkSync(file);
          }
        }
      );
    }
  }

  scriptsDirCopy() {
    const staticGenerator = this;

    diveSync(
      this.scriptsDir,
      {
        recursive: false,
        directories: true,
        filter: (path, dir) => {
          return dir;
        }
      },
      (err, file) => {
        if (err) {
          throw err;
        }

        const suffix = file.replace(`${staticGenerator.sourceDir}/`, '');

        fs.copySync(file, `${staticGenerator.staticDir}/${suffix}`);
      }
    );
  }

  stylesDirCopy() {
    fs.copySync(this.stylesDir, `${this.staticDir}/${this.stylesSuffix}`);
  }

  pagesCompile() {
    const dataJson = this.utils.data();
    const files = [];

    const srcPages = this.conf.ui.paths.source.pages;
    const srcPatterns = `${this.conf.ui.paths.source.patterns}/`;
    const pagesPrefix = srcPages.replace(srcPatterns, '');

    // Load js-beautify with options configured in .jsbeautifyrc
    const rcLoader = new RcLoader('.jsbeautifyrc', {});
    const rcOpts = rcLoader.for(this.rootDir, {lookup: true});

    // Resorting to this long, rather unreadable block of code to obviate requiring the large glob NPM.
    // Require scripts ending in "~extend.js" at Level 1 and Level 2 below the "extend" directory.
    // Choosing for...of loops and their readability in exchange for performance.

    // Level 0 declarations.
    const dirsAtLevel0 = [];
    const level0 = this.patternsDir;
    const basenamesAtLevel0 = fs.readdirSync(level0);

    for (let basenameAtLevel0 of basenamesAtLevel0) {
      try {
        const fileAtLevel0 = `${level0}/${basenameAtLevel0}`;
        const statAtLevel0 = fs.statSync(fileAtLevel0);

        if (statAtLevel0.isDirectory() && basenameAtLevel0.indexOf(`${pagesPrefix}-`) === 0) {
          dirsAtLevel0.push(fileAtLevel0);
        }
      }
      catch (err) {
        this.utils.error(err);
      }
    }

    for (let dirAtLevel0 of dirsAtLevel0) {
      // Level 1 declarations.
      const basenamesAtLevel1 = fs.readdirSync(dirAtLevel0);

      for (let basenameAtLevel1 of basenamesAtLevel1) {
        try {
          const fileAtLevel1 = `${dirAtLevel0}/${basenameAtLevel1}`;
          const statAtLevel1 = fs.statSync(fileAtLevel1);

          if (statAtLevel1.isFile()) {
            files.push(fileAtLevel1);
          }
        }
        catch (err) {
          this.utils.error(err);
        }
      }
    }

    for (let i = 0; i < files.length; i++) {
      const f = files[i];

      if (
        (f.indexOf('html') === f.length - 4) &&
        (f.indexOf('markup-only.html') !== f.length - 16) &&
        path.basename(f) !== 'index.html'
      ) {
        let regex;
        let regexStr;
        let tmpStr = fs.readFileSync(f, this.conf.enc);

        // Strip Pattern Lab css and js.
        // eslint-disable-next-line max-len
        regexStr = '\\s*<!\\-\\- Begin Pattern Lab \\(Required for Pattern Lab to run properly\\) \\-\\->[\\S\\s]*?<!\\-\\- End Pattern Lab \\-\\->\\s*';
        regex = new RegExp(regexStr, 'g');
        tmpStr = tmpStr.replace(regex, '');

        // Strip cacheBuster params.
        tmpStr = tmpStr.replace(/((href|src)="[^"]*)\?\d*"/g, '$1"');

        // Fix paths.
        tmpStr = tmpStr.replace(/(href|src)\s*=\s*("|')..\/..\//g, '$1=$2');

        // Replace homepage filename with "index.html"
        if (dataJson.homepage) {
          let homepageRegex = new RegExp('(href\\s*=\\s*)"[^"]*(\\/|&#x2F;)' + dataJson.homepage, 'g');
          tmpStr = tmpStr.replace(homepageRegex, '$1"index');

          homepageRegex = new RegExp('(href\\s*=\\s*)\'[^\']*(\\/|&#x2F;)' + dataJson.homepage, 'g');
          tmpStr = tmpStr.replace(homepageRegex, '$1\'index');
        }

        // Strip prefix from remaining page filenames.
        regexStr = '(href\\s*=\\s*)"[^"]*(/|&#x2F;)';
        regexStr += this.utils.regexReservedCharsEscape(pagesPrefix + '-');
        regex = new RegExp(regexStr, 'g');
        tmpStr = tmpStr.replace(regex, '$1"');

        regexStr = '(href\\s*=\\s*)\'[^\']*(/|&#x2F;)';
        regex = this.utils.regexReservedCharsEscape(pagesPrefix + '-');
        regex = new RegExp(regexStr, 'g');
        tmpStr = tmpStr.replace(regex, '$1\'');

        // Load .jsbeautifyrc and beautify html.
        tmpStr = beautify(tmpStr, rcOpts) + '\n';

        // Copy homepage to index.html.
        if (dataJson.homepage && f.indexOf(`${dataJson.homepage}.html`) === (f.length - dataJson.homepage.length - 5)) {
          fs.writeFileSync(`${this.staticDir}/index.html`, tmpStr);
        }
        else {
          regexStr = '^.*\\/';
          regexStr += this.utils.regexReservedCharsEscape(pagesPrefix + '-');
          regex = new RegExp(regexStr);

          fs.writeFileSync(`${this.staticDir}/${f.replace(regex, '')}`, tmpStr);
        }
      }
    }
  }

  main() {
    let webservedDirsFull;
    let webservedDirsShort;

    // Delete old assets, scripts, styles in static dir. Then, recreate them.
    fs.removeSync(`${this.staticDir}/${this.assetsSuffix}`);
    fs.removeSync(`${this.staticDir}/${this.scriptsSuffix}`);
    fs.removeSync(`${this.staticDir}/${this.stylesSuffix}`);
    fs.mkdirSync(`${this.staticDir}/${this.assetsSuffix}`);
    fs.mkdirSync(`${this.staticDir}/${this.scriptsSuffix}`);
    fs.mkdirSync(`${this.staticDir}/${this.stylesSuffix}`);

    // Copy assets, scripts, styles directories.
    this.assetsDirCopy();
    this.scriptsDirCopy();
    this.stylesDirCopy();

    // Delete old pages.
    this.pagesDelete();

    // Copy pages directory.
    this.pagesCompile();

    // Copy npms if necessary.
    this.npmsCopy();

    // Copy webserved directories.
    if (Array.isArray(this.pref.backend.webserved_dirs)) {
      webservedDirsFull = this.pref.backend.webserved_dirs;
    }

    if (webservedDirsFull) {
      webservedDirsShort = this.utils.webservedDirnamesTruncate(webservedDirsFull);
      this.utils.webservedDirsCopy(webservedDirsFull, webservedDirsShort, this.staticDir);
    }
  }
};
