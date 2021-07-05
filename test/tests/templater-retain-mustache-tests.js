'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');
const utils = require('fepper-utils');

let fepper;
let conf;
let pref;
let tasks;
let patternsDir;
let templatesSrc;
let templatesDest;

describe('Templater retaining Mustache', function () {
  before(function () {
    ({
      fepper
    } = require('../init-retain-mustache')());
    ({
      conf,
      pref,
      tasks
    } = fepper);
    patternsDir = conf.ui.paths.source.patterns;
    templatesSrc = conf.ui.paths.source.templates;
    templatesDest = utils.backendDirCheck(pref.backend.synced_dirs.templates_dir);
  });

  after(function () {
    global.conf = global.confOrig;
    global.pref = global.prefOrig;
    global.confOrig = void 0;
    global.prefOrig = void 0;
  });

  it('writes translated templates', function () {
    // Clear out templates dir.
    fs.removeSync(templatesDest + '/*');

    // Run templater.
    tasks.template();

    const templateTranslated = fs.statSync(templatesDest + '/00-homepage.mustache');

    expect(typeof templateTranslated).to.equal('object');
  });

  it('writes to the default templates directory', function () {
    const output = fs.readFileSync(templatesDest + '/00-homepage.mustache', conf.enc).trim();

    /* eslint-disable max-len */
    expect(output).to.equal(`<div class="page" id="page">
  {{# img }}{{# logo }}<a href="{{ url }}"><img src="../../_assets/src/logo.png" class="logo" alt="Logo Alt Text"></a>{{/ logo }}{{/ img }}
{{> backend-primary-nav }}
  {{> 02-components/no-result }}
  <section class="section dagwood">
    {{# latest_posts_title }}
      <h2 class="section-title">{{{ latest_posts_title }}}</h2>
    {{/ latest_posts_title }}
    <ul class="post-list">
      {{# latest_posts }}
        <li>{{{ post }}}</li>
      {{/ latest_posts }}
    </ul>
    <a href="#" class="text-btn">View more posts</a>
  </section>
  {{> backend-footer }}
</div>`);
    /* eslint-enable max-len */
  });

  it('translates nested partials included with the .mustache extension', function () {
    const input = fs.readFileSync(templatesSrc + '/00-homepage.mustache', conf.enc);
    const inputNested = fs.readFileSync(patternsDir + '/02-components/00-global/00-header.mustache', conf.enc);
    const translation = fs.readFileSync(templatesSrc + '/00-homepage.yml', conf.enc);
    const output = fs.readFileSync(templatesDest + '/00-homepage.mustache', conf.enc);

    expect(input).to.not.have.string('> 02-components/03-navigation/00-primary-nav');
    expect(inputNested).to.have.string('> 02-components/03-navigation/00-primary-nav');
    expect(output).to.not.have.string('> 02-components/03-navigation/00-primary-nav');
    expect(translation).to.have.string('"> 02-components/03-navigation/00-primary-nav": |2');
    expect(translation).to.have.string('{{> backend-primary-nav }}');
    expect(input).to.not.have.string('{{> backend-primary-nav }}');
    expect(output).to.have.string('{{> backend-primary-nav }}');
  });

  it('writes to nested directories within the default templates directory', function () {
    const output = fs.readFileSync(templatesDest + '/nested/00-nested.mustache', conf.enc).trim();

    /* eslint-disable max-len */
    expect(output).to.equal(`<div class="page" id="page">
  {{# img }}{{# logo }}<a href="{{ url }}"><img src="../../_assets/src/logo.png" class="logo" alt="Logo Alt Text"></a>{{/ logo }}{{/ img }}
{{> 02-components/03-navigation/00-primary-nav }}
  {{> 02-components/no-result }}
  {{> backend-footer }}
</div>`);
    /* eslint-enable max-len */
  });
});
