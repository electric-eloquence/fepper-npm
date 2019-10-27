'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

const {
  fepper
} = require('../init')();
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

    const extendDirContentsAfter = fs.readdirSync(installer.extendDir);
    const sourceDirContentsAfter = fs.readdirSync(installer.sourceDir);
    const pagesDirContentsAfter = fs.readdirSync(`${installer.sourceDir}/_patterns/04-pages`);

    expect(extendDirExistsBefore).to.be.false;
    expect(sourceDirExistsBefore).to.be.false;

    expect(extendDirContentsAfter).to.include('README.md');
    expect(extendDirContentsAfter).to.include('auxiliary');
    expect(extendDirContentsAfter).to.include('contrib.js');
    expect(extendDirContentsAfter).to.include('custom');
    expect(extendDirContentsAfter).to.include('custom.js');
    expect(extendDirContentsAfter).to.include('node_modules');
    expect(extendDirContentsAfter).to.include('package.json');

    expect(sourceDirContentsAfter).to.include('_annotations');
    expect(sourceDirContentsAfter).to.include('_assets');
    expect(sourceDirContentsAfter).to.include('_data');
    expect(sourceDirContentsAfter).to.include('_meta');
    expect(sourceDirContentsAfter).to.include('_patterns');
    expect(sourceDirContentsAfter).to.include('_scripts');
    expect(sourceDirContentsAfter).to.include('_static');
    expect(sourceDirContentsAfter).to.include('_styles');
    expect(sourceDirContentsAfter).to.include('_ui');

    expect(pagesDirContentsAfter).to.include('00-homepage.json');
    expect(pagesDirContentsAfter).to.include('00-homepage.mustache');
    expect(pagesDirContentsAfter).to.include('01-blog.mustache');
    expect(pagesDirContentsAfter).to.include('02-articles');
    expect(pagesDirContentsAfter).to.include('_01-blog.json');
  });

  it('.copyBase() copies base profile source and extend dirs', function () {
    installer.appDir = global.rootDir;

    installer.copyBase();

    const extendDirContentsAfter = fs.readdirSync(installer.extendDir);
    const sourceDirContentsAfter = fs.readdirSync(installer.sourceDir);
    const pagesDirContentsAfter = fs.readdirSync(`${installer.sourceDir}/_patterns/04-pages`);

    expect(extendDirExistsBefore).to.be.false;
    expect(sourceDirExistsBefore).to.be.false;

    expect(extendDirContentsAfter).to.include('README.md');
    expect(extendDirContentsAfter).to.include('auxiliary');
    expect(extendDirContentsAfter).to.include('contrib.js');
    expect(extendDirContentsAfter).to.include('custom');
    expect(extendDirContentsAfter).to.include('custom.js');
    expect(extendDirContentsAfter).to.include('package.json');

    expect(sourceDirContentsAfter).to.include('_annotations');
    expect(sourceDirContentsAfter).to.include('_assets');
    expect(sourceDirContentsAfter).to.include('_data');
    expect(sourceDirContentsAfter).to.include('_meta');
    expect(sourceDirContentsAfter).to.include('_patterns');
    expect(sourceDirContentsAfter).to.include('_scripts');
    expect(sourceDirContentsAfter).to.include('_static');
    expect(sourceDirContentsAfter).to.include('_styles');
    expect(sourceDirContentsAfter).to.include('_ui');

    expect(pagesDirContentsAfter).to.include('00-homepage.mustache');
  });
});
