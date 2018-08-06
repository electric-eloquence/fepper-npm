'use strict';

const beautify = require('js-beautify').html;
const fs = require('fs-extra');
const RcLoader = require('rcloader');

module.exports = class {
  constructor(patternlab) {
    this.patternlab = patternlab;
  }

  main() {
    // Read the config export options.
    const exportPartials = this.patternlab.config.patternExportPatternPartials;

    if (!Array.isArray(exportPartials)) {
      return;
    }

    // Load js-beautify with options configured in .jsbeautifyrc.
    const rcLoader = new RcLoader('.jsbeautifyrc', {});
    const rcOpts = rcLoader.for(this.patternlab.cwd, {lookup: true});

    // Find the chosen patterns to export. This keys only off .patternPartial. Since pattern-export functionality is
    // vestigial at best, we'll basically leave it alone.
    for (let i = 0, l = exportPartials.length; i < l; i++) {
      for (let j = 0, le = this.patternlab.patterns.length; j < le; j++) {
        if (exportPartials[i] === this.patternlab.patterns[j].patternPartial) {
          const patternPartialCode = beautify(this.patternlab.patterns[j].extendedTemplate, rcOpts) + '\n';

          fs.outputFileSync(
            `${this.patternlab.config.patternExportDirectory}/${this.patternlab.patterns[j].patternPartial}.html`,
            patternPartialCode
          );
        }
      }
    }
  }
};
