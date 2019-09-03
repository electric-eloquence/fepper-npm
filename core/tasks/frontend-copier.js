'use strict';

const path = require('path');

const diveSync = require('diveSync');
const fs = require('fs-extra');
const slash = require('slash');
const yaml = require('js-yaml');

module.exports = class {
  constructor(options) {
    this.options = options;
    this.conf = options.conf;
    this.pref = options.pref;
    this.rootDir = options.rootDir;
    this.utils = options.utils;
  }

  mapPlNomenclature(frontendType) {
    let plName = frontendType;

    switch (frontendType) {
      case 'assets':
        plName = 'images';
        break;
      case 'scripts':
        plName = 'js';
        break;
      case 'styles':
        plName = 'css';
    }

    return plName;
  }

  srcDirGlob(frontendType) {
    const globbed = [];
    const nosyncStr = '/_nosync';
    const plName = this.mapPlNomenclature(frontendType);
    const srcDir = this.conf.ui.paths.source[plName];
    const srcDirBld = this.conf.ui.paths.source[`${plName}Bld`];

    // Using arrow syntax to allow `this` keyword within.
    const glob = (src) => {
      diveSync(
        src,
        {
          filter: (pathname) => {
            if (
              pathname.indexOf(`${nosyncStr}/`) > -1 ||
              pathname.slice(-nosyncStr.length) === nosyncStr
            ) {
              return false;
            }
            else {
              return true;
            }
          }
        },
        (err, file) => {
          /* istanbul ignore if */
          if (err) {
            this.utils.error(err);
          }

          const basename = path.basename(file);
          const indexOfDot = basename.indexOf('.');

          if (indexOfDot > 0 && indexOfDot < basename.length - 1) {
            globbed.push(slash(file));
          }
        }
      );
    };

    switch (frontendType) {
      case 'assets': {
        glob(srcDir);

        break;
      }
      case 'scripts': {
        // Traverse one level down before globbing.
        const level0 = srcDir;
        const basenamesAtLevel0 = fs.readdirSync(level0);

        // Choosing for...of loop and its readability in exchange for performance.
        for (let basenameAtLevel0 of basenamesAtLevel0) {
          try {
            const fileAtLevel0 = `${level0}/${basenameAtLevel0}`;
            const statAtLevel0 = fs.statSync(fileAtLevel0);

            if (statAtLevel0.isDirectory()) {
              glob(fileAtLevel0);
            }
          }
          catch (err) /* istanbul ignore next */ {
            this.utils.error(err);
          }
        }

        break;
      }
      case 'styles': {
        glob(srcDirBld);

        break;
      }
    }

    return globbed;
  }

  main(frontendType) {
    const frontendDataKey = `${frontendType}_dir`;
    const frontendDir = `_${frontendType}`;
    const regexExt = /\.[a-z]+$/;
    const sourceDir = this.conf.ui.paths.source.root;

    try {
      const targetDirDefault = this.utils.backendDirCheck(this.pref.backend.synced_dirs[frontendDataKey]);

      // Search source directory for frontend files.
      // Trying to keep the globbing simple and maintainable.
      const files = this.srcDirGlob(frontendType);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let stat;

        try {
          stat = fs.statSync(file);
        }
        catch (err) {
          // Fail gracefully.
        }

        // Exclude directories, files prefixed by __ or suffixed by .yml, and readme files.
        if (
          !stat ||
          !stat.isFile() ||
          path.basename(file).slice(0, 2) === '__' ||
          file.slice(-4) === '.yml' ||
          path.basename(file).replace(regexExt, '') === 'README'
        ) {
          continue;
        }

        let srcDir = sourceDir;
        let stat1;
        let targetDir;
        let ymlFile;

        // Check for file-specific YAML file.
        if (regexExt.test(file)) {
          ymlFile = file.replace(regexExt, '.yml');
        }

        // Read and process YAML file if it exists.
        try {
          stat1 = fs.statSync(ymlFile);
        }
        catch (err) {
          // Fail gracefully.
        }

        if (ymlFile && stat1 && stat1.isFile()) {
          try {
            const yml = fs.readFileSync(ymlFile, this.conf.enc);
            const data = yaml.safeLoad(yml);

            if (typeof data[frontendDataKey] === 'string') {
              targetDir = this.utils.backendDirCheck(data[frontendDataKey]);

              // Do not maintain nested directory structure in backend if
              // frontendDataKey is set in exceptional YAML file.
              if (targetDir) {
                srcDir = path.dirname(file);
              }
              else if (targetDirDefault) {
                srcDir += `/${frontendDir}`;
                targetDir = targetDirDefault;
              }

              // Unset templates_dir in local YAML data.
              delete data[frontendDataKey];
            }
          }
          catch (err) {
            // Fail gracefully.
          }
        }
        else {
          srcDir += `/${frontendDir}`;
        }

        if (!targetDir && targetDirDefault) {
          targetDir = targetDirDefault;
        }

        if (targetDir) {
          let targetFilePath;

          // Copy to targetDir.
          // If copying to default target, retain nested directory structure.
          if (targetDir === targetDirDefault) {
            targetFilePath = targetDir + '/' + file.replace(`${srcDir}/`, '');

            fs.copySync(file, targetFilePath);
          }
          else {
            targetFilePath = targetDir + '/' + path.basename(file);

            fs.copySync(file, targetFilePath);
          }

          this.utils.log(
            'Copied \x1b[36m%s\x1b[0m to \x1b[36m%s\x1b[0m.',
            file.replace(this.rootDir, '').replace(/^\//, ''),
            targetFilePath.replace(this.rootDir, '').replace(/^\//, '')
          );
        }
      }
    }
    catch (err) /* istanbul ignore next */ {
      this.utils.error(err);
    }
  }
};
