'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

const {
  fepper
} = require('../init')();
const {
  conf,
  pref,
  tasks,
  utils
} = fepper;
const templater = tasks.templater;

const patternsDir = conf.ui.paths.source.patterns;
const templatesSrc = conf.ui.paths.source.templates;
const templatesDest = utils.backendDirCheck(pref.backend.synced_dirs.templates_dir);
const templatesAlt = `${templatesDest}-alt`;

describe('Templater', function () {
  it('recurses through partials included with the .mustache extension', function () {
    const deepestNested = patternsDir + '/00-elements/02-images/00-logo.mustache'; // 2 recursion levels deep.
    const fileRoot = templatesSrc + '/00-homepage.mustache';
    const {compilation, partials, partialsComp} = templater.mustacheRecurse(fs.readFileSync(fileRoot, conf.enc));
    const templateRecursed = compilation.render({}, partials, null, partialsComp);
    const partial = fs.readFileSync(deepestNested, conf.enc);

    // Contains deepestNested.
    expect(templateRecursed).to.have.string(partial);
  });

  it('writes translated templates', function () {
    // Clear out templates dir.
    fs.removeSync(templatesDest + '/*');
    fs.removeSync(templatesAlt + '/*');

    // Run templater.
    tasks.template();

    const templateTranslated = fs.statSync(templatesDest + '/00-homepage.tpl.php');
    const templateTranslatedAlt = fs.statSync(templatesAlt + '/02-templater-alt.twig');

    expect(typeof templateTranslated).to.equal('object');
    expect(typeof templateTranslatedAlt).to.equal('object');
  });

  it('ignores Mustache files prefixed with two undercores', function () {
    let ignored = null;

    try {
      ignored = fs.statSync(templatesDest + '/__01-blog.tpl.php');
    }
    catch {} // eslint-disable-line no-empty

    expect(ignored).to.be.null;
  });

  it('ignores Mustache files in a _nosync directory', function () {
    let ignored = null;

    try {
      ignored = fs.statSync(templatesDest + '/_nosync/00-nosync.tpl.php');
    }
    catch {} // eslint-disable-line no-empty

    expect(ignored).to.be.null;
  });

  it('writes to the default templates directory', function () {
    const output = fs.readFileSync(templatesDest + '/00-homepage.tpl.php', conf.enc).trim();

    /* eslint-disable max-len */
    expect(output).to.equal(`<div class="page" id="page">
  <a href=""><img src="../../_assets/src/logo.png" class="logo" alt="Logo Alt Text"></a><section class="section hoagies">
    <h2 class="section-title"></h2>
    <ul class="post-list">
      <?php foreach ($latest_posts as $post): ?>
        <li><?php print $post; ?></li>
      <?php endforeach; ?>
    </ul>
    <a href="#" class="text-btn">View more posts</a>
  </section>
  <?php print $page['footer']; ?>
</div>`);
    /* eslint-enable max-len */
  });

  it('translates nested partials included with the .mustache extension', function () {
    const input = fs.readFileSync(templatesSrc + '/00-homepage.mustache', conf.enc);
    const inputNested = fs.readFileSync(patternsDir + '/02-components/01-sections/02-latest-posts.mustache', conf.enc);
    const translation = fs.readFileSync(templatesSrc + '/00-homepage.yml', conf.enc);
    const output = fs.readFileSync(templatesDest + '/00-homepage.tpl.php', conf.enc);

    expect(input).to.not.have.string('# latest_posts');
    expect(inputNested).to.have.string('# latest_posts');
    expect(output).to.not.have.string('# latest_posts');
    expect(translation).to.have.string('"# latest_posts": |2');
    expect(translation).to.have.string('<?php foreach ($latest_posts as $post): ?>');
    expect(input).to.not.have.string('{ post }');
    expect(inputNested).to.have.string('{ post }');
    expect(output).to.not.have.string('{ post }');
    expect(translation).to.have.string('"{ post }": |2');
    expect(translation).to.have.string('<?php print $post; ?>');
    expect(input).to.not.have.string('/ latest_posts');
    expect(inputNested).to.have.string('/ latest_posts');
    expect(output).to.not.have.string('/ latest_posts');
    expect(translation).to.have.string('"/ latest_posts": |2');
    expect(translation).to.have.string('<?php endforeach; ?>');
    expect(output).to.have.string(`<?php foreach ($latest_posts as $post): ?>
        <li><?php print $post; ?></li>
      <?php endforeach; ?>`);
  });

  it('writes to nested directories within the default templates directory', function () {
    const output = fs.readFileSync(templatesDest + '/nested/00-nested.tpl.php', conf.enc).trim();

    expect(output).to.equal(`<div class="page" id="page">
  <a href=""><img src="../../_assets/src/logo.png" class="logo" alt="Logo Alt Text"></a><?php print $page['footer']; ?>
</div>`);
  });

  it('writes to the alternate templates directory', function () {
    const output = fs.readFileSync(templatesAlt + '/02-templater-alt.twig', conf.enc).trim();

    expect(output).to.equal('<p>02-templater-alt.yml overrides "templates_dir" and \'templates_ext\' in pref.yml</p>');
  });
});
