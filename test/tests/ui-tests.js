'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

const {
  fepper
} = require('../init')();
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
      const imagesPublicContentsAfter = fs.readdirSync(imagesPublic);
      const imagesPublicContentsAfter1 = fs.readdirSync(`${imagesPublic}/_nosync`);
      const imagesPublicContentsAfter2 = fs.readdirSync(`${imagesPublic}/src`);

      expect(imagesPublicContentsBefore).to.be.empty;

      expect(imagesPublicContentsAfter).to.include('_nosync');
      expect(imagesPublicContentsAfter1).to.include('nosync.png');
      expect(imagesPublicContentsAfter2).to.include('logo.png');
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
      const jsPublicContentsAfter = fs.readdirSync(jsPublic);
      const jsPublicContentsAfter1 = fs.readdirSync(`${jsPublic}/src`);
      const jsPublicContentsAfter2 = fs.readdirSync(`${jsPublic}/src/nested`);

      expect(jsPublicContentsBefore).to.be.empty;

      expect(jsPublicContentsAfter).to.include('src');
      expect(jsPublicContentsAfter).to.include('ui-only.js');

      expect(jsPublicContentsAfter1).to.include('nested');
      expect(jsPublicContentsAfter1).to.include('variables-alt.styl');
      expect(jsPublicContentsAfter1).to.include('variables-alt.yml');
      expect(jsPublicContentsAfter1).to.include('variables.styl');

      expect(jsPublicContentsAfter2).to.include('nested.js');
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
      const staticPublicContentsAfter = fs.readdirSync(staticPublic);
      const staticPublicContentsAfter1 = fs.readdirSync(`${staticPublic}/_assets`);
      const staticPublicContentsAfter2 = fs.readdirSync(`${staticPublic}/_assets/src`);
      const staticPublicContentsAfter3 = fs.readdirSync(`${staticPublic}/_scripts`);
      const staticPublicContentsAfter4 = fs.readdirSync(`${staticPublic}/_styles`);
      const staticPublicContentsAfter5 = fs.readdirSync(`${staticPublic}/img`);
      const staticPublicContentsAfter6 = fs.readdirSync(`${staticPublic}/_assets/_nosync`);
      const staticPublicContentsAfter7 = fs.readdirSync(`${staticPublic}/_scripts/src`);
      const staticPublicContentsAfter8 = fs.readdirSync(`${staticPublic}/_styles/bld`);
      const staticPublicContentsAfter9 = fs.readdirSync(`${staticPublic}/_scripts/src/nested`);
      const staticPublicContentsAfter10 = fs.readdirSync(`${staticPublic}/_styles/bld/fonts`);
      const staticPublicContentsAfter11 = fs.readdirSync(`${staticPublic}/_styles/bld/fonts/nested`);

      expect(staticPublicContentsBefore).to.be.empty;

      expect(staticPublicContentsAfter).to.include('blog.html');
      expect(staticPublicContentsAfter).to.include('_assets');
      expect(staticPublicContentsAfter).to.include('_scripts');
      expect(staticPublicContentsAfter).to.include('_styles');
      expect(staticPublicContentsAfter).to.include('img');
      expect(staticPublicContentsAfter).to.include('index.html');
      expect(staticPublicContentsAfter).to.include('node_modules');

      expect(staticPublicContentsAfter1).to.include('_nosync');
      expect(staticPublicContentsAfter2).to.include('logo.png');

      expect(staticPublicContentsAfter3).to.include('src');

      expect(staticPublicContentsAfter4).to.include('bld');
      expect(staticPublicContentsAfter4).to.include('root.css');
      expect(staticPublicContentsAfter4).to.include('root.svg');

      expect(staticPublicContentsAfter5).to.include('logo.png');

      expect(staticPublicContentsAfter6).to.include('nosync.png');

      expect(staticPublicContentsAfter7).to.include('nested');
      expect(staticPublicContentsAfter7).to.include('variables-alt.styl');
      expect(staticPublicContentsAfter7).to.include('variables-alt.yml');
      expect(staticPublicContentsAfter7).to.include('variables.styl');

      expect(staticPublicContentsAfter8).to.include('fonts');
      expect(staticPublicContentsAfter8).to.include('style-alt.yml');

      expect(staticPublicContentsAfter9).to.include('nested.js');

      expect(staticPublicContentsAfter10).to.include('__icons.dev.svg');
      expect(staticPublicContentsAfter10).to.include('icons-alt.svg');
      expect(staticPublicContentsAfter10).to.include('icons-alt.yml');
      expect(staticPublicContentsAfter10).to.include('icons.svg');
      expect(staticPublicContentsAfter10).to.include('nested');

      expect(staticPublicContentsAfter11).to.include('__icons.dev.svg');
      expect(staticPublicContentsAfter11).to.include('icons.nested-alt.svg');
      expect(staticPublicContentsAfter11).to.include('icons.nested-alt.yml');
      expect(staticPublicContentsAfter11).to.include('icons.nested.svg');
    });
  });
});
