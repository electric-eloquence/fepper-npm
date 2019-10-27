'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

const {
  fepper
} = require('../init')();
const conf = fepper.conf;
const tasks = fepper.tasks;

const appendixFile = `${conf.ui.paths.source.data}/_appendix.json`;
const appendixStr = fs.readFileSync(appendixFile, conf.enc);
const dataFile = `${conf.ui.paths.source.data}/data.json`;
const _dataFile = `${conf.ui.paths.source.data}/_data.json`;
const _dataStr = fs.readFileSync(`${conf.ui.paths.source.data}/_data.json`, conf.enc);

function stripBraces(jsonStr_) {
  let jsonStr = jsonStr_;
  jsonStr = jsonStr.replace(/^\s*{\s*/, '');
  jsonStr = jsonStr.replace(/\s*}\s*$/, '');

  return jsonStr;
}

describe('JSON Compiler', function () {
  let dataBefore;
  let dataAfter;
  let dataJson;

  before(function () {
    fs.writeFileSync(dataFile, '');

    dataBefore = fs.readFileSync(dataFile, conf.enc);

    tasks.jsonCompile();

    dataAfter = fs.readFileSync(dataFile, conf.enc);

    try {
      dataJson = JSON.parse(dataAfter);
    }
    catch (err) {
      // Fail gracefully.
    }
  });

  after(function () {
    if (!fs.existsSync(appendixFile)) {
      fs.writeFileSync(appendixFile, appendixStr);
    }

    if (fs.readFileSync(_dataFile, conf.enc) !== _dataStr) {
      fs.writeFileSync(_dataFile, _dataStr);
    }

    tasks.jsonCompile();
  });

  it('overwrites data.json', function () {
    expect(dataBefore).to.equal('');
    expect(dataAfter).to.not.equal(dataBefore);
  });

  it('compiles valid JSON to data.json', function () {
    expect(dataJson).to.be.an('object');
  });

  it('compiles _data.json to data.json', function () {
    const _data = stripBraces(_dataStr);

    expect(dataAfter).to.have.string(_data);
  });

  it('compiles underscore-prefixed .json files to data.json', function () {
    const file = `${conf.ui.paths.source.patterns}/01-compounds/01-blocks/_blocks.json`;
    const partial = stripBraces(fs.readFileSync(file, conf.enc));

    expect(dataAfter).to.have.string(partial);
  });

  it('compiles _appendix.json to data.json', function () {
    const appendix = stripBraces(appendixStr);

    expect(dataAfter).to.have.string(appendix);
  });

  it('compiles without an _appendix.json file', function () {
    const dataJsonWithAppendix = dataJson;
    let dataJsonWithoutAppendix;

    fs.unlinkSync(appendixFile);
    tasks.jsonCompile();

    dataJsonWithoutAppendix = fs.readJsonSync(dataFile, {throws: false});

    expect(dataJsonWithAppendix).to.have.property('bp_lg_max');
    expect(dataJsonWithAppendix).to.have.property('bp_lg_min');
    expect(dataJsonWithAppendix).to.have.property('bp_md_min');
    expect(dataJsonWithAppendix).to.have.property('bp_sm_min');
    expect(dataJsonWithAppendix).to.have.property('bp_xs_min');

    expect(dataJsonWithoutAppendix).to.not.have.property('bp_lg_max');
    expect(dataJsonWithoutAppendix).to.not.have.property('bp_lg_min');
    expect(dataJsonWithoutAppendix).to.not.have.property('bp_md_min');
    expect(dataJsonWithoutAppendix).to.not.have.property('bp_sm_min');
    expect(dataJsonWithoutAppendix).to.not.have.property('bp_xs_min');

    fs.writeFileSync(appendixFile, appendixStr);
  });

  it('compiles without _data.json data', function () {
    const with_data = dataJson;
    let without_data;

    fs.writeFileSync(_dataFile, '{}');
    tasks.jsonCompile();

    without_data = fs.readJsonSync(dataFile, {throws: false});

    expect(with_data).to.have.property('backend_serve_dir');
    expect(with_data).to.have.property('homepage');
    expect(with_data).to.have.property('title');
    expect(with_data).to.have.property('excerpt');
    expect(with_data).to.have.property('description');
    expect(with_data).to.have.property('url');

    expect(without_data).to.not.have.property('backend_serve_dir');
    expect(without_data).to.not.have.property('homepage');
    expect(without_data).to.not.have.property('title');
    expect(without_data).to.not.have.property('excerpt');
    expect(without_data).to.not.have.property('description');
    expect(without_data).to.not.have.property('url');

    fs.writeFileSync(_dataFile, _dataStr);
  });
});
