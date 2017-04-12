'use strict';

const fs = require('fs-extra');
const path = require('path');

const config = require('./patternlab-config.json');
const cwd = `${process.cwd()}/test`;
const enc = 'utf8';
const paths = config.paths;
const plMain = new (require('../core/lib/patternlab'))(config, cwd);

const uiIndex = path.resolve(cwd, paths.public.root, 'index.html');
const styleguideIndex = path.resolve(cwd, paths.source.styleguide, 'index.mustache');
const styleguideViewAll = path.resolve(cwd, paths.public.styleguide, 'styleguide.html');
const uiCss = path.resolve(cwd, paths.public.styleguide, 'styles/ui.css');

let uiIndexExistsBefore = fs.existsSync(uiIndex);
let styleguideIndexExistsBefore = fs.existsSync(styleguideIndex);
let styleguideViewAllExistsBefore = fs.existsSync(styleguideViewAll);
let uiCssExistsBefore = fs.existsSync(uiCss);

if (uiIndexExistsBefore) {
  fs.unlinkSync(uiIndex);
  uiIndexExistsBefore = fs.existsSync(uiIndex);
}
if (styleguideIndexExistsBefore) {
  fs.unlinkSync(styleguideIndex);
  styleguideIndexExistsBefore = fs.existsSync(styleguideIndex);
}
if (styleguideViewAllExistsBefore) {
  fs.unlinkSync(styleguideViewAll);
  styleguideViewAllExistsBefore = fs.existsSync(styleguideViewAll);
}
if (uiCssExistsBefore) {
  fs.unlinkSync(uiCss);
  uiCssExistsBefore = fs.existsSync(uiCss);
}

function forceCompile(patternlab) {
  return plMain.forceCompile()
    .then(() => {
      return plMain.buildFrontEnd(patternlab, () => {});
    });
}

let cssContent;
let indexContent;
let viewAllContent;

exports.ui_compiler = {
  'ui compiler writes index.html': async function (test) {
    test.expect(2);

    const pa = require('../core/lib/pattern_assembler');
    const pattern_assembler = new pa();
    const patternlab = fs.readJsonSync('./test/files/patternlab.json');
    patternlab.config = config;

    plMain.processAllPatternsIterative(
      pattern_assembler,
      (path.resolve(config.paths.source.patterns)),
      patternlab
    );

    plMain.buildViewAll(patternlab);
    await forceCompile(patternlab);

    cssContent = fs.readFileSync(uiCss, enc);
    indexContent = fs.readFileSync(styleguideIndex, enc);
    viewAllContent = fs.readFileSync(styleguideViewAll, enc);
    const uiIndexExistsAfter = fs.existsSync(uiIndex);

    test.equals(uiIndexExistsBefore, false);
    test.equals(uiIndexExistsAfter, true);

    test.done();
  },

  'ui compiler writes index.mustache': function (test) {
    test.expect(2);

    const styleguideIndexExistsAfter = fs.existsSync(styleguideIndex);

    test.equals(styleguideIndexExistsBefore, false);
    test.equals(styleguideIndexExistsAfter, true);

    test.done();
  },

  'ui compiler writes styleguide.html': function (test) {
    test.expect(2);

    const styleguideViewAllExistsAfter = fs.existsSync(styleguideViewAll);

    test.equals(styleguideViewAllExistsBefore, false);
    test.equals(styleguideViewAllExistsAfter, true);

    test.done();
  },

  'ui compiler writes ui.css': async function (test) {
    test.expect(2);

    const uiCssExistsAfter = fs.existsSync(uiCss);

    test.equals(uiCssExistsBefore, false);
    test.equals(uiCssExistsAfter, true);

    test.done();
  },

  'ui compiler overrides viewall.mustache with custom code': function (test) {
    test.expect(3);

    test.ok(viewAllContent.indexOf('<h1>foo</h1>') > -1);
    test.ok(viewAllContent.indexOf('<h2>bar</h2>') > -1);
    test.ok(viewAllContent.indexOf('<h3>baz</h3>') > -1);

    test.done();
  },

  // eslint-disable-next-line max-len
  'ui compiler recognizes a similarly named and hierarchically structured custom component module and overrides its corresponding core component module':
  function (test) {
    test.expect(1);

    test.ok(indexContent.indexOf('id="foo"') > -1);

    test.done();
  },

  // eslint-disable-next-line max-len
  'ui compiler recognizes that a component has a custom sibling not in core and adds this sibling and its descendents to the DOM':
  function (test) {
    test.expect(1);

    test.ok(indexContent.indexOf('<div>bar</div>') > -1);

    test.done();
  },

  // eslint-disable-next-line max-len
  'ui compiler recognizes that a component at the end of branch has a custom child not in core and adds this child and its descendents to the DOM':
  function (test) {
    test.expect(1);

    test.ok(indexContent.indexOf('<div>baz</div>') > -1);

    test.done();
  },

  'ui compiler overrides componentized css':
  function (test) {
    test.expect(1);

    test.ok(cssContent.indexOf('/* foo */') > -1);

    test.done();
  },

  'ui compiler recognizes additional custom componentized css':
  function (test) {
    test.expect(1);

    test.ok(cssContent.indexOf('/* bar */') > -1);

    test.done();
  }
};
