'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

require('../init');

const fepper = global.fepper;
const conf = fepper.conf;
const pref = fepper.pref;
const frontendCopier = fepper.tasks.frontendCopier;
const utils = fepper.utils;

const assetsDir = conf.ui.paths.source.images;
const assetsTargetDir = utils.backendDirCheck(pref.backend.synced_dirs.assets_dir);
const scriptsTargetDir = utils.backendDirCheck(pref.backend.synced_dirs.scripts_dir);
const scriptsTargetAlt = `${scriptsTargetDir}-alt`;
const stylesBldDir = conf.ui.paths.source.cssBld;
const stylesTargetDir = utils.backendDirCheck(pref.backend.synced_dirs.styles_dir);
const stylesTargetAlt = `${stylesTargetDir}-alt`;

// Clear out target dirs before main execution.
fs.removeSync(assetsTargetDir + '/*');
fs.removeSync(scriptsTargetDir + '/*');
fs.removeSync(scriptsTargetDir + '-alt/*');
fs.removeSync(stylesTargetDir + '/bld/fonts/nested/*');
fs.removeSync(stylesTargetDir + '/bld/fonts/nested-alt/*');
fs.removeSync(stylesTargetDir + '/bld/fonts/*.*');
fs.removeSync(stylesTargetDir + '/fonts-alt/*.*');
fs.removeSync(stylesTargetDir + '/*.*');
fs.removeSync(stylesTargetDir + '-alt/*.*');

// Run main execution before tests.
frontendCopier.main('assets');
frontendCopier.main('scripts');
frontendCopier.main('styles');

describe('Frontend Copier', function () {
  it('should copy frontend files to the backend', function () {
    const assetCopied = fs.existsSync(`${assetsTargetDir}/logo.png`);
    const scriptCopied = fs.existsSync(`${scriptsTargetDir}/src/fepper-obj.js`);
    const scriptCopied1 = fs.existsSync(`${scriptsTargetDir}/src/variables.styl`);
    const scriptCopied2 = fs.existsSync(`${scriptsTargetAlt}/variables-alt.styl`);
    const styleCopied = fs.existsSync(`${stylesTargetDir}/bld/style.css`);
    const styleCopied1 = fs.existsSync(`${stylesTargetAlt}/style-alt.css`);
    const styleCopied2 = fs.existsSync(`${stylesTargetDir}/bld/fonts/icons.svg`);
    const styleCopied3 = fs.existsSync(`${stylesTargetDir}/fonts-alt/icons-alt.svg`);
    const styleCopied4 = fs.existsSync(`${stylesTargetDir}/bld/fonts/nested/icons.nested.svg`);
    const styleCopied5 =
      fs.existsSync(`${stylesTargetDir}/fonts-alt/nested-alt/icons.nested-alt.svg`);

    expect(assetCopied).to.be.true;
    expect(scriptCopied).to.be.true;
    expect(scriptCopied1).to.be.true;
    expect(scriptCopied2).to.be.true;
    expect(styleCopied).to.be.true;
    expect(styleCopied1).to.be.true;
    expect(styleCopied2).to.be.true;
    expect(styleCopied3).to.be.true;
    expect(styleCopied4).to.be.true;
    expect(styleCopied5).to.be.true;
  });

  it('should ignore frontend files prefixed with two undercores', function () {
    const src = fs.existsSync(`${stylesBldDir}/__style.dev.css`);
    const ignored = fs.existsSync(`${stylesTargetDir}/__style.dev.css`);

    expect(src).to.be.true;
    expect(ignored).to.be.false;
  });

  it('should ignore frontend files in a _nosync directory', function () {
    const src = fs.existsSync(`${assetsDir}/_nosync/nosync.png`);
    const ignored = fs.existsSync(`${assetsTargetDir}/_nosync/nosync.png`);

    expect(src).to.be.true;
    expect(ignored).to.be.false;
  });

  it('should write to the default target directory', function () {
    const output = fs.readFileSync(`${scriptsTargetDir}/src/variables.styl`, conf.enc).trim();

    expect(output).to.equal('bp_lg_max = -1\nbp_lg_min = 1024\nbp_md_min = 768\nbp_sm_min = 480\nbp_xs_min = 0');
  });

  it('should write to the alternate target directory', function () {
    const output = fs.readFileSync(scriptsTargetAlt + '/variables-alt.styl', conf.enc).trim();

    expect(output).to.equal('bp_lg_max = -1\nbp_lg_min = 1024\nbp_md_min = 768\nbp_sm_min = 480\nbp_xs_min = 0');
  });
});
