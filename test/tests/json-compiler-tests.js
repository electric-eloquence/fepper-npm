'use strict';

const path = require('path');

const diveSync = require('diveSync');
const expect = require('chai').expect;
const fs = require('fs-extra');

require('../init');

const fepper = global.fepper;
const conf = fepper.conf;
const jsonCompiler = fepper.tasks.jsonCompiler;
const utils = fepper.utils;

const appendixFile = `${conf.ui.paths.source.data}/_appendix.json`;
const dataFile = `${conf.ui.paths.source.data}/data.json`;

describe('JSON Compiler', function () {
  // Clear out data.json.
  fs.writeFileSync(dataFile, '');

  // Get empty string for comparison.
  const dataBefore = fs.readFileSync(dataFile, conf.enc);

  // Run json-compiler.js.
  jsonCompiler.main(conf.ui.paths.source.root);

  // Get json-compiler.js output.
  const dataAfter = fs.readFileSync(dataFile, conf.enc);

  // Test valid JSON.
  let dataJson;

  try {
    dataJson = JSON.parse(dataAfter);
  }
  catch (err) {
    // Fail gracefully.
  }

  function stripBraces(jsonStr_) {
    let jsonStr = jsonStr_;
    jsonStr = jsonStr.replace(/^\s*{\s*/, '');
    jsonStr = jsonStr.replace(/\s*}\s*$/, '');

    return jsonStr;
  }

  it('should overwrite data.json', function () {
    expect(dataBefore).to.equal('');
    expect(dataAfter).to.not.equal(dataBefore);
  });

  it('should compile valid JSON to data.json', function () {
    expect(dataJson).to.be.an('object');
  });

  it('should compile _data.json to data.json', function () {
    const _data = stripBraces(fs.readFileSync(`${conf.ui.paths.source.data}/_data.json`, conf.enc));

    expect(dataAfter).to.contain(_data);
  });

  it('should compile _patterns partials to data.json', function () {
    const extname = '.json';

    diveSync(
      conf.ui.paths.source.patterns,
      (err, file) => {
        if (err) {
          utils.error(err);
        }

        const basename = path.basename(file);

        if (basename.charAt(0) !== '_' || basename.indexOf(extname) !== basename.length - extname.length) {
          return;
        }

        const partial = stripBraces(fs.readFileSync(file, conf.enc));

        expect(dataAfter).to.contain(partial);
      }
    );
  });

  it('should compile _appendix.json to data.json', function () {
    const appendix = stripBraces(fs.readFileSync(appendixFile, conf.enc));

    expect(dataAfter).to.contain(appendix);
  });
});
