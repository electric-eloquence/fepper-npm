'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

const {
  patternlab
} = require('../init')();

const patternDir = `${patternlab.config.paths.public.patterns}/00-test-04-styled-organism`;
const patternHtml = `${patternDir}/00-test-04-styled-organism.html`;
const patternMarkup = `${patternDir}/00-test-04-styled-organism.markup-only.html`;
const patternMustache = `${patternDir}/00-test-04-styled-organism.mustache`;
const patternExport = `${patternlab.config.patternExportDirectory}/test-styled-organism.html`;
const patternlabData = `${patternlab.config.paths.public.styleguide}/scripts/ui/data.js`;

if (fs.existsSync(patternHtml)) {
  fs.removeSync(patternHtml);
}
if (fs.existsSync(patternMarkup)) {
  fs.removeSync(patternMarkup);
}
if (fs.existsSync(patternMustache)) {
  fs.removeSync(patternMustache);
}
if (fs.existsSync(patternExport)) {
  fs.removeSync(patternExport);
}
if (fs.existsSync(patternlabData)) {
  fs.removeSync(patternlabData);
}

const patternHtmlExistsBefore = fs.existsSync(patternHtml);
const patternMarkupExistsBefore = fs.existsSync(patternMarkup);
const patternMustacheExistsBefore = fs.existsSync(patternMustache);
const patternExportExistsBefore = fs.existsSync(patternExport);
const patternlabDataExistsBefore = fs.existsSync(patternlabData);

const expectedContent = '<span class="test_base ">      </span>    <span class="test_base test_1">      </span>  ';
const expectedPatternExportContent = '<span class="test_base "> </span> <span class="test_base test_1"> </span>\n';

describe('UI Builder', function () {
  let configClone;

  let patternHtmlExistsAfter;
  let patternMarkupExistsAfter;
  let patternMustacheExistsAfter;
  let patternExportExistsAfter;
  let patternlabDataExistsAfter;

  let patternHtmlContent;
  let patternMarkupContent;
  let patternMustacheContent;
  let patternExportContent;
  let patternlabDataContent;

  before(function () {
    const hashesFile = `${patternlab.config.paths.public.patterns}/hashes.json`;

    if (fs.existsSync(hashesFile)) {
      fs.removeSync(hashesFile);
    }

    patternlab.build();

    configClone = JSON.parse(JSON.stringify(patternlab.config));
    delete configClone.paths;

    patternHtmlExistsAfter = fs.existsSync(patternHtml);
    patternMarkupExistsAfter = fs.existsSync(patternMarkup);
    patternMustacheExistsAfter = fs.existsSync(patternMustache);
    patternExportExistsAfter = fs.existsSync(patternExport);
    patternlabDataExistsAfter = fs.existsSync(patternlabData);

    patternHtmlContent = fs.readFileSync(patternHtml, patternlab.config.enc);
    patternMarkupContent = fs.readFileSync(patternMarkup, patternlab.config.enc);
    patternMustacheContent = fs.readFileSync(patternMustache, patternlab.config.enc);
    patternExportContent = fs.readFileSync(patternExport, patternlab.config.enc);
    patternlabDataContent = fs.readFileSync(patternlabData, patternlab.config.enc);
  });

  it('writes patterns to the public directory', function () {
    expect(patternHtmlExistsBefore).to.be.false;
    expect(patternMarkupExistsBefore).to.be.false;
    expect(patternMustacheExistsBefore).to.be.false;

    expect(patternHtmlExistsAfter).to.be.true;
    expect(patternMarkupExistsAfter).to.be.true;
    expect(patternMustacheExistsAfter).to.be.true;
    expect(patternHtmlContent).to.have.string(expectedContent);
    expect(patternMarkupContent).to.equal(expectedContent);
    expect(patternMustacheContent).to.equal('{{> test-styled-molecule }}\n');
  });

  it('exports patterns to the pattern_exports directory', function () {
    expect(patternExportExistsBefore).to.be.false;

    expect(patternExportExistsAfter).to.be.true;
    expect(patternExportContent).to.equal(expectedPatternExportContent);
  });

  it('writes patternlab-data.js for browser consumption', function () {
    expect(patternlabDataExistsBefore).to.be.false;

    expect(patternlabDataExistsAfter).to.be.true;
  });

  it('writes window.config to patternlab-data.js', function () {
    expect(patternlabDataContent).to.have.string(JSON.stringify(configClone));
  });

  it('writes window.ishControls to patternlab-data.js', function () {
    expect(patternlabDataContent).to.have.string(JSON.stringify(configClone.ishControlsHide));
  });

  it('writes window.navItems to patternlab-data.js', function () {
    expect(patternlabDataContent).to.have.string(JSON.stringify(patternlab.patternTypes));
  });

  it('writes window.patternPaths to patternlab-data.js', function () {
    expect(patternlabDataContent).to.have.string(JSON.stringify(patternlab.patternPaths));
  });

  it('writes window.viewallPaths to patternlab-data.js', function () {
    expect(patternlabDataContent).to.have.string(JSON.stringify(patternlab.viewallPaths));
  });
});
