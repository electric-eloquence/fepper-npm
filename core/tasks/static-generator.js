'use strict';

const beautify = require('js-beautify').html;
const diveSync = require('diveSync');
const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');
const RcLoader = require('rcloader');

const utils = require('../lib/utils');

const conf = global.conf;
const pref = global.pref;
const workDir = global.workDir;

const patternsDir = utils.pathResolve(conf.ui.paths.public.patterns);
const sourceDir = utils.pathResolve(conf.ui.paths.public.root);
const staticDir = utils.pathResolve(conf.ui.paths.source.static);

const assetsDir = utils.pathResolve(conf.ui.paths.public.images);
const assetsSuffix = assetsDir.replace(`${sourceDir}/`, '');
const scriptsDir = utils.pathResolve(conf.ui.paths.public.js);
const scriptsSuffix = scriptsDir.replace(`${sourceDir}/`, '');
const stylesDir = utils.pathResolve(conf.ui.paths.public.css);
const stylesSuffix = stylesDir.replace(`${sourceDir}/`, '');

exports.assetsDirCopy = function () {
  fs.copySync(assetsDir, `${staticDir}/${assetsSuffix}`);
};

exports.pagesDelete = function () {
  // Unlink symbolic links.
  diveSync(
    staticDir,
    {
      directories: true
    },
    function (err, file) {
      if (err) {
        throw err;
      }

      if (path.extname(file) === '.html') {
        fs.unlinkSync(file);
      }
    }
  );
};

exports.npmsCopy = function () {
  const npmsSrc = `${sourceDir}/node_modules`;
  const npmsDest = `${staticDir}/node_modules`;
  const tmpStr = fs.readFileSync(`${staticDir}/index.html`, conf.enc);

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
      function (err, file) {
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
};

exports.scriptsDirCopy = function () {
  diveSync(
    scriptsDir,
    {
      recursive: false,
      directories: true,
      filter: function (path, dir) {
        return dir;
      }
    },
    function (err, file) {
      if (err) {
        throw err;
      }

      const suffix = file.replace(`${sourceDir}/`, '');

      fs.copySync(file, `${staticDir}/${suffix}`);
    }
  );
};

exports.stylesDirCopy = function () {
  fs.copySync(stylesDir, `${staticDir}/${stylesSuffix}`);
};

exports.pagesCompile = function () {
  const dataJson = utils.data();
  const files = [];

  const srcPages = path.normalize(conf.ui.paths.source.pages);
  const srcPatterns = `${path.normalize(conf.ui.paths.source.patterns)}/`;
  const pagesPrefix = path.normalize(srcPages.replace(srcPatterns, ''));

  // Load js-beautify with options configured in .jsbeautifyrc
  const rcLoader = new RcLoader('.jsbeautifyrc', {});
  const rcOpts = rcLoader.for(workDir, {lookup: true});

  // Glob page files in public/patterns.
  const dirs = glob.sync(`${patternsDir}/${pagesPrefix}-*`);

  for (let i = 0; i < dirs.length; i++) {
    const tmpArr = glob.sync(dirs[i] + '/*');

    for (let j = 0; j < tmpArr.length; j++) {
      files.push(tmpArr[j]);
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
      let tmpStr = fs.readFileSync(f, conf.enc);

      // Strip Pattern Lab css and js.
      // eslint-disable-next-line max-len
      regexStr = '\\s*<!\\-\\- Begin Pattern Lab \\(Required for Pattern Lab to run properly\\) \\-\\->[\\S\\s]*?<!\\-\\- End Pattern Lab \\-\\->\\s*';
      regex = new RegExp(regexStr, 'g');
      tmpStr = tmpStr.replace(regex, '');

      // Strip pattern-configurer.js script tag.
      regexStr = '\\s*<script src="../../node_modules/fepper-ui/scripts/pattern-configurer.js.*?</script>\\s*';
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
      regexStr += utils.escapeReservedRegexChars(pagesPrefix + '-');
      regex = new RegExp(regexStr, 'g');
      tmpStr = tmpStr.replace(regex, '$1"');

      regexStr = '(href\\s*=\\s*)\'[^\']*(/|&#x2F;)';
      regex = utils.escapeReservedRegexChars(pagesPrefix + '-');
      regex = new RegExp(regexStr, 'g');
      tmpStr = tmpStr.replace(regex, '$1\'');

      // Load .jsbeautifyrc and beautify html
      tmpStr = beautify(tmpStr, rcOpts) + '\n';

      // Copy homepage to index.html.
      if (dataJson.homepage && f.indexOf(`${dataJson.homepage}.html`) === (f.length - dataJson.homepage.length - 5)) {
        fs.writeFileSync(`${staticDir}/index.html`, tmpStr);
      }
      else {
        regexStr = '^.*\\/';
        regexStr += utils.escapeReservedRegexChars(pagesPrefix + '-');
        regex = new RegExp(regexStr);

        fs.writeFileSync(`${staticDir}/${f.replace(regex, '')}`, tmpStr);
      }
    }
  }
};

exports.main = function () {
  let webservedDirsFull;
  let webservedDirsShort;

  // Delete old assets, scripts, styles in static dir. Then, recreate them.
  fs.removeSync(`${staticDir}/${assetsSuffix}`);
  fs.removeSync(`${staticDir}/${scriptsSuffix}`);
  fs.removeSync(`${staticDir}/${stylesSuffix}`);
  fs.mkdirSync(`${staticDir}/${assetsSuffix}`);
  fs.mkdirSync(`${staticDir}/${scriptsSuffix}`);
  fs.mkdirSync(`${staticDir}/${stylesSuffix}`);

  // Copy assets, scripts, styles directories.
  exports.assetsDirCopy();
  exports.scriptsDirCopy();
  exports.stylesDirCopy();

  // Delete old pages.
  exports.pagesDelete();

  // Copy pages directory.
  exports.pagesCompile();

  // Copy npms if necessary.
  exports.npmsCopy();

  // Copy webserved directories.
  if (Array.isArray(pref.backend.webserved_dirs)) {
    webservedDirsFull = pref.backend.webserved_dirs;
  }

  if (webservedDirsFull) {
    webservedDirsShort = utils.webservedDirnamesTruncate(webservedDirsFull);
    utils.webservedDirsCopy(webservedDirsFull, webservedDirsShort, staticDir);
  }
};
