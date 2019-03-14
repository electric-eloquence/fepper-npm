'use strict';

const fs = require('fs');

const slash = require('slash');
const yaml = require('js-yaml');

module.exports = () => {
  try {
    const yml = fs.readFileSync(`${slash(__dirname)}/conf.yml`, 'utf8');
    global.conf = yaml.safeLoad(yml);
  }
  catch (err) {
    // eslint-disable-next-line no-console
    console.error('Missing or malformed conf.yml! Exiting!');

    return;
  }

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
