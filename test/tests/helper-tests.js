'use strict';

const {
  fepper
} = require('../init')();

describe('Helper', function () {
  it('should output task descriptions', function () {
    fepper.tasks.helper.main();
  });
});
