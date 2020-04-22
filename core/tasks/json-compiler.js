/**
 * Compiles partial JSON files into data.json. Maintains line breaks and indentation for readability of data.json.
 *
 * Source files:
 * - _data.json
 * - the partial JSON files in the _patterns directory
 * - _appendix.json
 */
'use strict';

const path = require('path');

const diveSync = require('diveSync');
const fs = require('fs-extra');
const JSON5 = require('json5');

let t;

module.exports = class {
  constructor(options) {
    this.options = options;
    this.conf = options.conf;
    this.utils = options.utils;

    t = this.utils.t;
  }

  main() {
    const dataDir = this.conf.ui.paths.source.data;
    const dataGlobal = `${dataDir}/_data.json`;
    let dataGlobalJson = {};
    let dataGlobalStr = '';
    let jsonStr = '';

    // Validate that the data in _data.json are JSON5. Error if they aren't.
    try {
      dataGlobalStr = fs.readFileSync(dataGlobal, this.conf.enc);
      dataGlobalJson = JSON5.parse(dataGlobalStr);
    }
    catch (err) /* istanbul ignore next */ {
      this.utils.error(`${t('ERROR:')} ${t('Missing or malformed')} ${dataGlobal}`);
      this.utils.error(err);

      return;
    }

    // If _data.json has valid data, delete the curly brace and any whitespace from the end of its string content.
    if (Object.keys(dataGlobalJson).length) {
      jsonStr += dataGlobalStr.replace(/\s*\}\s*$/, '');
    }

    // Else, start compiling the JSON5 with opening curly brace.
    else {
      jsonStr += '{';
    }

    const extname = '.json';
    let dataPartialRecursed = false;

    // Compile JSON5 partials from patterns directory.
    diveSync(
      this.conf.ui.paths.source.patterns,
      (err, file) => {
        /* istanbul ignore if */
        if (err) {
          this.utils.error(err);
        }

        const basename = path.basename(file);

        if (basename.charAt(0) !== '_' || basename.slice(-extname.length) !== extname) {
          return;
        }

        const dataPartialStr = fs.readFileSync(file, this.conf.enc);

        // Validate that the data in the partial are JSON5. Error if they aren't.
        try {
          JSON5.parse(dataPartialStr);
        }
        catch (err1) /* istanbul ignore next */ {
          this.utils.error(`${t('ERROR:')} ${t('Malformed')} ${file}`);
          this.utils.error(err1);

          return;
        }

        let tmp = '';

        if (dataPartialRecursed) {
          tmp += ',';
        }
        else {
          if (Object.keys(dataGlobalJson).length) {
            tmp += ',';
          }

          dataPartialRecursed = true;
        }

        // Delete curly brace and any whitespace at beginning of file.
        tmp += dataPartialStr.replace(/^\s*\{/, '');
        tmp = tmp.replace(/^\s*\n/, '');

        // Delete curly brace and any whitespace at end of file.
        tmp = tmp.replace(/\s*\}\s*$/, '');

        jsonStr += tmp;
      }
    );

    const dataAppendix = `${dataDir}/_appendix.json`;
    let dataAppendixStr;
    let dataAppendixJson;

    // Validate that the data in _appendix.json are JSON5. Error if they aren't.
    if (fs.existsSync(dataAppendix)) {
      try {

        // Save contents of _appendix.json to append to data.json.
        dataAppendixStr = fs.readFileSync(dataAppendix, this.conf.enc);
        dataAppendixJson = JSON5.parse(dataAppendixStr);
      }
      catch (err) /* istanbul ignore next */ {
        this.utils.error(`${t('ERROR:')} ${t('Malformed')} ${dataAppendix}`);
        this.utils.error(err);
      }
    }

    if (dataAppendixJson instanceof Object && Object.keys(dataAppendixJson).length) {
      let tmp = dataAppendixStr;

      // Delete curly brace and any whitespace at beginning of _appendix.json.
      tmp = tmp.replace(/^\s*\{/, '');
      tmp = tmp.replace(/^\s*\n/, '');

      if (Object.keys(dataGlobalJson).length || dataPartialRecursed) {
        jsonStr += ',\n' + tmp;
      }
    }
    else {
      jsonStr += '\n}\n';
    }

    try {
      // Write to data.json.
      fs.outputFileSync(`${dataDir}/data.json`, jsonStr);
    }
    catch (err) /* istanbul ignore next */ {
      this.utils.error(err);

      return;
    }
  }
};
