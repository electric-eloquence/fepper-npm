/**
 * Compiles partial JSON files into data.json.
 *
 * Source files:
 * - _data.json
 * - the partial JSON files in the _patterns directory
 * - _appendix.json
 */
'use strict';

const path = require('path');

const fs = require('fs-extra');
const diveSync = require('diveSync');

module.exports = class {
  constructor(options) {
    this.conf = options.conf;
    this.utils = options.utils;
  }

  main() {
    const dataDir = this.conf.ui.paths.source.data;
    const patternsDir = this.conf.ui.paths.source.patterns;
    const appendix = dataDir + '/_appendix.json';
    const dest = dataDir + '/data.json';
    const globals = dataDir + '/_data.json';
    let jsonStr = '';
    let tmp;

    if (!fs.existsSync(appendix) || !fs.existsSync(globals)) {
      return;
    }

    // Delete (optional) closing curly brace from _data.json.
    tmp = fs.readFileSync(globals, this.conf.enc);
    // Delete curly brace and any whitespace at end of file.
    tmp = tmp.replace(/\}\s*$/, '');
    tmp = tmp.replace(/\s*$/, '');
    jsonStr += tmp;

    // Only add comma if _data.json and _appendix.json have data.
    const globalsTest = fs.readJsonSync(globals, {throws: false});
    const appendixTest = fs.readJsonSync(appendix, {throws: false});

    for (let i in globalsTest) {
      if (globalsTest.hasOwnProperty(i)) {
        for (let j in appendixTest) {
          if (appendixTest.hasOwnProperty(j)) {
            jsonStr += ',';
            break;
          }
        }
        break;
      }
    }

    jsonStr += '\n';

    // Compile json partials from patterns directory.
    const extname = '.json';

    diveSync(
      patternsDir,
      (err, file) => {
        if (err) {
          this.utils.error(err);
        }

        const basename = path.basename(file);

        if (basename.charAt(0) !== '_' || basename.indexOf(extname) !== basename.length - extname.length) {
          return;
        }

        tmp = fs.readFileSync(file, this.conf.enc);
        // Delete curly brace and any whitespace at beginning of file.
        const openRegex = /^\s*\{/;

        if (openRegex.test(tmp)) {
          tmp = tmp.replace(openRegex, '');
          tmp = tmp.replace(/^\s*\n/, '');
          // Delete curly brace and any whitespace at end of file.
          tmp = tmp.replace(/\}\s*$/, '');
          tmp = tmp.replace(/\n\s*$/, '');
        }

        jsonStr += tmp + ',\n';
      }
    );

    // Delete (optional) opening curly brace from _appendix.json.
    tmp = fs.readFileSync(appendix, this.conf.enc);
    // Delete curly brace and any whitespace at beginning of file.
    tmp = tmp.replace(/^\s*\{/, '');
    tmp = tmp.replace(/^\s*\n/, '');
    jsonStr += tmp;

    // Write out to data.json.
    fs.writeFileSync(dest, jsonStr);
  }
};
