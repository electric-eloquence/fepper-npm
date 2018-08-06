'use strict';

const diveSync = require('diveSync');
const expect = require('chai').expect;
const fs = require('fs-extra');
const slash = require('slash');

require('../test-harness');

const fepper = global.fepper;
const conf = fepper.conf;
const pref = fepper.pref;
const staticGenerator = fepper.tasks.staticGenerator;
const utils = fepper.utils;

const assetsSrc = conf.ui.paths.source.images;
const patternsPub = conf.ui.paths.public.patterns;
const scriptsSrc = conf.ui.paths.source.js;
const staticDir = conf.ui.paths.source.static;
const stylesSrc = conf.ui.paths.source.css;

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
  it('should copy assets to the static dir', function () {
    const assetsDir = `${staticDir}/_assets`;

    // Clear out test dir.
    fs.removeSync(assetsDir);

    // Check that test dir doesn't exist at beginning of test.
    const existsBefore = fs.existsSync(assetsDir);

    // Copy test dir.
    staticGenerator.assetsDirCopy();

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
    staticGenerator.scriptsDirCopy();

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
      staticGenerator.scriptsDirCopy();
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
    staticGenerator.stylesDirCopy();

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
    const testFile = `${staticDir}/index.html`;

    // Clear out test file.
    fs.removeSync(testFile);

    // Check that test file doesn't exist at beginning of test.
    const existsBefore = fs.existsSync(testFile);

    // Compile pages dir.
    staticGenerator.pagesCompile();

    // Check test file.
    const content = fs.readFileSync(testFile, conf.enc);

    // Test expectations.
    expect(existsBefore).to.equal(false);
    expect(content).to.not.equal('');
  });

  it('should write static/01-blog.html', function () {
    const testFile = `${staticDir}/01-blog.html`;

    // Clear out test file.
    fs.removeSync(testFile);

    // Check that test file doesn't exist at beginning of test.
    const existsBefore = fs.existsSync(testFile);

    // Compile pages dir.
    staticGenerator.pagesCompile();

    // Check test file.
    const content = fs.readFileSync(testFile, conf.enc);

    // Test expectations.
    expect(existsBefore).to.equal(false);
    expect(content).to.not.equal('');
  });

  it('should strip Pattern Lab code', function () {
    const origFile = `${patternsPub}/04-pages-00-homepage/04-pages-00-homepage.html`;
    const testFile = `${staticDir}/index.html`;

    // Check orig file.
    const origContent = fs.readFileSync(origFile, conf.enc);

    // Check test file.
    const testContent = fs.readFileSync(testFile, conf.enc);

    // Test expectations.
    expect(origContent).to.include('<!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->');
    expect(origContent).to.include('<!-- End Pattern Lab -->');
    expect(testContent).to.not.include('<!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->');
    expect(testContent).to.not.include('<!-- End Pattern Lab -->');
  });
});
