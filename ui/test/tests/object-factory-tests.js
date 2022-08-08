'use strict';

const {expect} = require('chai');

const of = require('../../core/lib/object-factory');

const {
  patternlab
} = require('../init')();

describe('Object Factory', function () {
  describe('Pattern constructor', function () {
    it('instantiates correctly', function () {
      const p = new of.Pattern('00-atoms/00-global/00-colors.mustache', patternlab);

      expect(p.fileExtension).to.equal('.mustache');
      expect(p.fileName).to.equal('00-colors');
      expect(p.outfileExtension).to.equal('.html');
      expect(p.pathsPublic.annotations).to.equal('annotations');
      expect(p.pathsPublic.images).to.equal('_assets');
      expect(p.pathsPublic.js).to.equal('_scripts');
      expect(p.pathsPublic.css).to.equal('_styles');
      expect(p.pathsPublic.cssBld).to.equal('_styles/bld');
      expect(p.pathsPublic.fonts).to.equal('_styles/bld/fonts');
      expect(p.pathsPublic.patterns).to.equal('patterns');
      expect(p.pathsPublic.static).to.equal('static');
      expect(p.pathsPublic.styleguide).to.equal('node_modules/fepper-ui');
      expect(p.relPath).to.equal('00-atoms/00-global/00-colors.mustache');
      expect(p.subdir).to.equal('00-atoms/00-global');
      expect(p.flatPatternPath).to.equal('00-atoms-00-global');
      expect(p.relPathTrunc).to.equal('00-atoms/00-global/00-colors');
      expect(p.name).to.equal('00-atoms-00-global-00-colors');
      expect(p.patternBaseNamePhp).to.equal('colors');
      expect(p.patternBaseName).to.equal('colors');
      expect(p.patternLink).to.equal('00-atoms-00-global-00-colors/00-atoms-00-global-00-colors.html');
      expect(p.patternName).to.equal('Colors');
      expect(p.patternType).to.equal('atoms');
      expect(p.patternPartial).to.equal('atoms-colors');
      expect(p.patternPartialPhp).to.equal('atoms-colors');
      expect(p.patternSubType).to.equal('global');
      expect(p.allData).to.be.null;
      expect(p.templateExtended).to.equal('');
      expect(p.fepletComp).to.be.null;
      expect(p.fepletParse).to.be.null;
      expect(p.frontMatterData).to.be.an.instanceof(Array);
      expect(p.frontMatterRelPathTrunc).to.equal('');
      expect(p.header).to.equal('');
      expect(p.footer).to.equal('');
      expect(p.isFrontMatter).to.be.false;
      expect(p.isPattern).to.be.true;
      expect(p.isPseudoPattern).to.be.false;
      expect(p.jsonFileData).to.be.an.instanceof(Object);
      expect(p.lineage).to.be.null;
      expect(p.lineageR).to.be.null;
      expect(p.listItems).to.be.null;
      expect(p.patternState).to.equal('');
      expect(p.template).to.equal('');
    });

    it('instantiates one-directory patterns correctly', function () {
      const p = new of.Pattern('00-atoms/00-colors.mustache', patternlab);

      expect(p.fileExtension).to.equal('.mustache');
      expect(p.fileName).to.equal('00-colors');
      expect(p.outfileExtension).to.equal('.html');
      expect(p.pathsPublic.annotations).to.equal('annotations');
      expect(p.pathsPublic.images).to.equal('_assets');
      expect(p.pathsPublic.js).to.equal('_scripts');
      expect(p.pathsPublic.css).to.equal('_styles');
      expect(p.pathsPublic.cssBld).to.equal('_styles/bld');
      expect(p.pathsPublic.fonts).to.equal('_styles/bld/fonts');
      expect(p.pathsPublic.patterns).to.equal('patterns');
      expect(p.pathsPublic.static).to.equal('static');
      expect(p.pathsPublic.styleguide).to.equal('node_modules/fepper-ui');
      expect(p.relPath).to.equal('00-atoms/00-colors.mustache');
      expect(p.subdir).to.equal('00-atoms');
      expect(p.flatPatternPath).to.equal('00-atoms');
      expect(p.relPathTrunc).to.equal('00-atoms/00-colors');
      expect(p.name).to.equal('00-atoms-00-colors');
      expect(p.patternBaseNamePhp).to.equal('colors');
      expect(p.patternBaseName).to.equal('colors');
      expect(p.patternLink).to.equal('00-atoms-00-colors/00-atoms-00-colors.html');
      expect(p.patternName).to.equal('Colors');
      expect(p.patternType).to.equal('atoms');
      expect(p.patternPartial).to.equal('atoms-colors');
      expect(p.patternPartialPhp).to.equal('atoms-colors');
      expect(p.patternSubType).to.equal('');
      expect(p.allData).to.be.null;
      expect(p.templateExtended).to.equal('');
      expect(p.fepletComp).to.be.null;
      expect(p.fepletParse).to.be.null;
      expect(p.frontMatterData).to.be.an.instanceof(Array);
      expect(p.frontMatterRelPathTrunc).to.equal('');
      expect(p.header).to.equal('');
      expect(p.footer).to.equal('');
      expect(p.isFrontMatter).to.be.false;
      expect(p.isPattern).to.be.true;
      expect(p.isPseudoPattern).to.be.false;
      expect(p.jsonFileData).to.be.an.instanceof(Object);
      expect(p.lineage).to.be.null;
      expect(p.lineageR).to.be.null;
      expect(p.listItems).to.be.null;
      expect(p.patternState).to.equal('');
      expect(p.template).to.equal('');
    });

    it('instantiates patterns with no numbers in patternType correctly', function () {
      const p = new of.Pattern('atoms/colors.mustache', patternlab);

      expect(p.fileExtension).to.equal('.mustache');
      expect(p.fileName).to.equal('colors');
      expect(p.outfileExtension).to.equal('.html');
      expect(p.pathsPublic.annotations).to.equal('annotations');
      expect(p.pathsPublic.images).to.equal('_assets');
      expect(p.pathsPublic.js).to.equal('_scripts');
      expect(p.pathsPublic.css).to.equal('_styles');
      expect(p.pathsPublic.cssBld).to.equal('_styles/bld');
      expect(p.pathsPublic.fonts).to.equal('_styles/bld/fonts');
      expect(p.pathsPublic.patterns).to.equal('patterns');
      expect(p.pathsPublic.static).to.equal('static');
      expect(p.pathsPublic.styleguide).to.equal('node_modules/fepper-ui');
      expect(p.relPath).to.equal('atoms/colors.mustache');
      expect(p.subdir).to.equal('atoms');
      expect(p.flatPatternPath).to.equal('atoms');
      expect(p.relPathTrunc).to.equal('atoms/colors');
      expect(p.name).to.equal('atoms-colors');
      expect(p.patternBaseNamePhp).to.equal('colors');
      expect(p.patternBaseName).to.equal('colors');
      expect(p.patternLink).to.equal('atoms-colors/atoms-colors.html');
      expect(p.patternName).to.equal('Colors');
      expect(p.patternType).to.equal('atoms');
      expect(p.patternPartial).to.equal('atoms-colors');
      expect(p.patternPartialPhp).to.equal('atoms-colors');
      expect(p.patternSubType).to.equal('');
      expect(p.allData).to.be.null;
      expect(p.fepletComp).to.be.null;
      expect(p.fepletParse).to.be.null;
      expect(p.frontMatterData).to.be.an.instanceof(Array);
      expect(p.frontMatterRelPathTrunc).to.equal('');
      expect(p.header).to.equal('');
      expect(p.footer).to.equal('');
      expect(p.isFrontMatter).to.be.false;
      expect(p.isPattern).to.be.true;
      expect(p.isPseudoPattern).to.be.false;
      expect(p.jsonFileData).to.be.an.instanceof(Object);
      expect(p.lineage).to.be.null;
      expect(p.lineageR).to.be.null;
      expect(p.listItems).to.be.null;
      expect(p.patternState).to.equal('');
      expect(p.template).to.equal('');
      expect(p.templateExtended).to.equal('');
      expect(p.templateTrimmed).to.equal('');
    });

    it('capitalizes patternName correctly', function () {
      const p = new of.Pattern('00-atoms/00-global/00-colors-alt.mustache', patternlab);

      expect(p.patternBaseName).to.equal('colors-alt');
      expect(p.patternName).to.equal('Colors Alt');
    });
  });

  describe('PatternItem constructor', function () {
    it('initializes correctly', function () {
      const p = new of.Pattern('00-atoms/00-global/00-colors.mustache', patternlab);
      const i = new of.PatternItem('test', p);

      expect(i.patternName).to.equal('test');
      expect(i.pattern).to.equal(p);
      expect(i.patternLink).to.equal(p.patternLink);
      expect(i.patternPartial).to.equal(p.patternPartial);
      expect(i.subdir).to.equal(p.subdir);
      expect(i.flatPatternPath).to.equal(p.flatPatternPath);
      expect(i.pathsPublic).to.equal(p.pathsPublic);
      expect(i.patternType).to.equal(p.patternType);
      expect(i.patternSubType).to.equal(p.patternSubType);
      expect(i.patternState).to.equal(p.patternState);
    });

    it('initializes patternType viewall items correctly', function () {
      const p = new of.Pattern('00-atoms/00-colors.mustache', patternlab);
      const i = new of.PatternItem('View All', p);

      expect(i.patternLink).to.equal('00-atoms/index.html');
      expect(i.patternPartial).to.equal('viewall-atoms');
    });

    it('initializes patternSubType viewall items correctly', function () {
      const p = new of.Pattern('00-atoms/00-global/00-colors.mustache', patternlab);
      const i = new of.PatternItem('View All', p);

      expect(i.patternLink).to.equal('00-atoms-00-global/index.html');
      expect(i.patternPartial).to.equal('viewall-atoms-global');
    });
  });

  describe('PatternSubType constructor', function () {
    it('initializes correctly', function () {
      const p = new of.Pattern('00-atoms/00-global/00-colors.mustache', patternlab);
      const st = new of.PatternSubType(p);

      expect(st.patternSubTypeLC).to.equal('global');
      expect(st.patternSubTypeUC).to.equal('Global');
      expect(st.patternPartial).to.equal('viewall-atoms-global');
      expect(st.flatPatternPath).to.equal(p.flatPatternPath);
      expect(st.pathsPublic).to.equal(p.pathsPublic);
      expect(st.patternSubTypeItems).to.be.an.instanceof(Array);
    });
  });

  describe('PatternType constructor', function () {
    it('initializes correctly', function () {
      const p = new of.Pattern('00-atoms/00-colors.mustache', patternlab);
      const t = new of.PatternType(p);

      expect(t.patternTypeLC).to.equal('atoms');
      expect(t.patternTypeUC).to.equal('Atoms');
      expect(t.patternPartial).to.equal('viewall-atoms');
      expect(t.flatPatternPath).to.equal('00-atoms');
      expect(t.pathsPublic).to.equal(p.pathsPublic);
      expect(t.patternTypeItems).to.be.an.instanceof(Array);
      expect(t.patternSubTypes).to.be.an.instanceof(Array);
      expect(t.patternSubTypesIndex).to.be.an.instanceof(Array);
    });

    it('initializes correctly when given a subType', function () {
      const p = new of.Pattern('00-atoms/00-global/00-colors.mustache', patternlab);
      const t = new of.PatternType(p);

      expect(t.patternTypeLC).to.equal('atoms');
      expect(t.patternTypeUC).to.equal('Atoms');
      expect(t.patternPartial).to.equal('viewall-atoms');
      expect(t.flatPatternPath).to.equal('00-atoms');
      expect(t.pathsPublic).to.equal(p.pathsPublic);
      expect(t.patternTypeItems).to.be.an.instanceof(Array);
      expect(t.patternSubTypes).to.be.an.instanceof(Array);
      expect(t.patternSubTypesIndex).to.be.an.instanceof(Array);
    });
  });

  describe('PatternViewall constructor', function () {
    it('initializes correctly', function () {
      const v = new of.PatternViewall('00-atoms/index.html', 'viewall content');

      expect(v.path).to.equal('00-atoms/index.html');
      expect(v.content).to.equal('viewall content');
    });
  });
});
