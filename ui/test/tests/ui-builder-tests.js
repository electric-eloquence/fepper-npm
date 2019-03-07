'use strict';

const expect = require('chai').expect;
const fs = require('fs-extra');

const {
  patternlab
} = require('../init')();

const patternDir = `${patternlab.config.paths.public.patterns}/00-test-04-styled-organism`;
const patternHtml = `${patternDir}/00-test-04-styled-organism.html`;
const patternMarkup = `${patternDir}/00-test-04-styled-organism.markup-only.html`;
const patternMustache = `${patternDir}/00-test-04-styled-organism.mustache`;
const patternExport = `${patternlab.config.patternExportDirectory}/test-styled-organism.html`;
const patternlabData = `${patternlab.config.paths.public.styleguide}/data/patternlab-data.js`;

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

const expectedContent = `<span class="test_base ">
</span>
<span class="test_base test_1">
</span>
`;

const configClone = JSON.parse(JSON.stringify(patternlab.config));
delete configClone.paths;

describe('UI Builder', function () {
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
    patternlab.build();

    patternHtmlExistsAfter = fs.existsSync(patternHtml);
    patternMarkupExistsAfter = fs.existsSync(patternMarkup);
    patternMustacheExistsAfter = fs.existsSync(patternMustache);
    patternExportExistsAfter = fs.existsSync(patternExport);
    patternlabDataExistsAfter = fs.existsSync(patternlabData);

    patternHtmlContent = fs.readFileSync(patternHtml, patternlab.enc);
    patternMarkupContent = fs.readFileSync(patternMarkup, patternlab.enc);
    patternMustacheContent = fs.readFileSync(patternMustache, patternlab.enc);
    patternExportContent = fs.readFileSync(patternExport, patternlab.enc);
    patternlabDataContent = fs.readFileSync(patternlabData, patternlab.enc);
  });

  it('should write patterns to the public directory', function () {
    expect(patternHtmlExistsBefore).to.equal(false);
    expect(patternMarkupExistsBefore).to.equal(false);
    expect(patternMustacheExistsBefore).to.equal(false);

    expect(patternHtmlExistsAfter).to.equal(true);
    expect(patternMarkupExistsAfter).to.equal(true);
    expect(patternMustacheExistsAfter).to.equal(true);

    expect(patternHtmlContent).to.include(expectedContent);
    expect(patternMarkupContent).to.equal(expectedContent);
    expect(patternMustacheContent).to.equal('{{> test-styled-molecule }}\n');
  });

  it('should export patterns to the pattern_exports directory', function () {
    expect(patternExportExistsBefore).to.equal(false);
    expect(patternExportExistsAfter).to.equal(true);
    expect(patternExportContent).to.equal(expectedContent);
  });

  it('should write patternlab-data.js for browser consumption', function () {
    expect(patternlabDataExistsBefore).to.equal(false);
    expect(patternlabDataExistsAfter).to.equal(true);
  });

  it('should write window.config to patternlab-data.js', function () {
    expect(patternlabDataContent).to.include(JSON.stringify(configClone));
  });

  it('should write window.ishControls to patternlab-data.js', function () {
    expect(patternlabDataContent).to.include(JSON.stringify(configClone.ishControlsHide));
  });

  it('should write window.navItems to patternlab-data.js', function () {
    expect(patternlabDataContent).to.include(JSON.stringify(patternlab.patternTypes));
  });

  it('should write window.patternPaths to patternlab-data.js', function () {
    expect(patternlabDataContent).to.include(JSON.stringify(patternlab.patternPaths));
  });

  it('should write window.viewallPaths to patternlab-data.js', function () {
    expect(patternlabDataContent).to.include(JSON.stringify(patternlab.viewallPaths));
  });
});
