'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

require('../init');

const fepper = global.fepper;
const {
  conf,
  ui
} = fepper;

const cssRootPublic = conf.ui.paths.public.css;
const cssBldPublic = conf.ui.paths.public.cssBld;
const imagesPublic = conf.ui.paths.public.images;
const jsPublic = conf.ui.paths.public.js;
const patternsPublic = conf.ui.paths.public.patterns;
const staticPublic = conf.ui.paths.public.static;
const indexHtmlPublic = `${conf.ui.paths.public.root}/index.html`;

describe('UI', function () {
  describe('.build()', function () {
    let patternsPublicContentsBefore;

    before(function () {
      ui.clean();

      patternsPublicContentsBefore = fs.readdirSync(patternsPublic);

      ui.build();
    });

    it('writes to the public patterns directory when passed no argument', function () {
      const patternsPublicContentsAfter = fs.readdirSync(patternsPublic);

      expect(patternsPublicContentsBefore).to.be.empty;
      expect(patternsPublicContentsAfter).to.not.be.empty;
    });

    it('prints help text when passed "help" argument', function () {
      ui.build('help');
    });

    it('prints help text when passed incorrect argument', function () {
      ui.build('hepl');
    });
  });

  describe('.clean()', function () {
    let patternsPublicContentsBefore;

    before(function () {
      ui.clean();

      patternsPublicContentsBefore = fs.readdirSync(patternsPublic);

      // Repopulate patterns for future tests.
      ui.build();
    });

    it('empties the public patterns directory', function () {
      expect(patternsPublicContentsBefore).to.be.empty;
    });
  });

  describe('.compile()', function () {
    let indexHtmlPublicExistsBefore;

    before(function () {
      fs.removeSync(indexHtmlPublic);

      indexHtmlPublicExistsBefore = fs.existsSync(indexHtmlPublic);

      ui.compile();
    });

    it('compiles the UI index file', function () {
      const indexHtmlPublicExistsAfter = fs.existsSync(indexHtmlPublic);

      expect(indexHtmlPublicExistsBefore).to.be.false;

      expect(indexHtmlPublicExistsAfter).to.be.true;
    });
  });

  describe('.copyAssets()', function () {
    let imagesPublicContentsBefore;

    before(function () {
      fs.emptyDirSync(imagesPublic);

      imagesPublicContentsBefore = fs.readdirSync(imagesPublic);

      ui.copyAssets();
    });

    it('copies the _assets directory', function () {
      const imagesPublicContentsAfter = fs.readdirSync(imagesPublic).toString();
      const imagesPublicContentsAfter1 = fs.readdirSync(`${imagesPublic}/_nosync`).toString();

      expect(imagesPublicContentsBefore).to.be.empty;

      expect(imagesPublicContentsAfter).to.equal('_nosync,logo.png');
      expect(imagesPublicContentsAfter1).to.equal('nosync.png');
    });
  });

  describe('.copyScripts()', function () {
    let jsPublicContentsBefore;

    before(function () {
      fs.emptyDirSync(jsPublic);

      jsPublicContentsBefore = fs.readdirSync(jsPublic);

      ui.copyScripts();
    });

    it('copies the _scripts directory', function () {
      const jsPublicContentsAfter = fs.readdirSync(jsPublic).toString();
      const jsPublicContentsAfter1 = fs.readdirSync(`${jsPublic}/src`).toString();
      const jsPublicContentsAfter2 = fs.readdirSync(`${jsPublic}/src/nested`).toString();

      expect(jsPublicContentsBefore).to.be.empty;

      expect(jsPublicContentsAfter).to.equal('src,ui-only.js');
      expect(jsPublicContentsAfter1).to.equal('fepper-obj.js,nested,variables-alt.styl,variables-alt.yml,variables.styl');
      expect(jsPublicContentsAfter2).to.equal('nested.js');
    });
  });

  describe('.copyStylesRoot()', function () {
    let cssRootPublicContentsBefore;

    before(function () {
      fs.removeSync(`${cssRootPublic}/root.css`);
      fs.removeSync(`${cssRootPublic}/root.svg`);

      cssRootPublicContentsBefore = fs.readdirSync(cssRootPublic);

      ui.copyStylesRoot();
    });

    it('copies files in top level of the _styles directory', function () {
      const cssRootPublicContentsAfter = fs.readdirSync(cssRootPublic);

      expect(cssRootPublicContentsBefore).to.not.include('root.css');
      expect(cssRootPublicContentsBefore).to.not.include('root.svg');

      expect(cssRootPublicContentsAfter).to.include('root.css');
      expect(cssRootPublicContentsAfter).to.include('root.svg');
    });
  });

  describe('.copyStylesBld()', function () {
    let cssBldPublicContentsBefore;

    before(function () {
      fs.emptyDirSync(cssBldPublic);

      cssBldPublicContentsBefore = fs.readdirSync(cssBldPublic);

      ui.copyStylesBld();
    });

    it('copies .css files in the _styles/bld directory', function () {
      const cssBldPublicContentsAfter = fs.readdirSync(cssBldPublic);

      expect(cssBldPublicContentsBefore).to.be.empty;

      expect(cssBldPublicContentsAfter).to.include('__style.dev.css');
      expect(cssBldPublicContentsAfter).to.include('style-alt.css');
      expect(cssBldPublicContentsAfter).to.include('style.css');
    });
  });

  describe('.copyStylesOther()', function () {
    let cssBldPublicContentsBefore;

    before(function () {
      fs.emptyDirSync(cssBldPublic);

      cssBldPublicContentsBefore = fs.readdirSync(cssBldPublic);

      ui.copyStylesOther();
    });

    it('copies other files in the _styles/bld directory that do not have the .css extension', function () {
      const cssBldPublicContentsAfter = fs.readdirSync(cssBldPublic);
      const cssBldPublicContentsAfter1 = fs.readdirSync(`${cssBldPublic}/fonts`);
      const cssBldPublicContentsAfter2 = fs.readdirSync(`${cssBldPublic}/fonts/nested`);

      expect(cssBldPublicContentsBefore).to.be.empty;

      expect(cssBldPublicContentsAfter).to.include('style-alt.yml');
      expect(cssBldPublicContentsAfter1).to.include('__icons.dev.svg');
      expect(cssBldPublicContentsAfter1).to.include('icons-alt.svg');
      expect(cssBldPublicContentsAfter1).to.include('icons-alt.yml');
      expect(cssBldPublicContentsAfter1).to.include('icons.svg');
      expect(cssBldPublicContentsAfter2).to.include('__icons.dev.svg');
      expect(cssBldPublicContentsAfter2).to.include('icons.nested-alt.svg');
      expect(cssBldPublicContentsAfter2).to.include('icons.nested-alt.yml');
      expect(cssBldPublicContentsAfter2).to.include('icons.nested.svg');
    });
  });

  // Test .copyStatic() after all else has been built and copied.
  describe('.copyStatic()', function () {
    let staticPublicContentsBefore;

    before(function () {
      fs.emptyDirSync(staticPublic);

      staticPublicContentsBefore = fs.readdirSync(staticPublic);

      fepper.tasks.staticGenerator.main();
      ui.copyStatic();
    });

    it('copies the _static directory', function () {
      const staticPublicContentsAfter = fs.readdirSync(staticPublic).toString();
      const staticPublicContentsAfter1 = fs.readdirSync(`${staticPublic}/_assets`).toString();
      const staticPublicContentsAfter2 = fs.readdirSync(`${staticPublic}/_scripts`).toString();
      const staticPublicContentsAfter3 = fs.readdirSync(`${staticPublic}/_styles`).toString();
      const staticPublicContentsAfter4 = fs.readdirSync(`${staticPublic}/img`).toString();
      const staticPublicContentsAfter5 = fs.readdirSync(`${staticPublic}/_assets/_nosync`).toString();
      const staticPublicContentsAfter6 = fs.readdirSync(`${staticPublic}/_scripts/src`).toString();
      const staticPublicContentsAfter7 = fs.readdirSync(`${staticPublic}/_styles/bld`).toString();
      const staticPublicContentsAfter8 = fs.readdirSync(`${staticPublic}/_scripts/src/nested`).toString();
      const staticPublicContentsAfter9 = fs.readdirSync(`${staticPublic}/_styles/bld/fonts`).toString();
      const staticPublicContentsAfter10 = fs.readdirSync(`${staticPublic}/_styles/bld/fonts/nested`).toString();

      expect(staticPublicContentsBefore).to.be.empty;

      expect(staticPublicContentsAfter).to.equal('01-blog.html,_assets,_scripts,_styles,img,index.html,node_modules');
      expect(staticPublicContentsAfter1).to.equal('_nosync,logo.png');
      expect(staticPublicContentsAfter2).to.equal('src');
      expect(staticPublicContentsAfter3).to.equal('bld,root.css,root.svg');
      expect(staticPublicContentsAfter4).to.equal('logo.png');
      expect(staticPublicContentsAfter5).to.equal('nosync.png');
      expect(staticPublicContentsAfter6)
        .to.equal('fepper-obj.js,nested,variables-alt.styl,variables-alt.yml,variables.styl');
      expect(staticPublicContentsAfter7).to.equal('fonts,style-alt.yml');
      expect(staticPublicContentsAfter8).to.equal('nested.js');
      expect(staticPublicContentsAfter9).to.equal('__icons.dev.svg,icons-alt.svg,icons-alt.yml,icons.svg,nested');
      expect(staticPublicContentsAfter10)
        .to.equal('__icons.dev.svg,icons.nested-alt.svg,icons.nested-alt.yml,icons.nested.svg');
    });
  });
});
