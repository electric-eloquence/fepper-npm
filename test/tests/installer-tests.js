'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

require('../init');

const fepper = global.fepper;
const installer = fepper.tasks.installer;

describe('Installer', function () {
  let extendDirExistsBefore;
  let sourceDirExistsBefore;

  before(function () {
    installer.sourceDir = installer.sourceDir + '-installer-test';
  });

  beforeEach(function () {
    fs.removeSync(installer.extendDir);
    fs.removeSync(installer.sourceDir);

    extendDirExistsBefore = fs.existsSync(installer.extendDir);
    sourceDirExistsBefore = fs.existsSync(installer.sourceDir);
  });

  it('.copy() copies main profile source and extend dirs', function () {
    installer.appDir = `${global.rootDir}/root-installer-test`;

    installer.copy();

    const extendDirContentsAfter = fs.readdirSync(installer.extendDir).toString();
    const sourceDirContentsAfter = fs.readdirSync(installer.sourceDir).toString();
    const pagesDirContentsAfter = fs.readdirSync(`${installer.sourceDir}/_patterns/98-scrape`).toString();

    expect(extendDirExistsBefore).to.be.false;
    expect(sourceDirExistsBefore).to.be.false;

    expect(extendDirContentsAfter)
      .to.have.string('README.md,auxiliary,contrib.js,custom,custom.js,node_modules,package');
    expect(sourceDirContentsAfter).to.equal('_annotations,_assets,_data,_meta,_patterns,_scripts,_static,_styles,_ui');
    expect(pagesDirContentsAfter)
      .to.equal('00-homepage.json,00-homepage.mustache,01-blog.mustache,02-articles,_01-blog.json');
  });

  it('.copyBase() copies base profile source and extend dirs', function () {
    installer.appDir = global.rootDir;

    installer.copyBase();

    const extendDirContentsAfter = fs.readdirSync(installer.extendDir).toString();
    const sourceDirContentsAfter = fs.readdirSync(installer.sourceDir).toString();
    const pagesDirContentsAfter = fs.readdirSync(`${installer.sourceDir}/_patterns/04-pages`).toString();

    expect(extendDirExistsBefore).to.be.false;
    expect(sourceDirExistsBefore).to.be.false;

    expect(extendDirContentsAfter).to.equal('README.md,auxiliary,contrib.js,custom,custom.js,package.json');
    expect(sourceDirContentsAfter).to.equal('_annotations,_assets,_data,_meta,_patterns,_scripts,_static,_styles,_ui');
    expect(pagesDirContentsAfter).to.equal('00-homepage.mustache');
  });
});
