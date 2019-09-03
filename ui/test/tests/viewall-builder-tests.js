'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

const {
  patternlab
} = require('../init')();

const viewallViewall = `${patternlab.config.paths.public.patterns}/viewall/viewall.html`;
const patternTypeViewall = `${patternlab.config.paths.public.patterns}/00-test/index.html`;
const patternSubTypeViewall = `${patternlab.config.paths.public.patterns}/facebook-cambridge-analytica/index.html`;

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

const typeItem = `<div class="sg-pattern-example cf">
          <div id="bar">Bar</div>

        </div>`;
const subTypeItem = `<div class="sg-pattern-example cf">
          bar

        </div>`;

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

    viewallViewallContent = fs.readFileSync(viewallViewall, patternlab.enc);
    patternTypeViewallContent = fs.readFileSync(patternTypeViewall, patternlab.enc);
    patternSubTypeViewallContent = fs.readFileSync(patternSubTypeViewall, patternlab.enc);
  });

  it('writes viewall.html', function () {
    expect(viewallViewallExistsBefore).to.be.false;

    expect(viewallViewallExistsAfter).to.be.true;
    expect(viewallViewallContent).to.have.string(typeItem);
    expect(viewallViewallContent).to.have.not.string(subTypeItem);
  });

  it('writes patternType viewall', function () {
    expect(patternTypeViewallExistsBefore).to.be.false;

    expect(patternTypeViewallExistsAfter).to.be.true;
    expect(patternTypeViewallContent).to.have.string(typeItem);
    expect(patternTypeViewallContent).to.not.have.string(subTypeItem);
  });

  it('writes patternSubType viewall', function () {
    expect(patternSubTypeViewallExistsBefore).to.be.false;

    expect(patternSubTypeViewallExistsAfter).to.be.true;
    expect(patternSubTypeViewallContent).to.not.have.string(typeItem);
    expect(patternSubTypeViewallContent).to.not.have.string(subTypeItem);
  });

  it('overrides stylguide.html with custom code', function () {
    expect(viewallViewallContent).to.have.string('<h1>foo</h1>');
    expect(viewallViewallContent).to.have.string('<h2>bar</h2>');
    expect(viewallViewallContent).to.have.string('<h3>baz</h3>');
    expect(viewallViewallContent).to.have.string('<h4>bez</h4>');
  });

  it('overrides patternType viewall with custom code', function () {
    expect(patternTypeViewallContent).to.have.string('<h1>foo</h1>');
    expect(patternTypeViewallContent).to.have.string('<h2>bar</h2>');
    expect(patternTypeViewallContent).to.not.have.string('<h3>baz</h3>');
    expect(patternTypeViewallContent).to.have.string('<h4>bez</h4>');
  });

  it('overrides patternSubType viewall with custom code', function () {
    expect(patternSubTypeViewallContent).to.have.string('<h1>foo</h1>');
    expect(patternSubTypeViewallContent).to.not.have.string('<h2>bar</h2>');
    expect(patternSubTypeViewallContent).to.have.string('<h3>baz</h3>');
    expect(patternSubTypeViewallContent).to.not.have.string('<h4>bez</h4>');
  });
});
