'use strict';

const expect = require('chai').expect;
const fs = require('fs-extra');

const {
  patternlab
} = require('../test-harness')();

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
    patternlab.patternsonly();

    viewallViewallExistsAfter = fs.existsSync(viewallViewall);
    patternTypeViewallExistsAfter = fs.existsSync(patternTypeViewall);
    patternSubTypeViewallExistsAfter = fs.existsSync(patternSubTypeViewall);

    viewallViewallContent = fs.readFileSync(viewallViewall, patternlab.enc);
    patternTypeViewallContent = fs.readFileSync(patternTypeViewall, patternlab.enc);
    patternSubTypeViewallContent = fs.readFileSync(patternSubTypeViewall, patternlab.enc);
  });

  it('should write viewall.html', function () {
    expect(viewallViewallExistsBefore).to.equal(false);
    expect(viewallViewallExistsAfter).to.equal(true);
    expect(viewallViewallContent).to.contain(typeItem);
    expect(viewallViewallContent).to.contain(subTypeItem);
  });

  it('should write patternType viewall', function () {
    expect(patternTypeViewallExistsBefore).to.equal(false);
    expect(patternTypeViewallExistsAfter).to.equal(true);
    expect(patternTypeViewallContent).to.contain(typeItem);
    expect(patternTypeViewallContent).to.not.contain(subTypeItem);
  });

  it('should write patternSubType viewall', function () {
    expect(patternSubTypeViewallExistsBefore).to.equal(false);
    expect(patternSubTypeViewallExistsAfter).to.equal(true);
    expect(patternSubTypeViewallContent).to.not.contain(typeItem);
    expect(patternSubTypeViewallContent).to.contain(subTypeItem);
  });

  it('should override stylguide.html with custom code', function () {
    expect(viewallViewallContent).to.include('<h1>foo</h1>');
    expect(viewallViewallContent).to.include('<h2>bar</h2>');
    expect(viewallViewallContent).to.include('<h3>baz</h3>');
    expect(viewallViewallContent).to.include('<h4>bez</h4>');
  });

  it('should override patternType viewall with custom code', function () {
    expect(patternTypeViewallContent).to.include('<h1>foo</h1>');
    expect(patternTypeViewallContent).to.include('<h2>bar</h2>');
    expect(patternTypeViewallContent).to.not.include('<h3>baz</h3>');
    expect(patternTypeViewallContent).to.include('<h4>bez</h4>');
  });

  it('should override patternSubType viewall with custom code', function () {
    expect(patternSubTypeViewallContent).to.include('<h1>foo</h1>');
    expect(patternSubTypeViewallContent).to.not.include('<h2>bar</h2>');
    expect(patternSubTypeViewallContent).to.include('<h3>baz</h3>');
    expect(patternSubTypeViewallContent).to.include('<h4>bez</h4>');
  });
});
