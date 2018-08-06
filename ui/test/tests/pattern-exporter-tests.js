'use strict';

const expect = require('chai').expect;
const fs = require('fs-extra');

const {
  patternlab,
  patternsDir
} = require('../test-harness')();
const patternAssembler = patternlab.patternAssembler;
const patternExporter = patternlab.patternExporter;

const testFile = `${patternlab.config.patternExportDirectory}/test-styled-organism.html`;

if (fs.existsSync(testFile)) {
  fs.unlinkSync(testFile);
}

const existsBefore = fs.existsSync(testFile);

// Preprocess the patternlab object.
patternlab.preprocessAllPatterns(patternsDir);
patternlab.preprocessDataAndParams();

// Get test pattern.
const testPattern = patternlab.getPattern('test-styled-organism');

// Process test pattern.
patternAssembler.processPattern(testPattern, patternlab);

// Export patterns.
patternExporter.main(patternlab);

const existsAfter = fs.existsSync(testFile);
const fileContents = existsAfter ? fs.readFileSync(testFile, 'utf8').trim() : '';

describe('Pattern Exporter', function () {
  it('should write the export to the file system', function () {
    expect(existsBefore).to.equal(false);
    expect(existsAfter).to.equal(true);
  });

  it('should export a rendered pattern', function () {
    expect(fileContents).to
      .equal('<span class="test_base ">\n    \n    \n</span>\n<span class="test_base test_1">\n    \n    \n</span>');
  });
});
