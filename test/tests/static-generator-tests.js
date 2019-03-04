'use strict';

const diveSync = require('diveSync');
const expect = require('chai').expect;
const fs = require('fs-extra');
const slash = require('slash');

require('../init');

const fepper = global.fepper;
const conf = fepper.conf;
const pref = fepper.pref;
const staticGenerator = fepper.tasks.staticGenerator;
const utils = fepper.utils;
const dataJson = utils.data();

const assetsSrc = conf.ui.paths.source.images;
const patternsPub = conf.ui.paths.public.patterns;
const scriptsSrc = conf.ui.paths.source.js;
const staticDir = conf.ui.paths.source.static;
const stylesSrc = conf.ui.paths.source.css;

const origIndex = `${patternsPub}/04-pages-00-homepage/04-pages-00-homepage.html`;
const origIndexContent = fs.readFileSync(origIndex, conf.enc);
const origSibling = `${patternsPub}/04-pages-01-blog/04-pages-01-blog.html`;
const origSiblingContent = fs.readFileSync(origSibling, conf.enc);

const staticIndex = `${staticDir}/index.html`;
const staticSibling = `${staticDir}/01-blog.html`;

if (fs.existsSync(staticIndex)) {
  fs.removeSync(staticIndex);
}
if (fs.existsSync(staticSibling)) {
  fs.removeSync(staticSibling);
}

const staticIndexExistsBefore = fs.existsSync(staticIndex);
const staticSiblingExistsBefore = fs.existsSync(staticSibling);

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
  let staticIndexExistsAfter;
  let staticSiblingExistsAfter;

  let staticIndexContent;
  let staticSiblingContent;

  before(function () {
    staticGenerator.generatePages();

    staticIndexExistsAfter = fs.existsSync(staticIndex);
    staticSiblingExistsAfter = fs.existsSync(staticSibling);

    staticIndexContent = fs.readFileSync(staticIndex, conf.enc);
    staticSiblingContent = fs.readFileSync(staticSibling, conf.enc);
  });

  it('should copy assets to the static dir', function () {
    const assetsDir = `${staticDir}/_assets`;

    // Clear out test dir.
    fs.removeSync(assetsDir);

    // Check that test dir doesn't exist at beginning of test.
    const existsBefore = fs.existsSync(assetsDir);

    // Copy test dir.
    staticGenerator.copyAssetsDir();

    // Compare src and dest by converting their glob arrays to strings
    const globSrc = [];
    const globDest = [];

    glob(assetsSrc, globSrc);
    glob(assetsDir, globDest);

    for (let i = 0; i < globSrc.length; i++) {
      globSrc[i] = globSrc[i].replace(assetsSrc, '');
    }

    for (let i = 0; i < globDest.length; i++) {
      globDest[i] = globDest[i].replace(assetsDir, '');
    }

    const globStrSrc = globSrc.toString();
    const globStrDest = globDest.toString();

    // Test expectations.
    expect(existsBefore).to.equal(false);
    expect(globStrSrc).to.equal(globStrDest);
  });

  it('should copy scripts nested one or more dirs below the scripts dir to the static dir', function () {
    const scriptsDir = `${staticDir}/_scripts`;

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
    for (let basenameAtLevel0 of fs.readdirSync(scriptsSrc)) {
      const level0 = scriptsSrc;

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
      globSrc[i] = globSrc[i].replace(scriptsSrc, '');
    }

    for (let i = 0; i < globDest.length; i++) {
      globDest[i] = globDest[i].replace(scriptsDir, '');
    }

    const globStrSrc = globSrc.toString();
    const globStrDest = globDest.toString();

    // Test expectations.
    expect(existsBefore).to.equal(false);
    expect(globStrSrc).to.equal(globStrDest);
  });

  it('should not copy scripts at the root level of the scripts dir to the static dir', function () {
    const scriptsDir = `${staticDir}/_scripts`;
    const testFile = 'patternlab-only.js';

    // Copy test dir if previous test didn't already do so.
    if (!fs.existsSync(scriptsDir)) {
      staticGenerator.copyScriptsDir();
    }

    // Test expectations.
    expect(fs.existsSync(`${scriptsSrc}/${testFile}`)).to.equal(true);
    expect(fs.existsSync(`${scriptsDir}/${testFile}`)).to.equal(false);
  });

  it('should copy styles to the static dir', function () {
    const stylesDir = `${staticDir}/_styles`;

    // Clear out test dir.
    fs.removeSync(stylesDir);

    // Check that test dir doesn't exist at beginning of test.
    const existsBefore = fs.existsSync(stylesDir);

    // Copy test dir.
    staticGenerator.copyStylesDir();

    // Compare src and dest by converting their glob arrays to strings
    const globSrc = [];
    const globDest = [];

    glob(stylesSrc, globSrc);
    glob(stylesDir, globDest);

    for (let i = 0; i < globSrc.length; i++) {
      globSrc[i] = globSrc[i].replace(stylesSrc, '');
    }

    for (let i = 0; i < globDest.length; i++) {
      globDest[i] = globDest[i].replace(stylesDir, '');
    }

    const globStrSrc = globSrc.toString();
    const globStrDest = globDest.toString();

    // Test expectations.
    expect(existsBefore).to.equal(false);
    expect(globStrSrc).to.equal(globStrDest);
  });

  it('should copy webserved_dirs to the static dir', function () {
    // Get array of truncated dirnames.
    const webservedDirs = utils.webservedDirnamesTruncate(pref.backend.webserved_dirs);

    // Run copy operation.
    utils.webservedDirsCopy(pref.backend.webserved_dirs, webservedDirs, staticDir);

    let pass = true;

    for (let i = 0; i < webservedDirs.length; i++) {
      const stat = fs.statSync(`${staticDir}/${webservedDirs[i]}`);

      if (!stat.isDirectory()) {
        pass = false;

        break;
      }
    }

    // Test expectations.
    expect(pass).to.equal(true);
  });

  it('should write static/index.html', function () {
    // Test expectations.
    expect(staticIndexExistsBefore).to.equal(false);
    expect(staticIndexExistsAfter).to.equal(true);
    expect(staticIndexContent).to.not.equal('');
  });

  it('should write static/01-blog.html', function () {
    // Test expectations.
    expect(staticSiblingExistsBefore).to.equal(false);
    expect(staticSiblingExistsAfter).to.equal(true);
    expect(staticSiblingContent).to.not.equal('');
  });

  it('should strip Pattern Lab code', function () {
    // Test expectations.
    expect(origIndexContent).to.include('<!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->');
    expect(origIndexContent).to.include('<!-- End Pattern Lab -->');
    expect(staticIndexContent).to.not.include('<!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->');
    expect(staticIndexContent).to.not.include('<!-- End Pattern Lab -->');
  });

  it('should strip cacheBusters from static content', function () {
    const testStringOrig = `
  <script src="../../_scripts/src/variables.styl?1513596429153" type="text/javascript"></script>
  <script src='../../_scripts/src/fepper-obj.js?1513596429153'></script>`;
    const testStringConverted = staticGenerator.convertCacheBusters(testStringOrig);

    expect(testStringConverted).to.equal(`
  <script src="../../_scripts/src/variables.styl" type="text/javascript"></script>
  <script src='../../_scripts/src/fepper-obj.js'></script>`);
    expect(origIndexContent).to.include(testStringOrig);
    expect(staticIndexContent).to.not.include(testStringOrig);

    // Ignore path conversion in this test.
    expect(staticIndexContent).to.include('_scripts/src/variables.styl" type="text/javascript"></script>');
    expect(staticIndexContent).to.include('_scripts/src/fepper-obj.js\'></script>');
  });

  it('should convert Fepper relative paths to portable static relative paths', function () {
    const testStringOrig = `
  <script src="../../_scripts/src/variables.styl?1513596429153" type="text/javascript"></script>
  <script src='../../_scripts/src/fepper-obj.js?1513596429153'></script>`;
    const testStringConverted = staticGenerator.convertPaths(testStringOrig);

    expect(testStringConverted).to.equal(`
  <script src="_scripts/src/variables.styl?1513596429153" type="text/javascript"></script>
  <script src='_scripts/src/fepper-obj.js?1513596429153'></script>`);
    expect(origIndexContent).to.include(testStringOrig);
    expect(staticIndexContent).to.not.include(testStringOrig);

    // Ignore cacheBuster conversion in this test.
    expect(staticIndexContent).to.include('<script src="_scripts/src/variables.styl');
    expect(staticIndexContent).to.include('<script src=\'_scripts/src/fepper-obj.js');
  });

  it('should convert double-quoted absolute Fepper homepage links to portable, static index page links', function () {
    const testStringOrig = '<a href="/patterns/04-pages-00-homepage/04-pages-00-homepage.html">';
    const testStringConverted = staticGenerator.convertLinksHomepage(testStringOrig, dataJson.homepage);

    expect(testStringConverted).to.equal('<a href="index.html">');
    expect(origSiblingContent).to.include(testStringOrig);
    expect(origSiblingContent).to.not.include(testStringConverted);
    expect(staticSiblingContent).to.not.include(testStringOrig);
    expect(staticSiblingContent).to.include(testStringConverted);
  });

  it('should convert double-quoted one-level deep relative Fepper homepage links to portable, static index page links\
', function () {
    const testStringOrig = '<a HREF="../04-pages-00-homepage/04-pages-00-homepage.html">';
    const testStringConverted = staticGenerator.convertLinksHomepage(testStringOrig, dataJson.homepage);

    expect(testStringConverted).to.equal('<a HREF="index.html">');
    expect(origSiblingContent).to.include(testStringOrig);
    expect(origSiblingContent).to.not.include(testStringConverted);
    expect(staticSiblingContent).to.not.include(testStringOrig);
    expect(staticSiblingContent).to.include(testStringConverted);
  });

  it('should convert double-quoted two-levels deep relative Fepper homepage links to portable, static index page links\
', function () {
    const testStringOrig = '<a href="../../patterns/04-pages-00-homepage/04-pages-00-homepage.html">';
    const testStringConverted = staticGenerator.convertLinksHomepage(testStringOrig, dataJson.homepage);

    expect(testStringConverted).to.equal('<a href="index.html">');
    expect(origSiblingContent).to.include(testStringOrig);
    expect(origSiblingContent).to.not.include(testStringConverted);
    expect(staticSiblingContent).to.not.include(testStringOrig);
    expect(staticSiblingContent).to.include(testStringConverted);
  });

  it('should convert single-quoted absolute Fepper homepage links to portable, static index page links', function () {
    const testStringOrig = '<a HREF=\'/patterns/04-pages-00-homepage/04-pages-00-homepage.html\'>';
    const testStringConverted = staticGenerator.convertLinksHomepage(testStringOrig, dataJson.homepage);

    expect(testStringConverted).to.equal('<a HREF=\'index.html\'>');
    expect(origSiblingContent).to.include(testStringOrig);
    expect(origSiblingContent).to.not.include(testStringConverted);
    expect(staticSiblingContent).to.not.include(testStringOrig);
    expect(staticSiblingContent).to.include(testStringConverted);
  });

  it('should convert single-quoted one-level deep relative Fepper homepage links to portable, static index page links\
', function () {
    const testStringOrig = '<a href=\'../04-pages-00-homepage/04-pages-00-homepage.html\'>';
    const testStringConverted = staticGenerator.convertLinksHomepage(testStringOrig, dataJson.homepage);

    expect(testStringConverted).to.equal('<a href=\'index.html\'>');
    expect(origSiblingContent).to.include(testStringOrig);
    expect(origSiblingContent).to.not.include(testStringConverted);
    expect(staticSiblingContent).to.not.include(testStringOrig);
    expect(staticSiblingContent).to.include(testStringConverted);
  });

  it('should convert single-quoted two-levels deep relative Fepper homepage links to portable, static index page links\
', function () {
    const testStringOrig = '<a HREF=\'../../patterns/04-pages-00-homepage/04-pages-00-homepage.html\'>';
    const testStringConverted = staticGenerator.convertLinksHomepage(testStringOrig, dataJson.homepage);

    expect(testStringConverted).to.equal('<a HREF=\'index.html\'>');
    expect(origSiblingContent).to.include(testStringOrig);
    expect(origSiblingContent).to.not.include(testStringConverted);
    expect(staticSiblingContent).to.not.include(testStringOrig);
    expect(staticSiblingContent).to.include(testStringConverted);
  });

  it('should convert double-quoted absolute Fepper sibling links to portable, static sibling page links', function () {
    const testStringOrig = '<a HREF="/patterns/04-pages-01-blog/04-pages-01-blog.html">';
    const testStringConverted = staticGenerator.convertLinksSibling(testStringOrig);

    expect(testStringConverted).to.equal('<a HREF="01-blog.html">');
    expect(origIndexContent).to.include(testStringOrig);
    expect(origIndexContent).to.not.include(testStringConverted);
    expect(staticIndexContent).to.not.include(testStringOrig);
    expect(staticIndexContent).to.include(testStringConverted);
  });

  it('should convert double-quoted one-level deep relative Fepper sibling links to portable, static sibling page links\
', function () {
    const testStringOrig = '<a href="../04-pages-01-blog/04-pages-01-blog.html">';
    const testStringConverted = staticGenerator.convertLinksSibling(testStringOrig);

    expect(testStringConverted).to.equal('<a href="01-blog.html">');
    expect(origIndexContent).to.include(testStringOrig);
    expect(origIndexContent).to.not.include(testStringConverted);
    expect(staticIndexContent).to.not.include(testStringOrig);
    expect(staticIndexContent).to.include(testStringConverted);
  });

  it('should convert double-quoted two-levels deep relative Fepper sibling links to portable, static sibling page links\
', function () {
    const testStringOrig = '<a HREF="../../patterns/04-pages-01-blog/04-pages-01-blog.html">';
    const testStringConverted = staticGenerator.convertLinksSibling(testStringOrig);

    expect(testStringConverted).to.equal('<a HREF="01-blog.html">');
    expect(origIndexContent).to.include(testStringOrig);
    expect(origIndexContent).to.not.include(testStringConverted);
    expect(staticIndexContent).to.not.include(testStringOrig);
    expect(staticIndexContent).to.include(testStringConverted);
  });

  it('should convert single-quoted absolute Fepper sibling links to portable, static sibling page links', function () {
    const testStringOrig = '<a href=\'/patterns/04-pages-01-blog/04-pages-01-blog.html\'>';
    const testStringConverted = staticGenerator.convertLinksSibling(testStringOrig);

    expect(testStringConverted).to.equal('<a href=\'01-blog.html\'>');
    expect(origIndexContent).to.include(testStringOrig);
    expect(origIndexContent).to.not.include(testStringConverted);
    expect(staticIndexContent).to.not.include(testStringOrig);
    expect(staticIndexContent).to.include(testStringConverted);
  });

  it('should convert single-quoted one-level deep relative Fepper sibling links to portable, static sibling page links\
', function () {
    const testStringOrig = '<a HREF=\'../04-pages-01-blog/04-pages-01-blog.html\'>';
    const testStringConverted = staticGenerator.convertLinksSibling(testStringOrig);

    expect(testStringConverted).to.equal('<a HREF=\'01-blog.html\'>');
    expect(origIndexContent).to.include(testStringOrig);
    expect(origIndexContent).to.not.include(testStringConverted);
    expect(staticIndexContent).to.not.include(testStringOrig);
    expect(staticIndexContent).to.include(testStringConverted);
  });

  it('should convert single-quoted two-levels deep relative Fepper sibling links to portable, static sibling page links\
', function () {
    const testStringOrig = '<a href=\'../../patterns/04-pages-01-blog/04-pages-01-blog.html\'>';
    const testStringConverted = staticGenerator.convertLinksSibling(testStringOrig);

    expect(testStringConverted).to.equal('<a href=\'01-blog.html\'>');
    expect(origIndexContent).to.include(testStringOrig);
    expect(origIndexContent).to.not.include(testStringConverted);
    expect(staticIndexContent).to.not.include(testStringOrig);
    expect(staticIndexContent).to.include(testStringConverted);
  });
});
