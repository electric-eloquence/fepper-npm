/**
 * Since uiBuilder.main() depends on the completion of patternlab.compileui(),
 * this tests styleguide/componentizer.js and styleguide/components-on-servers.js as well as lib/ui-builder.js.
 */
'use strict';

const expect = require('chai').expect;
const fs = require('fs-extra');

const {
  patternlab,
  patternsDir
} = require('../test-harness')();
const uiBuilder = patternlab.uiBuilder;

const uiIndex = `${patternlab.config.paths.public.root}/index.html`;
const styleguideIndex = `${patternlab.config.paths.source.styleguide}/index.mustache`;
const styleguideViewAll = `${patternlab.config.paths.public.styleguide}/styleguide.html`;
const uiCss = `${patternlab.config.paths.public.styleguide}/styles/ui.css`;

if (fs.existsSync(uiIndex)) {
  fs.unlinkSync(uiIndex);
}
if (fs.existsSync(styleguideIndex)) {
  fs.unlinkSync(styleguideIndex);
}
if (fs.existsSync(styleguideViewAll)) {
  fs.unlinkSync(styleguideViewAll);
}
if (fs.existsSync(uiCss)) {
  fs.unlinkSync(uiCss);
}

const uiIndexExistsBefore = fs.existsSync(uiIndex);
const styleguideIndexExistsBefore = fs.existsSync(styleguideIndex);
const styleguideViewAllExistsBefore = fs.existsSync(styleguideViewAll);
const uiCssExistsBefore = fs.existsSync(uiCss);

describe('UI Compiler', function () {
  function compileui() {
    return patternlab.compileui()
      .then(() => {
        uiBuilder.main(patternlab);
      });
  }

  let cssContent;
  let indexContent;
  let viewAllContent;

  before(async function () {
    // Preprocess the patternlab object.
    patternlab.buildViewAll();
    patternlab.preprocessAllPatterns(patternsDir);
    patternlab.preprocessDataAndParams();
    patternlab.prepWrite();
    await compileui();

    cssContent = fs.readFileSync(uiCss, patternlab.enc);
    indexContent = fs.readFileSync(styleguideIndex, patternlab.enc);
    viewAllContent = fs.readFileSync(styleguideViewAll, patternlab.enc);
  });

  it('should write index.html', function () {
    const uiIndexExistsAfter = fs.existsSync(uiIndex);

    expect(uiIndexExistsBefore).to.equal(false);
    expect(uiIndexExistsAfter).to.equal(true);
  });

  it('should write index.mustache', function () {
    const styleguideIndexExistsAfter = fs.existsSync(styleguideIndex);

    expect(styleguideIndexExistsBefore).to.equal(false);
    expect(styleguideIndexExistsAfter).to.equal(true);
  });

  it('should write styleguide.html', function () {
    const styleguideViewAllExistsAfter = fs.existsSync(styleguideViewAll);

    expect(styleguideViewAllExistsBefore).to.equal(false);
    expect(styleguideViewAllExistsAfter).to.equal(true);
  });

  it('should write ui.css', function () {
    const uiCssExistsAfter = fs.existsSync(uiCss);

    expect(uiCssExistsBefore).to.equal(false);
    expect(uiCssExistsAfter).to.equal(true);
  });

  it('should override viewall.mustache with custom code', function () {
    expect(viewAllContent.indexOf('<h1>foo</h1>')).to.be.above(-1);
    expect(viewAllContent.indexOf('<h2>bar</h2>')).to.be.above(-1);
    expect(viewAllContent.indexOf('<h3>baz</h3>')).to.be.above(-1);
  });

  it(
    // eslint-disable-next-line max-len
    'should recognize a similarly named and hierarchically structured custom component module and overrides its corresponding core component module',
    function () {
      expect(indexContent.indexOf('id="foo"')).to.be.above(-1);
    }
  );

  it(
    // eslint-disable-next-line max-len
    'should recognize that a component has a custom sibling not in core and adds this sibling and its descendents to the DOM',
    function () {
      expect(indexContent.indexOf('<div>bar</div>')).to.be.above(-1);
    }
  );

  it(
    // eslint-disable-next-line max-len
    'should recognize that a component at the end of branch has a custom child not in core and adds this child and its descendents to the DOM',
    function () {
      expect(indexContent.indexOf('<div>baz</div>')).to.be.above(-1);
    }
  );

  it('should override componentized css', function () {
    expect(cssContent.indexOf('/* foo */')).to.be.above(-1);
  });

  it('should recognize additional custom componentized css', function () {
    expect(cssContent.indexOf('/* bar */')).to.be.above(-1);
  });
});
