'use strict';

require('../init');

const helper = global.fepper.tasks.helper;

describe('Helper', function () {
  it('should output task descriptions', function () {
    helper.main();
  });
});
