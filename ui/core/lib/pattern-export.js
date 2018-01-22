'use strict';

const beautify = require('js-beautify').html;
const fs = require('fs-extra');
const path = require('path');
const RcLoader = require('rcloader');

module.exports = function (patternlab) {
  // read the config export options
  const exportPartials = patternlab.config.patternExportPatternPartials;

  if (!Array.isArray(exportPartials)) {
    return;
  }

  // load js-beautify with options configured in .jsbeautifyrc
  const rcLoader = new RcLoader('.jsbeautifyrc', {});
  const rcOpts = rcLoader.for(patternlab.cwd, {lookup: true});

  // find the chosen patterns to export
  for (let i = 0, l = exportPartials.length; i < l; i++) {
    for (let j = 0, le = patternlab.patterns.length; j < le; j++) {
      if (exportPartials[i] === patternlab.patterns[j].patternPartial) {
        // load .jsbeautifyrc and beautify html
        let extendedTemplate = beautify(patternlab.patterns[j].extendedTemplate, rcOpts) + '\n';

        // write matches to the desired location
        fs.outputFileSync(
          path.resolve(
            patternlab.config.patternExportDirectory,
            patternlab.patterns[j].patternPartial + '.html'
          ),
          patternPartialCode
        );

        // free memory
        patternlab.patterns[j].extendedTemplate = null;
        delete patternlab.patterns[j].extendedTemplate;
      }
    }
  }
};
