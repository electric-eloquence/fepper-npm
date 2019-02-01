/**
 * Adds the data appendix to data.json.
 *
 * Since the last property appended to data.json by json-compiler.js ends in a
 * comma, we need this operation to append to data.json in such a way that the
 * last property ends in a closing brace without a comma. This also compiles the
 * data from variables.styl into data.json so it shares its cross-everything
 * data with Pattern Lab as well.
 */
'use strict';

const fs = require('fs-extra');

module.exports = class {
  constructor(options) {
    this.conf = options.conf;
    this.utils = options.utils;
  }

  main() {
    const appendix = `${this.conf.ui.paths.source.data}/_appendix.json`;
    const varFile = `${this.conf.ui.paths.source.js}/src/variables.styl`;
    let jsonStr = '{\n';
    let vars;

    if (!fs.existsSync(varFile)) {
      return;
    }

    try {
      vars = fs.readFileSync(varFile, this.conf.enc);
    }
    catch (err) {
      this.utils.error(err);
      return;
    }

    const varsSplit = vars.split('\n');

    for (let i = 0; i < varsSplit.length; i++) {
      let varLine = varsSplit[i].trim();
      // Find index of the first equal sign.
      let indexOfEqual = varLine.indexOf('=');

      if (indexOfEqual > -1) {
        if (i > 0 && jsonStr !== '{\n') {
          jsonStr += ',\n';
        }
        let key = varLine.slice(0, indexOfEqual).trim();
        let value = varLine.slice(indexOfEqual + 1).trim();

        if (key) {
          jsonStr += `  "${key}": "${value}"`;
        }
      }
    }
    jsonStr += '\n}\n';

    try {
      // Write out to _appendix.json.
      fs.outputFileSync(appendix, jsonStr);
    }
    catch (err) {
      this.utils.error(err);
    }
  }
};
