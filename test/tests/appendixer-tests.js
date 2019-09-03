'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

require('../init');

const fepper = global.fepper;
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
    catch (er) {
      // Fail gracefully.
    }
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
});
