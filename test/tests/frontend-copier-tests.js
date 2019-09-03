'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

require('../init');

const fepper = global.fepper;
const {
  conf,
  pref,
  tasks,
  utils
} = fepper;

const assetsDir = conf.ui.paths.source.images;
const assetsTargetDir = utils.backendDirCheck(pref.backend.synced_dirs.assets_dir);
const scriptsTargetDir = utils.backendDirCheck(pref.backend.synced_dirs.scripts_dir);
const stylesBldDir = conf.ui.paths.source.cssBld;
const stylesTargetDir = utils.backendDirCheck(pref.backend.synced_dirs.styles_dir);

// fepper.ui.patternlab.emptyFilesNotDirs is DEPRECATED.
// After deprecation period, permanently change conditionalObj to utils.
let conditionalObj = fepper.ui.patternlab;

if (typeof utils.emptyFilesNotDirs === 'function') {
  conditionalObj = utils;
}

describe('Frontend Copier', function () {
  let assetExistsBefore;
  let scriptExistsBefore;
  let scriptExistsBefore1;
  let styleExistsBefore;
  let styleExistsBefore1;
  let styleExistsBefore2;
  let styleExistsBefore3;
  let styleExistsBefore4;

  before(function () {
    // Clear out target dirs before main execution.
    conditionalObj.emptyFilesNotDirs(assetsTargetDir);
    conditionalObj.emptyFilesNotDirs(scriptsTargetDir);
    conditionalObj.emptyFilesNotDirs(stylesTargetDir);

    assetExistsBefore = fs.existsSync(`${assetsTargetDir}/logo.png`);
    scriptExistsBefore = fs.existsSync(`${scriptsTargetDir}/src/fepper-obj.js`);
    scriptExistsBefore1 = fs.existsSync(`${scriptsTargetDir}/src/variables.styl`);
    styleExistsBefore = fs.existsSync(`${stylesTargetDir}/bld/style.css`);
    styleExistsBefore1 = fs.existsSync(`${stylesTargetDir}/bld/fonts/icons.svg`);
    styleExistsBefore2 = fs.existsSync(`${stylesTargetDir}/fonts-alt/icons-alt.svg`);
    styleExistsBefore3 = fs.existsSync(`${stylesTargetDir}/bld/fonts/nested/icons.nested.svg`);
    styleExistsBefore4 =
      fs.existsSync(`${stylesTargetDir}/fonts-alt/nested-alt/icons.nested-alt.svg`);

    // Run main execution before tests.
    tasks.frontendCopy('assets');
    tasks.frontendCopy('scripts');
    tasks.frontendCopy('styles');
  });

  it('copies frontend files to the backend', function () {
    const assetExistsAfter = fs.existsSync(`${assetsTargetDir}/logo.png`);
    const scriptExistsAfter = fs.existsSync(`${scriptsTargetDir}/src/fepper-obj.js`);
    const scriptExistsAfter1 = fs.existsSync(`${scriptsTargetDir}/src/variables.styl`);
    const styleExistsAfter = fs.existsSync(`${stylesTargetDir}/bld/style.css`);
    const styleExistsAfter1 = fs.existsSync(`${stylesTargetDir}/bld/fonts/icons.svg`);
    const styleExistsAfter2 = fs.existsSync(`${stylesTargetDir}/fonts-alt/icons-alt.svg`);
    const styleExistsAfter3 = fs.existsSync(`${stylesTargetDir}/bld/fonts/nested/icons.nested.svg`);
    const styleExistsAfter4 =
      fs.existsSync(`${stylesTargetDir}/fonts-alt/nested-alt/icons.nested-alt.svg`);

    expect(assetExistsBefore).to.be.false;
    expect(scriptExistsBefore).to.be.false;
    expect(scriptExistsBefore1).to.be.false;
    expect(styleExistsBefore).to.be.false;
    expect(styleExistsBefore1).to.be.false;
    expect(styleExistsBefore2).to.be.false;
    expect(styleExistsBefore3).to.be.false;
    expect(styleExistsBefore4).to.be.false;
    expect(assetExistsAfter).to.be.true;
    expect(scriptExistsAfter).to.be.true;
    expect(scriptExistsAfter1).to.be.true;
    expect(styleExistsAfter).to.be.true;
    expect(styleExistsAfter1).to.be.true;
    expect(styleExistsAfter2).to.be.true;
    expect(styleExistsAfter3).to.be.true;
    expect(styleExistsAfter4).to.be.true;
  });

  it('ignores frontend files prefixed with two undercores', function () {
    const src = fs.existsSync(`${stylesBldDir}/__style.dev.css`);
    const ignored = fs.existsSync(`${stylesTargetDir}/__style.dev.css`);

    expect(src).to.be.true;
    expect(ignored).to.be.false;
  });

  it('ignores frontend files in a _nosync directory', function () {
    const src = fs.existsSync(`${assetsDir}/_nosync/nosync.png`);
    const ignored = fs.existsSync(`${assetsTargetDir}/_nosync/nosync.png`);

    expect(src).to.be.true;
    expect(ignored).to.be.false;
  });

  it('writes to the default target directory', function () {
    const output = fs.readFileSync(`${scriptsTargetDir}/src/variables.styl`, conf.enc).trim();

    expect(output).to.equal('bp_lg_max = -1\nbp_lg_min = 1024\nbp_md_min = 768\nbp_sm_min = 480\nbp_xs_min = 0');
  });
});
