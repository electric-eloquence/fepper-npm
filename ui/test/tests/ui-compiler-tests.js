'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

// Need to unset and reset global.rootDir for this test to work alongside other tests.
const rootDir = global.rootDir;
delete global.rootDir;

const {
  patternlab
} = require('../init')();

global.rootDir = rootDir;

describe('UI Compiler', function () {
  const fepletFile = `${patternlab.config.paths.public.styleguide}/node_modules/feplet/dist/feplet.browser.es6.min.js`;
  const requerioFile = `${patternlab.config.paths.public.styleguide}/node_modules/requerio/src/requerio.js`;
  const uiIndex = `${patternlab.config.paths.public.root}/index.html`;
  const uiCss = `${patternlab.config.paths.public.styleguide}/styles/ui.css`;
  const uiJs = `${patternlab.config.paths.public.styleguide}/scripts/ui/compilation.js`;

  let fepletFileExistsBefore;
  let requerioFileExistsBefore;
  let uiIndexExistsBefore;
  let uiCssExistsBefore;
  let uiJsExistsBefore;

  let uiIndexContent;
  let uiCssContent;
  let uiJsContent;

  before(function () {
    if (fs.existsSync(fepletFile)) {
      fs.removeSync(fepletFile);
    }
    if (fs.existsSync(requerioFile)) {
      fs.removeSync(requerioFile);
    }
    if (fs.existsSync(uiIndex)) {
      fs.removeSync(uiIndex);
    }
    if (fs.existsSync(uiCss)) {
      fs.removeSync(uiCss);
    }
    if (fs.existsSync(uiJs)) {
      fs.removeSync(uiJs);
    }

    fepletFileExistsBefore = fs.existsSync(fepletFile);
    requerioFileExistsBefore = fs.existsSync(requerioFile);
    uiIndexExistsBefore = fs.existsSync(uiIndex);
    uiCssExistsBefore = fs.existsSync(uiCss);
    uiJsExistsBefore = fs.existsSync(uiJs);

    patternlab.compile();

    uiIndexContent = fs.readFileSync(uiIndex, patternlab.enc);
    uiCssContent = fs.readFileSync(uiCss, patternlab.enc);
    uiJsContent = fs.readFileSync(uiJs, patternlab.enc);
  });

  it('copies feplet.browser.es6.min.js', function () {
    const fepletFileExistsAfter = fs.existsSync(fepletFile);

    expect(fepletFileExistsBefore).to.be.false;
    expect(fepletFileExistsAfter).to.be.true;
  });

  it('copies requerio.js', function () {
    const requerioFileExistsAfter = fs.existsSync(requerioFile);

    expect(requerioFileExistsBefore).to.be.false;
    expect(requerioFileExistsAfter).to.be.true;
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
