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

    // Validate that the data in _data.json are JSON5. Error if they aren't.
    try {
      const dataGlobalStr = fs.readFileSync(dataGlobal, this.conf.enc);
      dataGlobalJson = JSON5.parse(dataGlobalStr);
    }
    catch (err) /* istanbul ignore next */ {
      this.utils.error(`${t('ERROR')}: ${t('Missing or malformed %s!')}`, dataGlobal);
      this.utils.error(err);

      return;
    }

    const extname = '.json';

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

        let dataPartialJson = {};

        // Validate that the data in the partial are JSON5. Error if they aren't.
        try {
          const dataPartialStr = fs.readFileSync(file, this.conf.enc);
          dataPartialJson = JSON5.parse(dataPartialStr);
        }
        catch (err1) /* istanbul ignore next */ {
          this.utils.error(`${t('ERROR')}: ${t('Malformed %s')}`, file);
          this.utils.error(err1);

          return;
        }

        Object.assign(dataGlobalJson, dataPartialJson);
      }
    );

    const dataAppendix = `${dataDir}/_appendix.json`;
    let dataAppendixJson = {};

    // Validate that the data in _appendix.json are JSON5. Error if they aren't.
    if (fs.existsSync(dataAppendix)) {
      try {

        // Save contents of _appendix.json to append to data.json.
        const dataAppendixStr = fs.readFileSync(dataAppendix, this.conf.enc);
        dataAppendixJson = JSON5.parse(dataAppendixStr);
      }
      catch (err) /* istanbul ignore next */ {
        this.utils.error(`${t('ERROR')}: ${t('Malformed %s')}`, dataAppendix);
        this.utils.error(err);
      }
    }

    Object.assign(dataGlobalJson, dataAppendixJson);

    try {
      const dataFileSource = `${dataDir}/data.json`;
      // Backward compatible with patternlab-config.json before addition of this.conf.ui.paths.public.data (<= v0.38.2).
      let dataFilePublic = (this.conf.ui.paths.public.data || `${this.conf.ui.paths.public.root}/data`) + '/data.json';

      // Write to data.json.
      fs.outputJsonSync(dataFileSource, dataGlobalJson, {spaces: 2});
      fs.copySync(dataFileSource, dataFilePublic);
    }
    catch (err) /* istanbul ignore next */ {
      this.utils.error(err);

      return;
    }
  }
};
