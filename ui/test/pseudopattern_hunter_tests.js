'use strict';

var fs = require('fs-extra');

var config = require('./patternlab-config.json');
var cwd = process.cwd() + '/test';
var plMain = new (require('../core/lib/patternlab'))(config, cwd);

var Pattern = require('../core/lib/object_factory').Pattern;
var dummyPattern = Pattern.createEmpty();

var patternEngines = require('../core/lib/pattern_engines');
var engine = patternEngines.getEngineForPattern(dummyPattern);

var pa = require('../core/lib/pattern_assembler');
var pattern_assembler = new pa();

var patternlab = fs.readJsonSync('./test/files/patternlab.json');
var patternsDir = './test/files/_patterns/';

// iteratively populate the patternlab object for use through entire test
plMain.processAllPatternsIterative(pattern_assembler, patternsDir, patternlab);

// set up commonly used test patterns
var basePattern = pattern_assembler.getPartial('test-styled-atom', patternlab);
var altPattern = pattern_assembler.getPartial('test-styled-atom-alt', patternlab);
var tmpPartial = pattern_assembler.preRenderPartial(basePattern, patternlab).tmpPartial;

pattern_assembler.renderPartials(tmpPartial, basePattern, patternlab);
basePattern.extendedTemplate = pattern_assembler.extendPartials(tmpPartial, engine);
altPattern.extendedTemplate = altPattern.basePattern.extendedTemplate;

var baseRendered = pattern_assembler.renderPattern(basePattern, basePattern.allData);
var altRendered = pattern_assembler.renderPattern(altPattern, altPattern.allData);

exports.pseudopattern_hunter = {
  'pseudopattern extendedTemplate is a copy of the basePattern extendedTemplate': function (test) {
    test.expect(1);

    // arrange
    pattern_assembler.renderPartials(tmpPartial, altPattern, patternlab);
    altPattern.extendedTemplate = pattern_assembler.extendPartials(tmpPartial, altPattern.engine);

    // assert
    test.equals(altPattern.extendedTemplate, basePattern.extendedTemplate);

    test.done();
  },

  'pseudopattern renders its extendedTemplate with its own data': function (test) {
    test.expect(1);

    // assert
    test.equals(altRendered, '<span class="test_base "> alternateMessage  </span>');

    test.done();
  },

  'pseudopattern rendered content is different from basePattern rendered content': function (test) {
    test.expect(2);

    // assert
    test.equals(baseRendered, '<span class="test_base ">   </span>');
    test.equals(altRendered === baseRendered, false);

    test.done();
  }
};
