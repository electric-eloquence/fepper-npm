'use strict';

const expect = require('chai').expect;
const fs = require('fs-extra');
const path = require('path');

global.appDir = path.normalize(`${__dirname}/../..`);
global.rootDir = path.normalize(`${__dirname}/../../..`);
global.workDir = path.normalize(`${__dirname}/..`);

const utils = require(`${global.appDir}/core/lib/utils`);
utils.conf();
utils.pref();
const conf = global.conf;
const enc = conf.enc;

const pcFile = `${global.workDir}/${conf.ui.paths.public.styleguide}/scripts/pattern-configurer.js`;
const Tasks = require(`${global.appDir}/core/tasks/tasks`);
const tasks = new Tasks();

describe('Pattern Configurer', function () {
  // Clear out pattern-configurer.js.
  fs.mkdirpSync(path.dirname(pcFile));
  fs.writeFileSync(pcFile, '');
  // Get empty string for comparison.
  var pcBefore = fs.readFileSync(pcFile, conf.enc);
  // Run pattern-configurer.js.
  tasks.patternConfigure();
  // Get pattern-configurer.js output.
  var pcAfter = fs.readFileSync(pcFile, conf.enc);

  it('should overwrite pattern-configurer.js', function () {
    expect(pcBefore).to.equal('');
    expect(pcAfter).to.not.equal(pcBefore);
  });
});
