'use strict';

const path = require('path');

const beautify = require('js-beautify').html;
const diveSync = require('diveSync');
const fs = require('fs-extra');
const RcLoader = require('rcloader');

module.exports = class {
  constructor(options) {
    this.conf = options.conf;
    this.pref = options.pref;
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

    this.pagesPrefix = this.conf.ui.paths.source.pages.replace(`${this.conf.ui.paths.source.patterns}/`, '');
  }

  generatePages() {
    const files = [];

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

        if (statAtLevel0.isDirectory() && basenameAtLevel0.indexOf(`${this.pagesPrefix}-`) === 0) {
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
        f.slice(-5) === '.html' &&
        f.slice(-17) !== '.markup-only.html' &&
        path.basename(f) !== 'index.html'
      ) {
        const dataJson = this.utils.data();
        let regex;
        let regexStr;
        let tmpStr = fs.readFileSync(f, this.conf.enc);

        // Strip Pattern Lab css and js.
        // eslint-disable-next-line max-len
        regexStr = '\\s*<!\\-\\- Begin Pattern Lab \\(Required for Pattern Lab to run properly\\) \\-\\->[\\S\\s]*?<!\\-\\- End Pattern Lab \\-\\->\\s*';
        regex = new RegExp(regexStr, 'g');
        tmpStr = tmpStr.replace(regex, '');

        tmpStr = this.convertCacheBusters(tmpStr);
        tmpStr = this.convertPaths(tmpStr);
        tmpStr = this.convertLinksHomepage(tmpStr, dataJson.homepage);
        tmpStr = this.convertLinksSibling(tmpStr);

        // Load .jsbeautifyrc and beautify html.
        tmpStr = beautify(tmpStr, rcOpts) + '\n';

        try {
          // Copy homepage to index.html.
          if (
            dataJson.homepage &&
            f.slice(-(`${dataJson.homepage}.html`.length)) === `${dataJson.homepage}.html`
          ) {

            fs.outputFileSync(`${this.staticDir}/index.html`, tmpStr);
          }
          else {
            regexStr = '^.*\\/';
            regexStr += this.utils.regexReservedCharsEscape(this.pagesPrefix + '-');
            regex = new RegExp(regexStr);

            fs.outputFileSync(`${this.staticDir}/${f.replace(regex, '')}`, tmpStr);
          }
        }
        catch (err) {
          this.utils.error(err);
        }
      }
    }
  }

  // Strip cacheBuster params. Using the "convert" naming convention for consistency.
  convertCacheBusters(content_) {
    let content = content_;

    content = content.replace(/((href|src)\s*=\s*"[^"]*)\?\d*/gi, '$1');
    content = content.replace(/((href|src)\s*=\s*'[^']*)\?\d*/gi, '$1');

    return content;
  }

  convertPaths(content) {
    return content.replace(/(href|src)\s*=\s*("|')..\/..\//gi, '$1=$2');
  }

  convertLinksHomepage(content_, homepage) {
    let content = content_;

    if (homepage) {
      let homepageRegex = new RegExp('(href\\s*=\\s*)"[^"]*\\/' + homepage, 'gi');
      content = content.replace(homepageRegex, '$1"index');

      homepageRegex = new RegExp('(href\\s*=\\s*)\'[^\']*\\/' + homepage, 'gi');
      content = content.replace(homepageRegex, '$1\'index');
    }

    return content;
  }

  convertLinksSibling(content_) {
    let content = content_;

    let regexStr = '(href\\s*=\\s*)"[^"]*\\/';
    regexStr += this.utils.regexReservedCharsEscape(this.pagesPrefix + '-');
    const regex = new RegExp(regexStr, 'gi');
    content = content.replace(regex, '$1"');

    let regexStr1 = '(href\\s*=\\s*)\'[^\']*\\/';
    regexStr1 += this.utils.regexReservedCharsEscape(this.pagesPrefix + '-');
    const regex1 = new RegExp(regexStr1, 'gi');
    content = content.replace(regex1, '$1\'');

    return content;
  }

  copyAssetsDir() {
    fs.copySync(this.assetsDir, `${this.staticDir}/${this.assetsSuffix}`);
  }

  copyNpms() {
    const npmsSrc = `${this.sourceDir}/node_modules`;
    const npmsDest = `${this.staticDir}/node_modules`;
    let tmpStr;

    try {
      tmpStr = fs.readFileSync(`${this.staticDir}/index.html`, this.conf.enc);
    }
    catch (err) {
      this.utils.error(err);
      return;
    }

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

  copyScriptsDir() {
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

        try {
          const suffix = file.replace(`${this.sourceDir}/`, '');

          fs.copySync(file, `${this.staticDir}/${suffix}`);
        }
        catch (err1) {
          throw err1;
        }
      }
    );
  }

  copyStylesDir() {
    fs.copySync(this.stylesDir, `${this.staticDir}/${this.stylesSuffix}`);
  }

  deletePages() {
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
          fs.removeSync(file);
        }
      }
    );
  }

  main() {
    let webservedDirsFull;
    let webservedDirsShort;

    try {
      // Delete old assets, scripts, styles in static dir. Then, recreate the directories.
      fs.removeSync(`${this.staticDir}/${this.assetsSuffix}`);
      fs.removeSync(`${this.staticDir}/${this.scriptsSuffix}`);
      fs.removeSync(`${this.staticDir}/${this.stylesSuffix}`);
      fs.ensureDirSync(`${this.staticDir}/${this.assetsSuffix}`);
      fs.ensureDirSync(`${this.staticDir}/${this.scriptsSuffix}`);
      fs.ensureDirSync(`${this.staticDir}/${this.stylesSuffix}`);

      // Copy assets, scripts, styles directories.
      this.copyAssetsDir();
      this.copyScriptsDir();
      this.copyStylesDir();
    }
    catch (err) {
      this.utils.error(err);
      return;
    }

    // Delete old static site pages.
    this.deletePages();

    // Generate new static site pages.
    this.generatePages();

    // Copy npms if necessary.
    this.copyNpms();

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
