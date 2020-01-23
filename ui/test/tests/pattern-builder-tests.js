'use strict';

const {expect} = require('chai');
const Feplet = require('feplet');
const fs = require('fs-extra');

const {
  patternlab,
  patternsDir
} = require('../init')();
const patternBuilder = patternlab.patternBuilder;

// Preprocess the patternlab object.
patternlab.preProcessAllPatterns(patternsDir);
patternlab.preProcessDataAndParams();

// Get test patterns.
const atomPattern = patternlab.getPattern('test-styled-atom');
const molPattern = patternlab.getPattern('test-styled-molecule');
const orgPattern = patternlab.getPattern('test-styled-organism');
const navPattern = patternlab.getPattern('test-nav');

// Process test patterns.
patternBuilder.processPattern(atomPattern, patternlab);
patternBuilder.processPattern(molPattern, patternlab);
patternBuilder.processPattern(orgPattern, patternlab);
patternBuilder.processPattern(navPattern, patternlab);

describe('Pattern Builder', function () {
  it('replaces link.* tags with their expanded link data', function () {
    const navTemplate =
'<a href="{{ link.facebook-brad }}">Brad</a>\
<a href="{{ link.facebook-dave }}">Dave</a>\
<a href="{{ link.facebook-brian }}">Brian</a>';
    // eslint-disable-next-line max-len
    const navExtendedTemplate =
'<a href="../facebook-cambridge-analytica-brad/facebook-cambridge-analytica-brad.html">Brad</a>\
<a href="../facebook-cambridge-analytica-dave/facebook-cambridge-analytica-dave.html">Dave</a>\
<a href="../facebook-cambridge-analytica-brian/facebook-cambridge-analytica-brian.html">Brian</a>';

    expect(navPattern.template).to.equal(navTemplate);
    expect(navPattern.extendedTemplate).to.equal(navExtendedTemplate);
  });

  describe('.addPattern()', function () {
    it('overwrites existing pattern if same relPath', function () {
      const atomPatternOrig = JSON.parse(JSON.stringify(atomPattern));
      delete atomPattern.jsonFileData;

      patternBuilder.addPattern(atomPattern);

      const atomPatternNewReference = patternlab.getPattern(atomPattern.relPath);

      expect(atomPatternNewReference.jsonFileData).to.be.undefined;

      atomPattern.jsonFileData = atomPatternOrig.jsonFileData;
    });
  });

  describe('.preProcessPartials()', function () {
    it('creates a partials object for each unique partial keyed by its include tag', function () {
      expect(atomPattern.patternPartial).to.equal('test-styled-atom');
      expect(patternlab.ingredients.partials[atomPattern.patternPartial]).to
        .equal('<span class="test_base {{ styleModifier }}">{{ message }}{{ description }}</span>');
    });

    it('creates a partialsComp object for each unique compiled partial keyed by its include tag', function () {
      expect(atomPattern.patternPartial).to.equal('test-styled-atom');
      expect(patternlab.ingredients.partialsComp[atomPattern.patternPartial].compilation).to.be.an.instanceof(Object);
      expect(patternlab.ingredients.partialsComp[atomPattern.patternPartial].compilation)
        .to.equal(atomPattern.fepletComp);
    });
  });

  describe('.processPattern()', function () {
    it('includes partials directly within templates', function () {
      const atomTemplate =
        '<span class="test_base {{ styleModifier }}">{{ message }}{{ description }}</span>';
      const atomExtendedTemplate = '<span class="test_base ">atomic</span>';
      const molPartial = '<span class="test_base "></span>';

      expect(atomPattern.template).to.equal(atomTemplate);
      expect(molPattern.template).to.not.have.string(atomTemplate);
      expect(molPattern.template).to.have.string('{{> test-styled-atom');
      expect(atomPattern.extendedTemplate).to.equal(atomExtendedTemplate);
      expect(molPattern.extendedTemplate).to.have.string(molPartial);
    });

    it('recursively includes nested partials', function () {
      const atomTemplate =
        '<span class="test_base {{ styleModifier }}">{{ message }}{{ description }}</span>';
      const atomExtendedTemplate = '<span class="test_base ">atomic</span>';
      const orgPartial = '<span class="test_base "></span>';

      expect(atomPattern.template).to.equal(atomTemplate);
      expect(molPattern.template).to.not.have.string(atomTemplate);
      expect(orgPattern.template).to.not.have.string(atomTemplate);
      expect(molPattern.template).to.have.string('{{> test-styled-atom');
      expect(orgPattern.template).to.not.have.string('{{> test-styled-atom');
      expect(orgPattern.template).to.have.string('{{> test-styled-molecule');
      expect(atomPattern.extendedTemplate).to.equal(atomExtendedTemplate);
      expect(orgPattern.extendedTemplate).to.have.string(orgPartial);
    });

    it('renders template tags in header', function () {
      const atomPatternHeaderOrig = atomPattern.header;
      let userHead = fs.readFileSync(`${patternlab.config.paths.source.meta}/_00-head.mustache`, patternlab.config.enc);
      userHead = userHead.replace(/\{\{\{?\s*patternlabHead\s*\}?\}\}/i, patternlab.ingredients.header);
      userHead = userHead.slice(0, -3) + ' {{ description }}">';
      patternlab.ingredients.userHeadParse = Feplet.parse(Feplet.scan(userHead));
      patternlab.ingredients.userHeadComp = Feplet.generate(patternlab.ingredients.userHeadParse, userHead, {});

      patternBuilder.processPattern(atomPattern, patternlab);

      expect(atomPatternHeaderOrig).to.not.have.string('atomic');
      expect(atomPattern.header).to.have.string('<body class=" atomic">');
    });
  });
});
