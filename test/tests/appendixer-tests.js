'use strict';

const expect = require('chai').expect;
const fs = require('fs-extra');

require('../init');

const fepper = global.fepper;
const conf = fepper.conf;
const appendixer = fepper.tasks.appendixer;

const appendixFile = `${conf.ui.paths.source.root}/_data/_appendix.json`;

describe('Appendixer', function () {
  // Clear out _appendix.json.
  fs.writeFileSync(appendixFile, '');

  // Get empty string for comparison.
  const appendixBefore = fs.readFileSync(appendixFile, conf.enc);

  // Run appendixer.js.
  appendixer.main();

  // Get appendixer.js output.
  const appendixAfter = fs.readFileSync(appendixFile, conf.enc);

  // Test valid JSON.
  let appendixJson;

  try {
    appendixJson = JSON.parse(appendixAfter);
  }
  catch (er) {
    // Fail gracefully.
  }

  it('should overwrite _appendix.json', function () {
    expect(appendixBefore).to.equal('');
    expect(appendixAfter).to.not.equal(appendixBefore);
  });

  it('should compile variables.styl to _appendix.json as valid JSON', function () {
    expect(appendixJson).to.be.an('object');
  });
});
