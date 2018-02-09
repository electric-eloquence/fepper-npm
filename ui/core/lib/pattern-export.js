'use strict';

const beautify = require('js-beautify').html;
const fs = require('fs-extra');
const path = require('path');
const RcLoader = require('rcloader');

module.exports = function (patternlab) {
  // Read the config export options.
  const exportPartials = patternlab.config.patternExportPatternPartials;

  if (!Array.isArray(exportPartials)) {
    return;
  }

  // Load js-beautify with options configured in .jsbeautifyrc.
  const rcLoader = new RcLoader('.jsbeautifyrc', {});
  const rcOpts = rcLoader.for(patternlab.cwd, {lookup: true});

  // Find the chosen patterns to export. This keys only off .patternPartial. Since pattern-export functionality is
  // vestigial at best, we'll basically leave it alone.
  for (let i = 0, l = exportPartials.length; i < l; i++) {
    for (let j = 0, le = patternlab.patterns.length; j < le; j++) {
      if (exportPartials[i] === patternlab.patterns[j].patternPartial) {
        let extendedTemplate = beautify(patternlab.patterns[j].extendedTemplate, rcOpts) + '\n';

        fs.outputFileSync(
          path.resolve(
            patternlab.config.patternExportDirectory,
            patternlab.patterns[j].patternPartial + '.html'
          ),
          patternPartialCode
        );
      }
    }
  }
};
