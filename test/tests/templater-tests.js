'use strict';

const expect = require('chai').expect;
const fs = require('fs-extra');

require('../init');

const fepper = global.fepper;
const conf = fepper.conf;
const pref = fepper.pref;
const templater = fepper.tasks.templater;
const utils = fepper.utils;

const patternsDir = conf.ui.paths.source.patterns;
const templatesDir = utils.backendDirCheck(pref.backend.synced_dirs.templates_dir);
const templatesAlt = `${templatesDir}-alt`;

describe('Templater', function () {
  it('should recurse through Mustache partials', function () {
    const fileFurthest = patternsDir + '/00-elements/02-images/00-logo.mustache';
    const fileRoot = patternsDir + '/03-templates/00-homepage.mustache';
    const code = templater.mustacheRecurse(fileRoot, conf, patternsDir);
    const partial = fs.readFileSync(fileFurthest, conf.enc);

    // Should contain fileFurthest.
    expect(code).to.contain(partial);
  });

  it('should unescape Mustache tags', function () {
    const token = '{ sub }';
    const unescaped = templater.mustacheUnescape(token);

    expect(unescaped).to.equal('{\\ssub\\s}');
  });

  it('should write translated templates', function () {
    // Clear out templates dir.
    fs.removeSync(templatesDir + '/*');
    fs.removeSync(templatesAlt + '/*');

    // Run templater.
    templater.main();

    const templateTranslated = fs.statSync(templatesDir + '/00-homepage.tpl.php');
    const templateTranslatedAlt = fs.statSync(templatesAlt + '/02-templater-alt.twig');

    expect(typeof templateTranslated).to.equal('object');
    expect(typeof templateTranslatedAlt).to.equal('object');
  });

  it('should ignore Mustache files prefixed with two undercores', function () {
    let ignored = null;

    try {
      ignored = fs.statSync(templatesDir + '/__01-blog.tpl.php');
    }
    catch (err) {
      // Do nothing.
    }

    expect(ignored).to.be.null;
  });

  it('should ignore Mustache files in a _nosync directory', function () {
    let ignored = null;

    try {
      ignored = fs.statSync(templatesDir + '/_nosync/00-nosync.tpl.php');
    }
    catch (err) {
      // Do nothing.
    }

    expect(ignored).to.be.null;
  });

  it('should write to the default templates directory', function () {
    const output = fs.readFileSync(templatesDir + '/00-homepage.tpl.php', conf.enc).trim();

    expect(output).to.equal('<div class="page" id="page"><a href=""><img src="../../_assets/logo.png" class="logo" alt="Logo Alt Text"></a><?php print $page[\'footer\']; ?></div>');
  });

  it('should write to nested directories within the default templates directory', function () {
    const output = fs.readFileSync(templatesDir + '/nested/00-nested.tpl.php', conf.enc).trim();

    expect(output).to.equal('<div class="page" id="page"><a href=""><img src="../../_assets/logo.png" class="logo" alt="Logo Alt Text"></a><?php print $page[\'footer\']; ?></div>');
  });

  it('should write to the alternate templates directory', function () {
    const output = fs.readFileSync(templatesAlt + '/02-templater-alt.twig', conf.enc).trim();

    expect(output).to.equal('<p>02-templater-alt.yml overrides "templates_dir" and \'templates_ext\' in pref.yml</p>');
  });
});
