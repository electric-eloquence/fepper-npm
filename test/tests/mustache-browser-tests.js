'use strict';

const {expect} = require('chai');

const {
  fepper,
  responseFactory
} = require('../init')();
const mustacheBrowser = fepper.tcpIp.fpExpress.mustacheBrowser;

const ObjectFactory = require('../../ui/core/lib/object-factory');

describe('Mustache Browser', function () {
  let contentBefore;
  let contentAfter;

  before(function () {
    contentBefore = `<html>
  <head></head>
  <body></body>
</html>
`;
    contentAfter = mustacheBrowser.toHtmlEntitiesAndLinks(contentBefore);

    mustacheBrowser.ui.patternlab.build();
  });

  it('strips verbose, but without extension, Mustache partial tags to get query partials', function () {
    const partialTag = '{{> 02-components/00-global/00-header }}';
    const patternIdentifier = mustacheBrowser.stripPartialTag(partialTag);

    expect(partialTag).to.have.string('{{>');
    expect(partialTag).to.have.string('}}');
    expect(patternIdentifier).to.not.have.string('{{>');
    expect(patternIdentifier).to.not.have.string('}}');
    expect(patternIdentifier).to.equal('02-components/00-global/00-header');
  });

  it('strips verbose, with extension, Mustache partial tags to get query partials', function () {
    const partialTag = '{{> 02-components/00-global/00-header.mustache }}';
    const patternIdentifier = mustacheBrowser.stripPartialTag(partialTag);

    expect(partialTag).to.have.string('{{>');
    expect(partialTag).to.have.string('}}');
    expect(patternIdentifier).to.not.have.string('{{>');
    expect(patternIdentifier).to.not.have.string('}}');
    expect(patternIdentifier).to.equal('02-components/00-global/00-header.mustache');
  });

  it('strips shorthand Mustache partial tags to get query partials', function () {
    const partialTag = '{{> components-header }}';
    const patternIdentifier = mustacheBrowser.stripPartialTag(partialTag);

    expect(partialTag).to.have.string('{{>');
    expect(partialTag).to.have.string('}}');
    expect(patternIdentifier).to.not.have.string('{{>');
    expect(patternIdentifier).to.not.have.string('}}');
    expect(patternIdentifier).to.equal('components-header');
  });

  it('returns a Pattern object on submission of a verbose, but without extension, query partial', function () {
    const pattern = mustacheBrowser.getPattern('02-components/00-global/00-header');

    expect(pattern).to.be.instanceof(ObjectFactory.Pattern);
    expect(pattern.relPath).to.equal('02-components/00-global/00-header.mustache');
  });

  it('returns a Pattern object on submission of a verbose, with extension, query partial', function () {
    const pattern = mustacheBrowser.getPattern('02-components/00-global/00-header.mustache');

    expect(pattern).to.be.instanceof(ObjectFactory.Pattern);
    expect(pattern.relPath).to.equal('02-components/00-global/00-header.mustache');
  });

  it('returns a Pattern object on submission of a shorthand query partial', function () {
    const pattern = mustacheBrowser.getPattern('components-header');

    expect(pattern).to.be.instanceof(ObjectFactory.Pattern);
    expect(pattern.relPath).to.equal('02-components/00-global/00-header.mustache');
  });

  it('returns a Pattern object on submission of a verbose pseudo-pattern query partial', function () {
    const pattern = mustacheBrowser.getPattern('02-components/00-global/00-header~localhost');

    expect(pattern).to.be.instanceof(ObjectFactory.Pattern);
    expect(pattern.relPath).to.equal('02-components/00-global/00-header~localhost.json');
  });

  it('returns a Pattern object on submission of a shorthand pseudo-pattern query partial', function () {
    const pattern = mustacheBrowser.getPattern('components-header-localhost');

    expect(pattern).to.be.instanceof(ObjectFactory.Pattern);
    expect(pattern.relPath).to.equal('02-components/00-global/00-header~localhost.json');
  });

  it('returns a Pattern object on submission of a shorthand PHP syntax pseudo-pattern query partial\
', function () {
    const pattern = mustacheBrowser.getPattern('components-header~localhost');

    expect(pattern).to.be.instanceof(ObjectFactory.Pattern);
    expect(pattern.relPath).to.equal('02-components/00-global/00-header~localhost.json');
  });

  it('returns a null on submission of a no-result query partial', function () {
    const pattern = mustacheBrowser.getPattern('no-result');

    expect(pattern).to.be.null;
  });

  it('replaces opening angle brackets with HTML entities', function () {
    const htmlBefore = '<html></html>';
    const htmlAfter = mustacheBrowser.toHtmlEntitiesAndLinks(htmlBefore);

    expect(htmlBefore).to.have.string('<html>');
    expect(htmlBefore).to.have.string('</html>');
    expect(htmlBefore).to.not.have.string('&lt;');
    expect(htmlAfter).to.not.have.string('<html>');
    expect(htmlAfter).to.not.have.string('</html>');
    expect(htmlAfter).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>html</span><span class="token punctuation">></span></span>' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>html</span>' +
      '<span class="token punctuation">></span></span>');
  });

  it('sanitizes the output of executable scripts', function () {
    const scriptBefore = '<script></script>';
    const scriptAfter = mustacheBrowser.toHtmlEntitiesAndLinks(scriptBefore);

    expect(scriptBefore).to.have.string('<script');
    expect(scriptBefore).to.have.string('</script');
    expect(scriptBefore).to.not.have.string('&lt;');
    expect(scriptAfter).to.not.have.string('<script');
    expect(scriptAfter).to.not.have.string('</script');
    expect(scriptAfter).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>script</span><span class="token punctuation">></span></span>' +
      '<span class="token script"></span><span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">></span></span>');
  });

  it('renders the output by replacing tags with entities and wrapping them with styling tags', function () {
    expect(contentAfter).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>html</span><span class="token punctuation">></span></span>\n' +
      '  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>head</span>' +
      '<span class="token punctuation">></span></span><span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;/</span>head</span><span class="token punctuation">></span></span>\n' +
      '  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>body</span>' +
      '<span class="token punctuation">></span></span><span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;/</span>body</span><span class="token punctuation">></span></span>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>html</span>' +
      '<span class="token punctuation">></span></span>\n');
  });

  it('links Mustache partials', function () {
    const mustache = `<header class="test">
  {{> 02-components/00-global/00-header }}
</header>`;

    const htmlEntitiesAndLinks = mustacheBrowser.toHtmlEntitiesAndLinks(mustache);

    expect(htmlEntitiesAndLinks).to.have.string('<a href="');
    expect(htmlEntitiesAndLinks).to.have.string('</a>');
    expect(htmlEntitiesAndLinks).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n' +
      '  <a href="/?p=components-header" target="_top">{{> 02-components/00-global/00-header }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
  });

  it('strips parameters from linked Mustache partials', function () {
    const mustache = `<header class="test">
  {{> 02-components/00-global/00-header('partial?': true) }}
</header>`;
    const mustache1 = `<header class="test">
  {{> 02-components/00-global/00-header(
    'partial?': true,
    'multiline?': true
  ) }}
</header>`;
    const mustache2 = `<header class="test">
  {{> 02-components/00-global/00-header.mustache('partial?': true) }}
</header>`;
    const mustache3 = `<header class="test">
  {{> 02-components/00-global/00-header.mustache(
    'partial?': true,
    'multiline?': true
  ) }}
</header>`;
    const mustache4 = `<header class="test">
  {{> components-header('partial?': true) }}
</header>`;
    const mustache5 = `<header class="test">
  {{> components-header(
    'partial?': true,
    'multiline?': true
  ) }}
</header>`;

    const htmlEntitiesAndLinks = mustacheBrowser.toHtmlEntitiesAndLinks(mustache);
    const htmlEntitiesAndLinks1 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache1);
    const htmlEntitiesAndLinks2 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache2);
    const htmlEntitiesAndLinks3 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache3);
    const htmlEntitiesAndLinks4 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache4);
    const htmlEntitiesAndLinks5 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache5);

    expect(htmlEntitiesAndLinks).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n' +
      '  <a href="/?p=components-header" target="_top">' +
      '{{> 02-components/00-global/00-header(\'partial?\': true) }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
    expect(htmlEntitiesAndLinks1).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n' +
      '  <a href="/?p=components-header" target="_top">{{> 02-components/00-global/00-header(\n' +
      '    \'partial?\': true,\n' +
      '    \'multiline?\': true\n' +
      '  ) }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
    expect(htmlEntitiesAndLinks2).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n' +
      '  <a href="/?p=components-header" target="_top">' +
      '{{> 02-components/00-global/00-header.mustache(\'partial?\': true) }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
    expect(htmlEntitiesAndLinks3).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n' +
      '  <a href="/?p=components-header" target="_top">{{> 02-components/00-global/00-header.mustache(\n' +
      '    \'partial?\': true,\n' +
      '    \'multiline?\': true\n' +
      '  ) }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
    expect(htmlEntitiesAndLinks4).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n' +
      '  <a href="/?p=components-header" target="_top">{{> components-header(\'partial?\': true) }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
    expect(htmlEntitiesAndLinks5).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n' +
      '  <a href="/?p=components-header" target="_top">{{> components-header(\n' +
      '    \'partial?\': true,\n' +
      '    \'multiline?\': true\n' +
      '  ) }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
  });

  it('strips styleModifiers from linked Mustache partials', function () {
    const mustache = `<header class="test">
  {{> 02-components/00-global/00-header:styleModified }}
</header>`;
    const mustache1 = `<header class="test">
  {{> 02-components/00-global/00-header:styleModified|stylesModified }}
</header>`;
    const mustache2 = `<header class="test">
  {{> 02-components/00-global/00-header.mustache:styleModified }}
</header>`;
    const mustache3 = `<header class="test">
  {{> 02-components/00-global/00-header.mustache:styleModified|stylesModified }}
</header>`;
    const mustache4 = `<header class="test">
  {{> components-header:styleModified }}
</header>`;
    const mustache5 = `<header class="test">
  {{> components-header:styleModified|stylesModified }}
</header>`;

    const htmlEntitiesAndLinks = mustacheBrowser.toHtmlEntitiesAndLinks(mustache);
    const htmlEntitiesAndLinks1 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache1);
    const htmlEntitiesAndLinks2 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache2);
    const htmlEntitiesAndLinks3 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache3);
    const htmlEntitiesAndLinks4 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache4);
    const htmlEntitiesAndLinks5 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache5);

    expect(htmlEntitiesAndLinks).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n' +
      '  <a href="/?p=components-header" target="_top">{{> 02-components/00-global/00-header:styleModified }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
    expect(htmlEntitiesAndLinks1).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n' +
      '  <a href="/?p=components-header" target="_top">' +
      '{{> 02-components/00-global/00-header:styleModified|stylesModified }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
    expect(htmlEntitiesAndLinks2).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n' +
      '  <a href="/?p=components-header" target="_top">' +
      '{{> 02-components/00-global/00-header.mustache:styleModified }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
    expect(htmlEntitiesAndLinks3).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n' +
      '  <a href="/?p=components-header" target="_top">' +
      '{{> 02-components/00-global/00-header.mustache:styleModified|stylesModified }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
    expect(htmlEntitiesAndLinks4).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n' +
      '  <a href="/?p=components-header" target="_top">{{> components-header:styleModified }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
    expect(htmlEntitiesAndLinks5).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n' +
      '  <a href="/?p=components-header" target="_top">{{> components-header:styleModified|stylesModified }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
  });

  it('strips parameters and styleModifiers from Mustache partials that have.string both', function () {
    const mustache = `<header class="test">
  {{> 02-components/00-global/00-header:styleModified('partial?': true) }}
</header>`;
    const mustache1 = `<header class="test">
  {{> 02-components/00-global/00-header:styleModified(
    'partial?': true,
    'multiline?': true
  ) }}
</header>`;
    const mustache2 = `<header class="test">
  {{> 02-components/00-global/00-header:styleModified|stylesModified('partial?': true) }}
</header>`;
    const mustache3 = `<header class="test">
  {{> 02-components/00-global/00-header:styleModified|stylesModified(
    'partial?': true,
    'multiline?': true
  ) }}
</header>`;
    const mustache4 = `<header class="test">
  {{> 02-components/00-global/00-header.mustache:styleModified('partial?': true) }}
</header>`;
    const mustache5 = `<header class="test">
  {{> 02-components/00-global/00-header.mustache:styleModified(
    'partial?': true,
    'multiline?': true
  ) }}
</header>`;
    const mustache6 = `<header class="test">
  {{> 02-components/00-global/00-header.mustache:styleModified|stylesModified('partial?': true) }}
</header>`;
    const mustache7 = `<header class="test">
  {{> 02-components/00-global/00-header.mustache:styleModified|stylesModified(
    'partial?': true,
    'multiline?': true
  ) }}
</header>`;
    const mustache8 = `<header class="test">
  {{> components-header:styleModified('partial?': true) }}
</header>`;
    const mustache9 = `<header class="test">
  {{> components-header:styleModified(
    'partial?': true,
    'multiline?': true
  ) }}
</header>`;
    const mustache10 = `<header class="test">
  {{> components-header:styleModified|stylesModified('partial?': true) }}
</header>`;
    const mustache11 = `<header class="test">
  {{> components-header:styleModified|stylesModified(
    'partial?': true,
    'multiline?': true
  ) }}
</header>`;

    const htmlEntitiesAndLinks = mustacheBrowser.toHtmlEntitiesAndLinks(mustache);
    const htmlEntitiesAndLinks1 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache1);
    const htmlEntitiesAndLinks2 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache2);
    const htmlEntitiesAndLinks3 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache3);
    const htmlEntitiesAndLinks4 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache4);
    const htmlEntitiesAndLinks5 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache5);
    const htmlEntitiesAndLinks6 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache6);
    const htmlEntitiesAndLinks7 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache7);
    const htmlEntitiesAndLinks8 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache8);
    const htmlEntitiesAndLinks9 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache9);
    const htmlEntitiesAndLinks10 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache10);
    const htmlEntitiesAndLinks11 = mustacheBrowser.toHtmlEntitiesAndLinks(mustache11);

    expect(htmlEntitiesAndLinks).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n  <a href="/?p=components-header" target="_top">' +
      '{{> 02-components/00-global/00-header:styleModified(\'partial?\': true) }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
    expect(htmlEntitiesAndLinks1).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n  <a href="/?p=components-header" target="_top">' +
      '{{> 02-components/00-global/00-header:styleModified(\n' +
      '    \'partial?\': true,\n' +
      '    \'multiline?\': true\n' +
      '  ) }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
    expect(htmlEntitiesAndLinks1).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n' +
      '  <a href="/?p=components-header" target="_top">{{> 02-components/00-global/00-header:styleModified(\n' +
      '    \'partial?\': true,\n' +
      '    \'multiline?\': true\n' +
      '  ) }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
    expect(htmlEntitiesAndLinks2).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n  <a href="/?p=components-header" target="_top">' +
      '{{> 02-components/00-global/00-header:styleModified|stylesModified(\'partial?\': true) }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
    expect(htmlEntitiesAndLinks3).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n' +
      '  <a href="/?p=components-header" target="_top">' +
      '{{> 02-components/00-global/00-header:styleModified|stylesModified(\n' +
      '    \'partial?\': true,\n' +
      '    \'multiline?\': true\n' +
      '  ) }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
    expect(htmlEntitiesAndLinks4).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n' +
      '  <a href="/?p=components-header" target="_top">' +
      '{{> 02-components/00-global/00-header.mustache:styleModified(\'partial?\': true) }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
    expect(htmlEntitiesAndLinks5).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n' +
      '  <a href="/?p=components-header" target="_top">' +
      '{{> 02-components/00-global/00-header.mustache:styleModified(\n' +
      '    \'partial?\': true,\n' +
      '    \'multiline?\': true\n' +
      '  ) }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
    expect(htmlEntitiesAndLinks6).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n' +
      '  <a href="/?p=components-header" target="_top">' +
      '{{> 02-components/00-global/00-header.mustache:styleModified|stylesModified(\'partial?\': true) }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
    expect(htmlEntitiesAndLinks7).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n' +
      '  <a href="/?p=components-header" target="_top">' +
      '{{> 02-components/00-global/00-header.mustache:styleModified|stylesModified(\n' +
      '    \'partial?\': true,\n' +
      '    \'multiline?\': true\n' +
      '  ) }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
    expect(htmlEntitiesAndLinks8).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n' +
      '  <a href="/?p=components-header" target="_top">' +
      '{{> components-header:styleModified(\'partial?\': true) }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
    expect(htmlEntitiesAndLinks9).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n' +
      '  <a href="/?p=components-header" target="_top">{{> components-header:styleModified(\n' +
      '    \'partial?\': true,\n' +
      '    \'multiline?\': true\n' +
      '  ) }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
    expect(htmlEntitiesAndLinks10).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n' +
      '  <a href="/?p=components-header" target="_top">' +
      '{{> components-header:styleModified|stylesModified(\'partial?\': true) }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
    expect(htmlEntitiesAndLinks11).to.equal('<span class="token tag"><span class="token tag">' +
      '<span class="token punctuation">&lt;</span>header</span> <span class="token attr-name">class</span>' +
      '<span class="token attr-value"><span class="token punctuation attr-equals">=</span>' +
      '<span class="token punctuation">"</span>test<span class="token punctuation">"</span></span>' +
      '<span class="token punctuation">></span></span>\n' +
      '  <a href="/?p=components-header" target="_top">{{> components-header:styleModified|stylesModified(\n' +
      '    \'partial?\': true,\n' +
      '    \'multiline?\': true\n' +
      '  ) }}</a>\n' +
      '<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span>' +
      '<span class="token punctuation">></span></span>');
  });

  it('responds with the Mustache Browser if the "partial" query param is valid', function (done) {
    new Promise(
      (resolve) => {
        mustacheBrowser.main()(
          {
            query: {
              partial: 'components-header-localhost'
            }
          },
          responseFactory(resolve)
        );
      })
      .then((response) => {
        /* eslint-disable max-len */
        expect(response.responseText).to.equal(`
<!DOCTYPE html>
<html class="mustache-browser">
  <head>
    <title id="title">Fepper Mustache Browser</title>
    <meta charset="utf-8">

    <!-- Disable cache -->
    <meta http-equiv="cache-control" content="max-age=0">
    <meta http-equiv="cache-control" content="no-cache">
    <meta http-equiv="expires" content="0">
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT">
    <meta http-equiv="pragma" content="no-cache">

    
    <link rel="stylesheet" href="/node_modules/fepper-ui/styles/prism-twilight.css">
    <link rel="stylesheet" href="/node_modules/fepper-ui/styles/mustache-browser.css">
    
  </head>

  <body class="mustache-browser__body">
    <main id="" class="mustache-browser__main">
      <div id="message" class="message "></div>
<pre><code class="language-markup"><a href="/?p=elements-logo" target="_top">{{> 00-elements/02-images/00-logo.mustache }}</a>
<a href="/?p=components-primary-nav" target="_top">{{> 02-components/03-navigation/00-primary-nav }}</a>
</code></pre>

    </main>
    
  </body>
</html>`);
        /* eslint-enable max-len */
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('responds with a no result page if no "partial" query param', function (done) {
    new Promise(
      (resolve) => {
        mustacheBrowser.main()(
          {
            query: {
            }
          },
          responseFactory(resolve)
        );
      })
      .then((response) => {
        /* eslint-disable max-len */
        expect(response.responseText).to.equal(`
<!DOCTYPE html>
<html class="mustache-browser">
  <head>
    <title id="title">Fepper Mustache Browser</title>
    <meta charset="utf-8">

    <!-- Disable cache -->
    <meta http-equiv="cache-control" content="max-age=0">
    <meta http-equiv="cache-control" content="no-cache">
    <meta http-equiv="expires" content="0">
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT">
    <meta http-equiv="pragma" content="no-cache">

    
    <link rel="stylesheet" href="/node_modules/fepper-ui/styles/prism-twilight.css">
    <link rel="stylesheet" href="/node_modules/fepper-ui/styles/mustache-browser.css">
    
  </head>

  <body class="">
    <main id="" class="mustache-browser__no-result">
      <div id="message" class="message "></div><a href="#" class="fp-express mustache-browser__back" onclick="window.history.back();return false;">&#8678;</a><p>There is no pattern by that name. Please check its spelling:</p><code>undefined</code>
    </main>
    
  </body>
</html>`);
        /* eslint-enable max-len */
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('responds with the Mustache Browser if the "partial" query param is invalid', function (done) {
    new Promise(
      (resolve) => {
        mustacheBrowser.main()(
          {
            query: {
              partial: 'components-header-localhots'
            }
          },
          responseFactory(resolve)
        );
      })
      .then((response) => {
        /* eslint-disable max-len */
        expect(response.responseText).to.equal(`
<!DOCTYPE html>
<html class="mustache-browser">
  <head>
    <title id="title">Fepper Mustache Browser</title>
    <meta charset="utf-8">

    <!-- Disable cache -->
    <meta http-equiv="cache-control" content="max-age=0">
    <meta http-equiv="cache-control" content="no-cache">
    <meta http-equiv="expires" content="0">
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT">
    <meta http-equiv="pragma" content="no-cache">

    
    <link rel="stylesheet" href="/node_modules/fepper-ui/styles/prism-twilight.css">
    <link rel="stylesheet" href="/node_modules/fepper-ui/styles/mustache-browser.css">
    
  </head>

  <body class="">
    <main id="" class="mustache-browser__no-result">
      <div id="message" class="message "></div><a href="#" class="fp-express mustache-browser__back" onclick="window.history.back();return false;">&#8678;</a><p>There is no pattern by that name. Please check its spelling:</p><code>components-header-localhots</code>
    </main>
    
  </body>
</html>`);
        /* eslint-enable max-len */
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
