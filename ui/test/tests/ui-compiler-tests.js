'use strict';

const expect = require('chai').expect;
const fs = require('fs-extra');

const {
  patternlab
} = require('../test-harness')();

const uiIndex = `${patternlab.config.paths.public.root}/index.html`;
const uiCss = `${patternlab.config.paths.public.styleguide}/styles/ui.css`;
const uiJs = `${patternlab.config.paths.public.styleguide}/scripts/ui.js`;

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

describe('UI Builder', function () {
  let indexContent;
  let cssContent;
  let jsContent;

  before(function () {
    patternlab.compileui();
    patternlab.patternsonly();

    indexContent = fs.readFileSync(uiIndex, patternlab.enc);
    cssContent = fs.readFileSync(uiCss, patternlab.enc);
    jsContent = fs.readFileSync(uiJs, patternlab.enc);
  });

  it('should write index.html', function () {
    const uiIndexExistsAfter = fs.existsSync(uiIndex);

    expect(uiIndexExistsBefore).to.equal(false);
    expect(uiIndexExistsAfter).to.equal(true);
  });

  it('should write ui.css', function () {
    const uiCssExistsAfter = fs.existsSync(uiCss);

    expect(uiCssExistsBefore).to.equal(false);
    expect(uiCssExistsAfter).to.equal(true);
  });

  it('should write ui.js', function () {
    const uiJsExistsAfter = fs.existsSync(uiJs);

    expect(uiJsExistsBefore).to.equal(false);
    expect(uiJsExistsAfter).to.equal(true);
  });

  it(
    // eslint-disable-next-line max-len
    'should recognize a similarly named and hierarchically structured custom component module and overrides its corresponding core component module',
    function () {
      expect(indexContent).to.include('id="foo"');
    }
  );

  it(
    // eslint-disable-next-line max-len
    'should recognize that a component has a custom sibling not in core and adds this sibling and its descendents to the DOM',
    function () {
      expect(indexContent).to.include('<div>bar</div>');
    }
  );

  it(
    // eslint-disable-next-line max-len
    'should recognize that a component at the end of branch has a custom child not in core and adds this child and its descendents to the DOM',
    function () {
      expect(indexContent).to.include('<div>baz</div>');
    }
  );

  it('should override componentized css', function () {
    expect(cssContent).to.include('/* foo */');
  });

  it('should recognize additional custom componentized css', function () {
    expect(cssContent).to.include('/* bar */');
  });

  it('should override componentized js', function () {
    expect(jsContent).to.include('/* foo */');
  });

  it('should recognize additional custom componentized js', function () {
    expect(jsContent).to.include('/* bar */');
  });
});
