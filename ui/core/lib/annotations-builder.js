'use strict';

const path = require('path');

const diveSync = require('diveSync');
const fs = require('fs-extra');

const frontMatterParser = require('./front-matter-parser');

module.exports = class {
  constructor(patternlab) {
    this.config = patternlab.config;
    this.ingredients = patternlab.ingredients;
    this.utils = patternlab.utils;
  }

  main() {
    let annotationsArr = [];

    // Gather what's in the annotations directory.
    diveSync(
      this.config.paths.source.annotations,
      (err, file) => {
        // Log any errors.
        /* istanbul ignore if */
        if (err) {
          this.utils.error(err);
          return;
        }

        const ext = path.extname(file);

        if (ext === this.config.frontMatterExtension) {
          const fileContent = fs.readFileSync(file, this.config.enc);
          annotationsArr = annotationsArr.concat(frontMatterParser.main(fileContent));
        }
      }
    );

    // Gather what's been parsed in the patterns directory.
    for (let i = 0, l = this.ingredients.patterns.length; i < l; i++) {
      const pattern = this.ingredients.patterns[i];

      if (pattern.isFrontMatter && Array.isArray(pattern.frontMatterData)) {
        annotationsArr = annotationsArr.concat(pattern.frontMatterData);
      }
    }

    // Writing non-strict js so it can be tested in Node.
    const annotationsNew = 'annotations=' + JSON.stringify(annotationsArr) + ';';

    // In order to improve browser LiveReload performance, only write annotationsFile if there are changes.
    const annotationsFile = `${this.config.paths.public.annotations}/annotations.js`;
    let annotationsOld = '';

    if (fs.existsSync(annotationsFile)) {
      annotationsOld = fs.readFileSync(annotationsFile, this.config.enc);
    }

    if (annotationsNew !== annotationsOld) {
      fs.outputFileSync(annotationsFile, annotationsNew);
    }
  }
};
