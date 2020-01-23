'use strict';

const diveSync = require('diveSync');
const {expect} = require('chai');
const fs = require('fs-extra');
const slash = require('slash');

const {
  fepper
} = require('../init')();
const {
  conf,
  pref,
  tasks,
  utils
} = fepper;
const staticGenerator = tasks.staticGenerator;

const assetsPublic = conf.ui.paths.public.images;
const patternsPublic = conf.ui.paths.public.patterns;
const scriptsPublic = conf.ui.paths.public.js;
const staticSource = conf.ui.paths.source.static;
const stylesPublic = conf.ui.paths.public.css;

const hashesFile = `${patternsPublic}/hashes.json`;
const publicIndex = `${patternsPublic}/04-pages-00-homepage/04-pages-00-homepage.html`;
const staticIndex = `${staticSource}/index.html`;
const staticSibling = `${staticSource}/01-blog.html`;

function glob(topDir, globArr) {
  diveSync(
    topDir,
    (err, file) => {
      if (err) {
        utils.error(err);
      }

      globArr.push(slash(file));
    }
  );
}

describe('Static Generator', function () {
  let dataJson;
  let publicIndexContent;
  let staticIndexContent;
  let staticIndexExistsBefore;
  let staticSiblingContent;
  let staticSiblingExistsBefore;

  before(function () {
    dataJson = utils.data();

    if (fs.existsSync(hashesFile)) {
      fs.removeSync(hashesFile);
    }
    if (fs.existsSync(staticIndex)) {
      fs.removeSync(staticIndex);
    }
    if (fs.existsSync(staticSibling)) {
      fs.removeSync(staticSibling);
    }

    staticIndexExistsBefore = fs.existsSync(staticIndex);
    staticSiblingExistsBefore = fs.existsSync(staticSibling);

    fepper.ui.build();

    publicIndexContent = fs.readFileSync(publicIndex, conf.enc);

    tasks.staticGenerate();

    staticIndexContent = fs.readFileSync(staticIndex, conf.enc);
    staticSiblingContent = fs.readFileSync(staticSibling, conf.enc);
  });

  it('copies assets to the static dir', function () {
    const assetsStatic = `${staticSource}/_assets`;

    // Clear out test dir.
    fs.removeSync(assetsStatic);

    // Check that test dir doesn't exist at beginning of test.
    const existsBefore = fs.existsSync(assetsStatic);

    // Copy test dir.
    staticGenerator.copyAssetsDir();

    // Compare src and dest by converting their glob arrays to strings
    const globSrc = [];
    const globDest = [];

    glob(assetsPublic, globSrc);
    glob(assetsStatic, globDest);

    for (let i = 0; i < globSrc.length; i++) {
      globSrc[i] = globSrc[i].replace(assetsPublic, '');
    }

    for (let i = 0; i < globDest.length; i++) {
      globDest[i] = globDest[i].replace(assetsStatic, '');
    }

    const globStrSrc = globSrc.toString();
    const globStrDest = globDest.toString();

    // Test expectations.
    expect(existsBefore).to.be.false;

    expect(globStrSrc).to.equal(globStrDest);
  });

  it('copies scripts nested one or more dirs below the scripts dir to the static dir', function () {
    const scriptsDir = `${staticSource}/_scripts`;

    // Clear out test dir.
    fs.removeSync(scriptsDir);

    // Check that test dir doesn't exist at beginning of test.
    const existsBefore = fs.existsSync(scriptsDir);

    // Copy test dir.
    staticGenerator.copyScriptsDir();

    // Compare src and dest by converting their glob arrays to strings
    const globSrc = [];
    const globDest = [];

    // Traverse one level down before globbing.
    // Choosing for...of loop and its readability in exchange for performance.
    for (let basenameAtLevel0 of fs.readdirSync(scriptsPublic)) {
      const level0 = scriptsPublic;

      try {
        const fileAtLevel0 = `${level0}/${basenameAtLevel0}`;
        const statAtLevel0 = fs.statSync(fileAtLevel0);

        if (statAtLevel0.isDirectory()) {
          glob(fileAtLevel0, globSrc);
        }
      }
      catch (err) {
        utils.error(err);
      }
    }

    // Again for destination.
    for (let basenameAtLevel0 of fs.readdirSync(scriptsDir)) {
      const level0 = scriptsDir;

      try {
        const fileAtLevel0 = `${level0}/${basenameAtLevel0}`;
        const statAtLevel0 = fs.statSync(fileAtLevel0);

        if (statAtLevel0.isDirectory()) {
          glob(fileAtLevel0, globDest);
        }
      }
      catch (err) {
        utils.error(err);
      }
    }

    for (let i = 0; i < globSrc.length; i++) {
      globSrc[i] = globSrc[i].replace(scriptsPublic, '');
    }

    for (let i = 0; i < globDest.length; i++) {
      globDest[i] = globDest[i].replace(scriptsDir, '');
    }

    const globStrSrc = globSrc.toString();
    const globStrDest = globDest.toString();

    // Test expectations.
    expect(existsBefore).to.be.false;

    expect(globStrSrc).to.equal(globStrDest);
  });

  it('does not copy scripts at the root level of the scripts dir to the static dir', function () {
    const scriptsSource = conf.ui.paths.source.js;
    const scriptsStatic = `${staticSource}/_scripts`;
    const testFile = 'ui-only.js';

    // Copy test dir if previous test didn't already do so.
    if (!fs.existsSync(scriptsStatic)) {
      staticGenerator.copyScriptsDir();
    }

    // Test expectations.
    expect(fs.existsSync(`${scriptsSource}/${testFile}`)).to.be.true;
    expect(fs.existsSync(`${scriptsStatic}/${testFile}`)).to.be.false;
  });

  it('copies styles to the static dir', function () {
    const stylesStatic = `${staticSource}/_styles`;

    // Clear out test dir.
    fs.removeSync(stylesStatic);

    // Check that test dir doesn't exist at beginning of test.
    const existsBefore = fs.existsSync(stylesStatic);

    // Copy test dir.
    staticGenerator.copyStylesDir();

    // Compare src and dest by converting their glob arrays to strings
    const globPublic = [];
    const globDest = [];

    glob(stylesPublic, globPublic);
    glob(stylesStatic, globDest);

    for (let i = 0; i < globPublic.length; i++) {
      globPublic[i] = globPublic[i].replace(stylesPublic, '');
    }

    for (let i = 0; i < globDest.length; i++) {
      globDest[i] = globDest[i].replace(stylesStatic, '');
    }

    const globStrSrc = globPublic.toString();
    const globStrDest = globDest.toString();

    // Test expectations.
    expect(existsBefore).to.be.false;

    expect(globStrSrc).to.equal(globStrDest);
  });

  it('copies webserved_dirs to the static dir', function () {
    // Get array of truncated dirnames.
    const webservedDirs = utils.webservedDirnamesTruncate(pref.backend.webserved_dirs);

    // Run copy operation.
    utils.webservedDirsCopy(pref.backend.webserved_dirs, webservedDirs, staticSource);

    let pass = true;

    for (let i = 0; i < webservedDirs.length; i++) {
      const stat = fs.statSync(`${staticSource}/${webservedDirs[i]}`);

      if (!stat.isDirectory()) {
        pass = false;

        break;
      }
    }

    // Test expectations.
    expect(pass).to.be.true;
  });

  it('writes static/index.html', function () {
    const staticIndexExistsAfter = fs.existsSync(staticIndex);

    // Test expectations.
    expect(staticIndexExistsBefore).to.be.false;

    expect(staticIndexExistsAfter).to.be.true;
    expect(staticIndexContent).to.not.equal('');
  });

  it('writes static/01-blog.html', function () {
    const staticSiblingExistsAfter = fs.existsSync(staticSibling);

    // Test expectations.
    expect(staticSiblingExistsBefore).to.be.false;

    expect(staticSiblingExistsAfter).to.be.true;
    expect(staticSiblingContent).to.not.equal('');
  });

  it('strips Pattern Lab code', function () {
    // Test expectations.
    expect(publicIndexContent).to.have.string('<!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->');
    expect(publicIndexContent).to.have.string('<!-- End Pattern Lab -->');
    // eslint-disable-next-line max-len
    expect(staticIndexContent).to.not.have.string('<!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->');
    expect(staticIndexContent).to.not.have.string('<!-- End Pattern Lab -->');
  });

  it('strips cacheBusters from static content', function () {
    const testStringOrig = `
  <script src="../../_scripts/src/variables.styl?1513596429153" type="text/javascript"></script>
  <script src='../../_scripts/src/fepper-obj.js?1513596429153'></script>`;
    const testRegex = /<script src="\.\.\/\.\.\/_scripts\/src\/variables.styl\?\d+" type="text\/javascript"><\/script>/;
    const testRegex1 = /<script src="\.\.\/\.\.\/_scripts\/src\/fepper-obj.js\?\d+"><\/script>/;
    const testStringConverted = staticGenerator.convertCacheBusters(testStringOrig);
    const uiConfOrig = JSON.parse(JSON.stringify(fepper.ui.patternlab.config));

    if (fs.existsSync(hashesFile)) {
      fs.removeSync(hashesFile);
    }

    fepper.ui.patternlab.build({cacheBust: true});
    fepper.ui.patternlab.resetConfig(uiConfOrig);

    const cacheBusterTestBefore = fs.readFileSync(publicIndex, conf.enc);
    const cacheBusterTestAfter = fs.readFileSync(staticIndex, conf.enc);

    expect(testStringConverted).to.equal(`
  <script src="../../_scripts/src/variables.styl" type="text/javascript"></script>
  <script src='../../_scripts/src/fepper-obj.js'></script>`);
    expect(cacheBusterTestBefore).to.match(testRegex);
    expect(cacheBusterTestBefore).to.match(testRegex1);

    expect(cacheBusterTestAfter).to.not.match(testRegex);
    expect(cacheBusterTestAfter).to.not.match(testRegex1);

    // Ignore path conversion in this test.
    expect(cacheBusterTestAfter).to.have.string('_scripts/src/variables.styl" type="text/javascript"></script>');
    expect(cacheBusterTestAfter).to.have.string('_scripts/src/fepper-obj.js"></script>');
  });

  it('converts Fepper relative paths to portable static relative paths', function () {
    const testStringOrig = `
  <script src="../../_scripts/src/variables.styl?1513596429153" type="text/javascript"></script>
  <script src='../../_scripts/src/fepper-obj.js?1513596429153'></script>`;
    const testStringConverted = staticGenerator.convertPaths(testStringOrig);

    expect(testStringConverted).to.equal(`
  <script src="_scripts/src/variables.styl?1513596429153" type="text/javascript"></script>
  <script src='_scripts/src/fepper-obj.js?1513596429153'></script>`);

    // Ignore cacheBuster conversion in this test.
    // eslint-disable-next-line max-len
    expect(publicIndexContent).to.have.string('<script src="../../_scripts/src/variables.styl" type="text/javascript"></script>');
    expect(publicIndexContent).to.have.string('<script src="../../_scripts/src/fepper-obj.js"></script>');

    expect(staticIndexContent).to.have.string('<script src="_scripts/src/variables.styl');
    expect(staticIndexContent).to.have.string('<script src="_scripts/src/fepper-obj.js');
  });

  it('converts double-quoted absolute Fepper homepage links to portable, static index page links', function () {
    const testStringOrig = '<a href="/patterns/04-pages-00-homepage/04-pages-00-homepage.html">';
    const testStringConverted = staticGenerator.convertLinksHomepage(testStringOrig, dataJson.homepage);

    expect(testStringConverted).to.equal('<a href="index.html">');
  });

  it('converts double-quoted one-level deep relative Fepper homepage links to portable, static index page links\
', function () {
    const testStringOrig = '<a HREF="../04-pages-00-homepage/04-pages-00-homepage.html">';
    const testStringConverted = staticGenerator.convertLinksHomepage(testStringOrig, dataJson.homepage);

    expect(testStringConverted).to.equal('<a HREF="index.html">');
  });

  it('converts double-quoted two-levels deep relative Fepper homepage links to portable, static index page links\
', function () {
    const testStringOrig = '<a href="../../patterns/04-pages-00-homepage/04-pages-00-homepage.html">';
    const testStringConverted = staticGenerator.convertLinksHomepage(testStringOrig, dataJson.homepage);

    expect(testStringConverted).to.equal('<a href="index.html">');
  });

  it('converts single-quoted absolute Fepper homepage links to portable, static index page links', function () {
    const testStringOrig = '<a HREF=\'/patterns/04-pages-00-homepage/04-pages-00-homepage.html\'>';
    const testStringConverted = staticGenerator.convertLinksHomepage(testStringOrig, dataJson.homepage);

    expect(testStringConverted).to.equal('<a HREF=\'index.html\'>');
  });

  it('converts single-quoted one-level deep relative Fepper homepage links to portable, static index page links\
', function () {
    const testStringOrig = '<a href=\'../04-pages-00-homepage/04-pages-00-homepage.html\'>';
    const testStringConverted = staticGenerator.convertLinksHomepage(testStringOrig, dataJson.homepage);

    expect(testStringConverted).to.equal('<a href=\'index.html\'>');
  });

  it('converts single-quoted two-levels deep relative Fepper homepage links to portable, static index page links\
', function () {
    const testStringOrig = '<a HREF=\'../../patterns/04-pages-00-homepage/04-pages-00-homepage.html\'>';
    const testStringConverted = staticGenerator.convertLinksHomepage(testStringOrig, dataJson.homepage);

    expect(testStringConverted).to.equal('<a HREF=\'index.html\'>');
  });

  it('converts double-quoted absolute Fepper sibling links to portable, static sibling page links', function () {
    const testStringOrig = '<a HREF="/patterns/04-pages-01-blog/04-pages-01-blog.html">';
    const testStringConverted = staticGenerator.convertLinksSibling(testStringOrig);

    expect(testStringConverted).to.equal('<a HREF="01-blog.html">');
  });

  it('converts double-quoted one-level deep relative Fepper sibling links to portable, static sibling page links\
', function () {
    const testStringOrig = '<a href="../04-pages-01-blog/04-pages-01-blog.html">';
    const testStringConverted = staticGenerator.convertLinksSibling(testStringOrig);

    expect(testStringConverted).to.equal('<a href="01-blog.html">');
  });

  it('converts double-quoted two-levels deep relative Fepper sibling links to portable, static sibling page links\
', function () {
    const testStringOrig = '<a HREF="../../patterns/04-pages-01-blog/04-pages-01-blog.html">';
    const testStringConverted = staticGenerator.convertLinksSibling(testStringOrig);

    expect(testStringConverted).to.equal('<a HREF="01-blog.html">');
  });

  it('converts single-quoted absolute Fepper sibling links to portable, static sibling page links', function () {
    const testStringOrig = '<a href=\'/patterns/04-pages-01-blog/04-pages-01-blog.html\'>';
    const testStringConverted = staticGenerator.convertLinksSibling(testStringOrig);

    expect(testStringConverted).to.equal('<a href=\'01-blog.html\'>');
  });

  it('converts single-quoted one-level deep relative Fepper sibling links to portable, static sibling page links\
', function () {
    const testStringOrig = '<a HREF=\'../04-pages-01-blog/04-pages-01-blog.html\'>';
    const testStringConverted = staticGenerator.convertLinksSibling(testStringOrig);

    expect(testStringConverted).to.equal('<a HREF=\'01-blog.html\'>');
  });

  it('converts single-quoted two-levels deep relative Fepper sibling links to portable, static sibling page links\
', function () {
    const testStringOrig = '<a href=\'../../patterns/04-pages-01-blog/04-pages-01-blog.html\'>';
    const testStringConverted = staticGenerator.convertLinksSibling(testStringOrig);

    expect(testStringConverted).to.equal('<a href=\'01-blog.html\'>');
  });
});
