'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

const {
  patternlab
} = require('../init')();

const uiIndex = `${patternlab.config.paths.public.root}/index.html`;
const uiCss = `${patternlab.config.paths.public.styleguide}/styles/ui.css`;
const uiJs = `${patternlab.config.paths.public.styleguide}/scripts/ui/compilation.js`;

if (fs.existsSync(uiIndex)) {
  fs.removeSync(uiIndex);
}
if (fs.existsSync(uiCss)) {
  fs.removeSync(uiCss);
}
if (fs.existsSync(uiJs)) {
  fs.removeSync(uiJs);
}
const uiIndexExistsBefore = fs.existsSync(uiIndex);
const uiCssExistsBefore = fs.existsSync(uiCss);
const uiJsExistsBefore = fs.existsSync(uiJs);

describe('UI Compiler', function () {
  let uiIndexContent;
  let uiCssContent;
  let uiJsContent;

  before(function () {
    patternlab.compile();

    uiIndexContent = fs.readFileSync(uiIndex, patternlab.enc);
    uiCssContent = fs.readFileSync(uiCss, patternlab.enc);
    uiJsContent = fs.readFileSync(uiJs, patternlab.enc);
  });

  it('writes index.html', function () {
    const uiIndexExistsAfter = fs.existsSync(uiIndex);

    expect(uiIndexExistsBefore).to.be.false;
    expect(uiIndexExistsAfter).to.be.true;
  });

  it('writes ui.css', function () {
    const uiCssExistsAfter = fs.existsSync(uiCss);

    expect(uiCssExistsBefore).to.be.false;
    expect(uiCssExistsAfter).to.be.true;
  });

  it('writes ui.js', function () {
    const uiJsExistsAfter = fs.existsSync(uiJs);

    expect(uiJsExistsBefore).to.be.false;
    expect(uiJsExistsAfter).to.be.true;
  });

  it('recognizes a similarly named and hierarchically structured custom component module and overrides its \
corresponding core component module', function () {
    expect(uiIndexContent).to.have.string('id="foo"');
  });

  it('recognizes that a component has a custom sibling not in core and adds this sibling and its descendents to \
the DOM', function () {
    expect(uiIndexContent).to.have.string('<div>bar</div>');
  });

  it('recognizes that a component at the end of branch has a custom child not in core and adds this child and \
its descendents to the DOM', function () {
    expect(uiIndexContent).to.have.string('<div>baz</div>');
  });

  it('overrides componentized css', function () {
    expect(uiCssContent).to.have.string('/* foo */');
  });

  it('recognizes additional custom componentized css', function () {
    expect(uiCssContent).to.have.string('/* bar */');
  });

  it('overrides componentized js', function () {
    expect(uiJsContent).to.have.string('/* foo */');
  });

  it('recognizes additional custom componentized js', function () {
    expect(uiJsContent).to.have.string('/* bar */');
  });
});
