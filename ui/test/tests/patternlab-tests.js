'use strict';

const expect = require('chai').expect;

const {
  dataDir,
  patternlab,
  patternsDir
} = require('../init')();

// Preprocess the patternlab object.
patternlab.preProcessAllPatterns(patternsDir);

describe('Patternlab', function () {
  describe('buildPatternData', function () {
    it('should parse the data.json file into a JavaScript object', function () {
      // Build pattern data and get data result.
      const dataResult = patternlab.buildPatternData(dataDir);

      expect(dataResult).to.be.an.instanceof(Object);
      expect(dataResult.data).to.equal('test');
    });
  });

  describe('getPattern', function () {
    it('should match by type-pattern shorthand syntax', function () {
      const result = patternlab.getPattern('test-nav');

      expect(result.patternPartial).to.equal('test-nav');
    });

    it('should match by full relative path', function () {
      const result = patternlab.getPattern('00-test/00-foo.mustache');

      expect(result.relPath).to.equal('00-test/00-foo.mustache');
    });

    it('should match by relative path minus extension', function () {
      const result = patternlab.getPattern('00-test/00-foo');

      expect(result.relPathTrunc).to.equal('00-test/00-foo');
    });
  });
});
