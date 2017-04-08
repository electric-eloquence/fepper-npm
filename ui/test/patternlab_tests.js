'use strict';

exports.patternlab_test = {
  'buildPatternData - should merge all JSON files in the data folder except listitems': function (test) {
    var config = require('./patternlab-config.json');
    var cwd = process.cwd() + '/test';
    var plMain = new (require('../core/lib/patternlab'))(config, cwd);
    var data_dir = './test/files/_data';

    var dataResult = plMain.buildPatternData(data_dir);
    test.equals(dataResult.data, 'test');
    test.equals(dataResult.foo, 'bar');
    test.equals(dataResult.test_list_item, undefined);
    test.done();
  }
};
