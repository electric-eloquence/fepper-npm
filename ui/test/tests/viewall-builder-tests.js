'use strict';

const expect = require('chai').expect;
const fs = require('fs-extra');

const {
  patternlab
} = require('../test-harness')();

const styleguideViewall = `${patternlab.config.paths.public.patterns}/styleguide/styleguide.html`;
const patternTypeViewall = `${patternlab.config.paths.public.patterns}/00-test/index.html`;
const patternSubTypeViewall = `${patternlab.config.paths.public.patterns}/facebook-cambridge-analytica/index.html`;

if (fs.existsSync(styleguideViewall)) {
  fs.removeSync(styleguideViewall);
}
if (fs.existsSync(patternTypeViewall)) {
  fs.removeSync(patternTypeViewall);
}
if (fs.existsSync(patternSubTypeViewall)) {
  fs.removeSync(patternSubTypeViewall);
}

const styleguideViewallExistsBefore = fs.existsSync(styleguideViewall);
const patternTypeViewallExistsBefore = fs.existsSync(patternTypeViewall);
const patternSubTypeViewallExistsBefore = fs.existsSync(patternSubTypeViewall);

const typeItem = `<div class="sg-pattern-example cf">
          <div id="bar">Bar</div>

        </div>`;
const subTypeItem = `<div class="sg-pattern-example cf">
          bar

        </div>`;

describe('Viewall Builder', function () {
  let styleguideViewallExistsAfter;
  let patternTypeViewallExistsAfter;
  let patternSubTypeViewallExistsAfter;

  let styleguideViewallContent;
  let patternTypeViewallContent;
  let patternSubTypeViewallContent;

  before(function () {
    patternlab.patternsonly();

    styleguideViewallExistsAfter = fs.existsSync(styleguideViewall);
    patternTypeViewallExistsAfter = fs.existsSync(patternTypeViewall);
    patternSubTypeViewallExistsAfter = fs.existsSync(patternSubTypeViewall);

    styleguideViewallContent = fs.readFileSync(styleguideViewall, patternlab.enc);
    patternTypeViewallContent = fs.readFileSync(patternTypeViewall, patternlab.enc);
    patternSubTypeViewallContent = fs.readFileSync(patternSubTypeViewall, patternlab.enc);
  });

  it('should write styleguide.html', function () {
    expect(styleguideViewallExistsBefore).to.equal(false);
    expect(styleguideViewallExistsAfter).to.equal(true);
    expect(styleguideViewallContent).to.contain(typeItem);
    expect(styleguideViewallContent).to.contain(subTypeItem);
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
    expect(styleguideViewallContent).to.include('<h1>foo</h1>');
    expect(styleguideViewallContent).to.include('<h2>bar</h2>');
    expect(styleguideViewallContent).to.include('<h3>baz</h3>');
    expect(styleguideViewallContent).to.include('<h4>bez</h4>');
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
