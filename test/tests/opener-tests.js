'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

require('../init');

const fepper = global.fepper;
const conf = fepper.conf;
const opener = fepper.tasks.opener;

const timestampFile = `${global.rootDir}/.timestamp`;

describe('Opener', function () {
  let timestampFileExistsBefore;
  let timestampFromFn;

  before(function () {
    fs.removeSync(timestampFile);

    timestampFileExistsBefore = fs.existsSync(timestampFile);
    timestampFromFn = opener.timestamp();
  });

  after(function () {
    fs.removeSync(timestampFile);
  });

  it('writes timestamp to file system for comparing against browser cookie', function () {
    const timestampFileExistsAfter = fs.existsSync(timestampFile);
    const timestampFromFile = fs.readFileSync(timestampFile, conf.enc);

    expect(timestampFileExistsBefore).to.be.false;

    expect(timestampFileExistsAfter).to.be.true;
    expect(timestampFromFn).to.equal(timestampFromFile);
  });
});
