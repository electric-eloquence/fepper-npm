'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');
const path = require('path');

const {
  fepper
} = require('../init')();
const {
  conf,
  tasks
} = fepper;

const appendixFile = `${conf.ui.paths.source.root}/_data/_appendix.json`;

describe('Appendixer', function () {
  let appendixBefore;
  let appendixAfter;
  let appendixJson;

  before(function () {
    fs.writeFileSync(appendixFile, '');

    appendixBefore = fs.readFileSync(appendixFile, conf.enc);

    tasks.appendix();

    appendixAfter = fs.readFileSync(appendixFile, conf.enc);

    try {
      appendixJson = JSON.parse(appendixAfter);
    }
    catch {} // eslint-disable-line no-empty
  });

  it('overwrites _appendix.json', function () {
    expect(appendixBefore).to.equal('');
    expect(appendixAfter).to.not.equal(appendixBefore);
  });

  it('compiles variables.styl to _appendix.json as valid JSON', function () {
    expect(appendixJson).to.be.an.instanceof(Object);
    expect(appendixJson).to.have.property('bp_lg_max');
    expect(appendixJson).to.have.property('bp_lg_min');
    expect(appendixJson).to.have.property('bp_md_min');
    expect(appendixJson).to.have.property('bp_sm_min');
    expect(appendixJson).to.have.property('bp_xs_min');
  });

  it('compiles variables.styl properties enclosed in quotes to valid strings in _appendix.json', function () {
    const sourceJsOrig = conf.ui.paths.source.js;
    conf.ui.paths.source.js = path.normalize(`${conf.ui.paths.source.js}/../../source-1/_scripts`);
    const variablesStyl = fs.readFileSync(`${conf.ui.paths.source.js}/src/variables.styl`, conf.enc);
    appendixJson = {};

    fs.writeFileSync(appendixFile, '');

    appendixBefore = fs.readFileSync(appendixFile, conf.enc);

    tasks.appendix();

    appendixAfter = fs.readFileSync(appendixFile, conf.enc);

    try {
      appendixJson = JSON.parse(appendixAfter);
    }
    catch {} // eslint-disable-line no-empty

    expect(variablesStyl)
      .to.equal('bp_lg_max = -1\nbp_lg_min = \'1024\'\nbp_md_min = "768"\nbp_sm_min = 480\nbp_xs_min = 0\n');
    expect(appendixBefore).to.equal('');
    expect(appendixJson.bp_lg_max).to.equal('-1');
    expect(appendixJson.bp_lg_min).to.equal('1024');
    expect(appendixJson.bp_md_min).to.equal('768');
    expect(appendixJson.bp_sm_min).to.equal('480');
    expect(appendixJson.bp_xs_min).to.equal('0');

    conf.ui.paths.source.js = sourceJsOrig;
  });
});
