'use strict';

const slash = require('slash');

module.exports = () => {
  const config = require('./patternlab-config.json');
  const patternlab = new (require('../core/lib/patternlab'))(config, slash(__dirname));

  const dataDir = patternlab.config.paths.source.data;
  const patternsDir = patternlab.config.paths.source.patterns;
  const utils = patternlab.utils;

  return {
    dataDir,
    patternlab,
    patternsDir,
    utils
  };
};
