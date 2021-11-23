'use strict';

const fs = require('fs');

const JSON5 = require('json5');
const slash = require('slash');
const yaml = require('js-yaml');

module.exports = () => {
  try {
    if (!global.conf) {
      const yml = fs.readFileSync(`${slash(__dirname)}/conf.yml`, 'utf8');
      global.conf = yaml.load(yml);
    }
  }
  catch {
    // eslint-disable-next-line no-console
    console.error('Missing or malformed conf.yml! Exiting!');

    return;
  }

  const configStr = fs.readFileSync(`${__dirname}/patternlab-config.json`, global.conf.enc);
  const config = JSON5.parse(configStr);
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
