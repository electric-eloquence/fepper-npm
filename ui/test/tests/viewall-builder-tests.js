'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

const {
  patternlab
} = require('../init')();

const viewallViewall = `${patternlab.config.paths.public.patterns}/viewall/index.html`;
const patternTypeViewall = `${patternlab.config.paths.public.patterns}/00-test/index.html`;
const patternSubTypeViewall = `${patternlab.config.paths.public.patterns}/00-test-sub/index.html`;

if (fs.existsSync(viewallViewall)) {
  fs.removeSync(viewallViewall);
}
if (fs.existsSync(patternTypeViewall)) {
  fs.removeSync(patternTypeViewall);
}
if (fs.existsSync(patternSubTypeViewall)) {
  fs.removeSync(patternSubTypeViewall);
}

const viewallViewallExistsBefore = fs.existsSync(viewallViewall);
const patternTypeViewallExistsBefore = fs.existsSync(patternTypeViewall);
const patternSubTypeViewallExistsBefore = fs.existsSync(patternSubTypeViewall);

const identifyingTag = '<div id="test-sub" class="sg-pattern">';

describe('Viewall Builder', function () {
  let viewallViewallExistsAfter;
  let patternTypeViewallExistsAfter;
  let patternSubTypeViewallExistsAfter;

  let viewallViewallContent;
  let patternTypeViewallContent;
  let patternSubTypeViewallContent;

  before(function () {
    patternlab.build();

    viewallViewallExistsAfter = fs.existsSync(viewallViewall);
    patternTypeViewallExistsAfter = fs.existsSync(patternTypeViewall);
    patternSubTypeViewallExistsAfter = fs.existsSync(patternSubTypeViewall);

    viewallViewallContent = fs.readFileSync(viewallViewall, patternlab.config.enc);
    patternTypeViewallContent = fs.readFileSync(patternTypeViewall, patternlab.config.enc);
    patternSubTypeViewallContent = fs.readFileSync(patternSubTypeViewall, patternlab.config.enc);
  });

  it('writes viewall/index.html', function () {
    expect(viewallViewallExistsBefore).to.be.false;

    expect(viewallViewallExistsAfter).to.be.true;
    expect(viewallViewallContent).to.have.string(identifyingTag);
  });

  it('writes patternType viewall', function () {
    expect(patternTypeViewallExistsBefore).to.be.false;

    expect(patternTypeViewallExistsAfter).to.be.true;
    expect(patternTypeViewallContent).to.have.string(identifyingTag);
  });

  it('writes patternSubType viewall', function () {
    expect(patternSubTypeViewallExistsBefore).to.be.false;

    expect(patternSubTypeViewallExistsAfter).to.be.true;
    expect(patternSubTypeViewallContent).to.have.string(identifyingTag);
  });

  it('overrides viewall/index.html with custom code', function () {
    expect(viewallViewallContent).to.have.string('<h1>foo</h1>');
    expect(viewallViewallContent).to.have.string('<h2>bar</h2>');
    expect(viewallViewallContent).to.have.string('<h3>baz</h3>');
    expect(viewallViewallContent).to.have.string('<h4>bez</h4>');
  });

  it('overrides patternType viewall with custom code', function () {
    expect(patternTypeViewallContent).to.have.string('<h1>foo</h1>');
    expect(patternTypeViewallContent).to.have.string('<h2>bar</h2>');
    expect(patternTypeViewallContent).to.have.string('<h3>baz</h3>');
    expect(patternTypeViewallContent).to.have.string('<h4>bez</h4>');
  });

  it('overrides patternSubType viewall with custom code', function () {
    expect(patternSubTypeViewallContent).to.have.string('<h1>foo</h1>');
    expect(patternSubTypeViewallContent).to.not.have.string('<h2>bar</h2>');
    expect(patternSubTypeViewallContent).to.have.string('<h3>baz</h3>');
    expect(patternSubTypeViewallContent).to.have.string('<h4>bez</h4>');
  });
});
