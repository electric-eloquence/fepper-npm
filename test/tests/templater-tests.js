'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

require('../init');

const fepper = global.fepper;
const {
  conf,
  pref,
  tasks,
  utils
} = fepper;
const templater = tasks.templater;

const patternsDir = conf.ui.paths.source.patterns;
const templatesDir = utils.backendDirCheck(pref.backend.synced_dirs.templates_dir);
const templatesAlt = `${templatesDir}-alt`;

describe('Templater', function () {
  it('recurses through Mustache partials', function () {
    const fileFurthest = patternsDir + '/00-elements/02-images/00-logo.mustache';
    const fileRoot = patternsDir + '/03-templates/00-homepage.mustache';
    const code = templater.mustacheRecurse(fileRoot, conf, patternsDir);
    const partial = fs.readFileSync(fileFurthest, conf.enc);

    // Should contain fileFurthest.
    expect(code).to.have.string(partial);
  });

  it('unescapes Mustache tags', function () {
    const token = '{ sub }';
    const unescaped = templater.mustacheUnescape(token);

    expect(unescaped).to.equal('{\\ssub\\s}');
  });

  it('writes translated templates', function () {
    // Clear out templates dir.
    fs.removeSync(templatesDir + '/*');
    fs.removeSync(templatesAlt + '/*');

    // Run templater.
    tasks.template();

    const templateTranslated = fs.statSync(templatesDir + '/00-homepage.tpl.php');
    const templateTranslatedAlt = fs.statSync(templatesAlt + '/02-templater-alt.twig');

    expect(typeof templateTranslated).to.equal('object');
    expect(typeof templateTranslatedAlt).to.equal('object');
  });

  it('ignores Mustache files prefixed with two undercores', function () {
    let ignored = null;

    try {
      ignored = fs.statSync(templatesDir + '/__01-blog.tpl.php');
    }
    catch (err) {
      // Do nothing.
    }

    expect(ignored).to.be.null;
  });

  it('ignores Mustache files in a _nosync directory', function () {
    let ignored = null;

    try {
      ignored = fs.statSync(templatesDir + '/_nosync/00-nosync.tpl.php');
    }
    catch (err) {
      // Do nothing.
    }

    expect(ignored).to.be.null;
  });

  it('writes to the default templates directory', function () {
    const output = fs.readFileSync(templatesDir + '/00-homepage.tpl.php', conf.enc).trim();

    expect(output).to.equal('<div class="page" id="page"><a href=""><img src="../../_assets/logo.png" class="logo" alt="Logo Alt Text"></a>}}<?php print $page[\'footer\']; ?></div>');
  });

  it('writes to nested directories within the default templates directory', function () {
    const output = fs.readFileSync(templatesDir + '/nested/00-nested.tpl.php', conf.enc).trim();

    expect(output).to.equal('<div class="page" id="page"><a href=""><img src="../../_assets/logo.png" class="logo" alt="Logo Alt Text"></a><?php print $page[\'footer\']; ?></div>');
  });

  it('writes to the alternate templates directory', function () {
    const output = fs.readFileSync(templatesAlt + '/02-templater-alt.twig', conf.enc).trim();

    expect(output).to.equal('<p>02-templater-alt.yml overrides "templates_dir" and \'templates_ext\' in pref.yml</p>');
  });
});
