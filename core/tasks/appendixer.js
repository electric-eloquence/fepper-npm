/**
 * Adds the data appendix to data.json.
 */
'use strict';

const fs = require('fs-extra');

module.exports = class {
  constructor(options) {
    this.options = options;
    this.conf = options.conf;
    this.utils = options.utils;
  }

  main() {
    const appendix = `${this.conf.ui.paths.source.data}/_appendix.json`;
    const varFile = `${this.conf.ui.paths.source.js}/src/variables.styl`;
    let jsonStr = '{\n';
    let vars;

    /* istanbul ignore if */
    if (!fs.existsSync(varFile)) {
      return;
    }

    try {
      vars = fs.readFileSync(varFile, this.conf.enc);
    }
    catch (err) /* istanbul ignore next */ {
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
          jsonStr += `  "${key}": `;

          if (value[0] === '"' && value.slice(-1) === '"') {
            jsonStr += value;
          }
          else {
            if (value[0] === '\'' && value.slice(-1) === '\'') {
              value = value.slice(1, -1);
            }

            jsonStr += `"${value}"`;
          }
        }
      }
    }

    jsonStr += '\n}\n';

    try {
      // Write out to _appendix.json.
      fs.outputFileSync(appendix, jsonStr);
    }
    catch (err) /* istanbul ignore next */ {
      this.utils.error(err);
    }
  }
};
