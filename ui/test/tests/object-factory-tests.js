'use strict';

const expect = require('chai').expect;

const of = require('../../core/lib/object-factory');

describe('Object Factory', function () {
  describe('Pattern constructor', function () {
    it('should instantiate correctly', function () {
      const p = new of.Pattern('00-atoms/00-global/00-colors.mustache');

      expect(p.fileExtension).to.equal('.mustache');
      expect(p.fileName).to.equal('00-colors');
      expect(p.outfileExtension).to.equal('.html');
      expect(p.subdir).to.equal('00-atoms/00-global');
      expect(p.flatPatternPath).to.equal('00-atoms-00-global');
      expect(p.relPath).to.equal('00-atoms/00-global/00-colors.mustache');
      expect(p.relPathTrunc).to.equal('00-atoms/00-global/00-colors');
      expect(p.jsonFileData instanceof Object).to.equal(true);
      expect(p.name).to.equal('00-atoms-00-global-00-colors');
      expect(p.patternBaseNamePhp).to.equal('colors');
      expect(p.patternBaseName).to.equal('colors');
      expect(p.patternLink).to.equal('00-atoms-00-global-00-colors/00-atoms-00-global-00-colors.html');
      expect(p.patternGroup).to.equal('atoms');
      expect(p.patternName).to.equal('Colors');
      expect(p.patternPartial).to.equal('atoms-colors');
      expect(p.patternPartialPhp).to.equal('atoms-colors');
      expect(p.patternSubGroup).to.equal('global');
      expect(p.allData).to.equal(null);
      expect(p.isPattern).to.equal(true);
      expect(p.isPreprocessed).to.equal(false);
      expect(p.isPseudopattern).to.equal(false);
      expect(Array.isArray(p.lineage)).to.equal(true);
      expect(Array.isArray(p.lineageIndex)).to.equal(true);
      expect(Array.isArray(p.lineageR)).to.equal(true);
      expect(Array.isArray(p.lineageRIndex)).to.equal(true);
      expect(p.patternState).to.equal('');
      expect(p.template).to.equal('');
    });

    it('should instantiate one-directory patterns correctly', function () {
      const p = new of.Pattern('00-atoms/00-colors.mustache');

      expect(p.fileExtension).to.equal('.mustache');
      expect(p.fileName).to.equal('00-colors');
      expect(p.outfileExtension).to.equal('.html');
      expect(p.subdir).to.equal('00-atoms');
      expect(p.flatPatternPath).to.equal('00-atoms');
      expect(p.relPath).to.equal('00-atoms/00-colors.mustache');
      expect(p.relPathTrunc).to.equal('00-atoms/00-colors');
      expect(p.jsonFileData instanceof Object).to.equal(true);
      expect(p.name).to.equal('00-atoms-00-colors');
      expect(p.patternBaseNamePhp).to.equal('colors');
      expect(p.patternBaseName).to.equal('colors');
      expect(p.patternLink).to.equal('00-atoms-00-colors/00-atoms-00-colors.html');
      expect(p.patternGroup).to.equal('atoms');
      expect(p.patternName).to.equal('Colors');
      expect(p.patternPartial).to.equal('atoms-colors');
      expect(p.patternPartialPhp).to.equal('atoms-colors');
      expect(p.patternSubGroup).to.equal('atoms');
      expect(p.allData).to.equal(null);
      expect(p.isPattern).to.equal(true);
      expect(p.isPreprocessed).to.equal(false);
      expect(p.isPseudopattern).to.equal(false);
      expect(Array.isArray(p.lineage)).to.equal(true);
      expect(Array.isArray(p.lineageIndex)).to.equal(true);
      expect(Array.isArray(p.lineageR)).to.equal(true);
      expect(Array.isArray(p.lineageRIndex)).to.equal(true);
      expect(p.patternState).to.equal('');
      expect(p.template).to.equal('');
    });

    it('should instantiate patterns with no numbers in patternGroup correctly', function () {
      const p = new of.Pattern('atoms/colors.mustache', {d: 123});

      expect(p.fileExtension).to.equal('.mustache');
      expect(p.fileName).to.equal('colors');
      expect(p.outfileExtension).to.equal('.html');
      expect(p.subdir).to.equal('atoms');
      expect(p.flatPatternPath).to.equal('atoms');
      expect(p.relPath).to.equal('atoms/colors.mustache');
      expect(p.relPathTrunc).to.equal('atoms/colors');
      expect(p.jsonFileData instanceof Object).to.equal(true);
      expect(p.name).to.equal('atoms-colors');
      expect(p.patternBaseNamePhp).to.equal('colors');
      expect(p.patternBaseName).to.equal('colors');
      expect(p.patternLink).to.equal('atoms-colors/atoms-colors.html');
      expect(p.patternGroup).to.equal('atoms');
      expect(p.patternName).to.equal('Colors');
      expect(p.patternPartial).to.equal('atoms-colors');
      expect(p.patternPartialPhp).to.equal('atoms-colors');
      expect(p.patternSubGroup).to.equal('atoms');
      expect(p.allData).to.equal(null);
      expect(p.isPattern).to.equal(true);
      expect(p.isPreprocessed).to.equal(false);
      expect(p.isPseudopattern).to.equal(false);
      expect(Array.isArray(p.lineage)).to.equal(true);
      expect(Array.isArray(p.lineageIndex)).to.equal(true);
      expect(Array.isArray(p.lineageR)).to.equal(true);
      expect(Array.isArray(p.lineageRIndex)).to.equal(true);
      expect(p.patternState).to.equal('');
      expect(p.template).to.equal('');
    });

    it('should capitalize patternName correctly', function () {
      const p = new of.Pattern('00-atoms/00-global/00-colors-alt.mustache');

      expect(p.patternBaseName).to.equal('colors-alt');
      expect(p.patternName).to.equal('Colors Alt');
    });
  });

  describe('PatternType constructor', function () {
    it('should initialize correctly', function () {
      const t = new of.PatternType('test');

      expect(t.patternTypeLC).to.equal('test');
      expect(t.patternTypeUC).to.equal('Test');
      expect(Array.isArray(t.patternTypeItems)).to.equal(true);
      expect(Array.isArray(t.patternTypeItemsIndex)).to.equal(true);
      expect(Array.isArray(t.patternItems)).to.equal(true);
      expect(Array.isArray(t.patternItemsIndex)).to.equal(true);
    });

    it('should capitalize patternTypeUC correctly', function () {
      const t = new of.PatternType('page-templates');

      expect(t.patternTypeLC).to.equal('page-templates');
      expect(t.patternTypeUC).to.equal('Page Templates');
    });
  });

  describe('PatternSubType constructor', function () {
    it('should initialize correctly', function () {
      const st = new of.PatternSubType('test');

      expect(st.patternSubTypeLC).to.equal('test');
      expect(st.patternSubTypeUC).to.equal('Test');
      expect(Array.isArray(st.patternSubTypeItems)).to.equal(true);
      expect(Array.isArray(st.patternSubTypeItemsIndex)).to.equal(true);
    });

    it('should capitalize patternSubTypeUC correctly', function () {
      const st = new of.PatternSubType('global-concepts');

      expect(st.patternSubTypeLC).to.equal('global-concepts');
      expect(st.patternSubTypeUC).to.equal('Global Concepts');
    });
  });

  describe('PatternSubTypeItem constructor', function () {
    it('should initialize correctly', function () {
      const sti = new of.PatternSubTypeItem('test');

      expect(sti.patternName).to.equal('Test');
      expect(sti.patternPath).to.equal('');
    });

    it('should capitalize patternName correctly', function () {
      const sti = new of.PatternSubTypeItem('nav button');

      expect(sti.patternName).to.equal('Nav Button');
    });
  });
});
