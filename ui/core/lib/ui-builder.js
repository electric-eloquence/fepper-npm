'use strict';

const beautify = require('js-beautify').html;
const Feplet = require('feplet');
const fs = require('fs-extra');
const RcLoader = require('rcloader');

const objectFactory = require('./object-factory');

module.exports = class {
  constructor(patternlab) {
    this.patternlab = patternlab;
    this.config = patternlab.config;
    this.public = patternlab.config.paths.public;
    this.source = patternlab.config.paths.source;
    this.viewallBuilder = null;
    this.viewallPatterns = patternlab.viewallPatterns;
    this.isViewallValid = false;
  }

  processAllPatterns() {
    const patternsToExport = this.config.patternExportPatternPartials;

    // Load js-beautify with options configured in .jsbeautifyrc.
    const rcLoader = new RcLoader('.jsbeautifyrc', {});
    const rcOpts = rcLoader.for(this.patternlab.cwd, {lookup: true});

    this.viewallBuilder = this.patternlab.viewallBuilder;
    this.viewallBuilder.preParseViewallMarkup();
    this.viewallBuilder.processViewallData();

    this.isViewallValid = this.viewallBuilder.isViewallValid;

    // Need to process the first pattern in this.patternlab.patternTypes array in order to write viewall output.
    // Need to do this before the nested for loop.
    let isFirstPatternSubType;
    let firstPattern;

    if (this.patternlab.patternTypes.length && this.isViewallValid) {
      if (
        this.patternlab.patternTypes[0].patternTypeItems.length &&
        this.patternlab.patternTypes[0].patternTypeItems[0].patternName !== 'View All'
      ) {
        isFirstPatternSubType = false;
        firstPattern = this.patternlab.patternTypes[0].patternTypeItems[0].pattern;

        this.patternlab.patternBuilder.processPattern(firstPattern);
      }
      else if (
        this.patternlab.patternTypes[0].patternSubTypes.length &&
        this.patternlab.patternTypes[0].patternSubTypes[0].patternSubTypeItems.length
      ) {
        isFirstPatternSubType = true;
        firstPattern = this.patternlab.patternTypes[0].patternSubTypes[0].patternSubTypeItems[0].pattern;

        this.patternlab.patternBuilder.processPattern(firstPattern);
      }

      this.viewallBuilder.viewallPageHead = firstPattern.header +
        Feplet.render(this.viewallBuilder.viewallTemplateHead, firstPattern.allData);

      this.viewallPatterns.viewall = new objectFactory.PatternViewall(
        // Naming the HTML file viewall.html instead of index.html to allow naming a Type "viewall" however unlikely.
        `${this.public.patterns}/viewall/viewall.html`,
        this.viewallBuilder.viewallPageHead
      );
    }

    // Omit scrape directory from viewalls.
    const scrapeTypeName = this.source.scrape.replace(`${this.source.patterns}/`, '').replace(/^\d*-/, '');

    // Process patterns and viewall in the same nested loop.
    // This way, memory can be freed for both at the end of each loop.
    for (let i = 0; i < this.patternlab.patternTypes.length; i++) {
      let j;
      const patternType = this.patternlab.patternTypes[i];

      if (this.isViewallValid && patternType.patternTypeLC !== scrapeTypeName) {
        this.viewallPatterns[patternType.flatPatternPath] = new objectFactory.PatternViewall(
          `${this.public.patterns}/${patternType.flatPatternPath}/index.html`,
          this.viewallBuilder.viewallPageHead
        );
        this.viewallBuilder.buildViewallTypeHead(patternType);
      }

      // Iterate through this type's items.
      for (j = 0; j < patternType.patternTypeItems.length; j++) {
        const patternTypeItem = patternType.patternTypeItems[j];

        if (patternTypeItem.patternName === 'View All') {
          continue;
        }

        const pattern = patternTypeItem.pattern;

        // Process pattern.
        // Always process Type if 1st pattern is subType.
        // Otherwise, skip if both i === 0 and j === 0.
        if (isFirstPatternSubType || i > 0 || j > 0) {
          this.patternlab.patternBuilder.processPattern(pattern);
        }

        // Write pattern.
        if (!this.patternlab.isPatternExcluded(pattern)) {
          this.patternlab.patternBuilder.writePattern(pattern);
        }

        // Export pattern.
        if (Array.isArray(patternsToExport)) {
          if (patternsToExport.indexOf(pattern.patternPartial) > -1) {
            const patternPartialCode = beautify(pattern.extendedTemplate, rcOpts) + '\n';

            fs.outputFileSync(
              `${this.config.patternExportDirectory}/${pattern.patternPartial}.html`,
              patternPartialCode
            );
          }
        }

        // Write viewall body.
        if (this.isViewallValid) {
          if (this.patternlab.isPatternExcluded(pattern)) {
            // If this pattern is excluded, mark for deletion from nav.
            patternType.patternTypeItems[j] = null;
          }
          else if (patternType.patternTypeLC !== scrapeTypeName) {
            this.viewallBuilder.buildViewallTypeBody(patternTypeItem, patternType);
          }
        }

        this.patternlab.patternBuilder.freePattern(pattern);
      }

      for (j = 0; j < patternType.patternSubTypes.length; j++) {
        let k;
        const patternSubType = patternType.patternSubTypes[j];

        // Build viewall head for this subType.
        if (this.isViewallValid) {
          this.viewallPatterns[patternSubType.flatPatternPath] = new objectFactory.PatternViewall(
            `${this.public.patterns}/${patternSubType.flatPatternPath}/index.html`,
            this.viewallBuilder.viewallPageHead
          );
          this.viewallBuilder.buildViewallSubTypeHead(patternSubType, patternType);
        }

        // Iterate through this subType's items.
        for (k = 0; k < patternSubType.patternSubTypeItems.length; k++) {
          const patternSubTypeItem = patternSubType.patternSubTypeItems[k];

          if (patternSubTypeItem.patternName === 'View All') {
            continue;
          }

          const pattern = patternSubTypeItem.pattern;

          // Process pattern.
          // Always process subType if 1st pattern is not subType.
          // Otherwise, skip if i === 0, j === 0, and k === 0.
          if (!isFirstPatternSubType || i > 0 || j > 0 || k > 0) {
            this.patternlab.patternBuilder.processPattern(pattern);
          }

          // Write pattern.
          if (!this.patternlab.isPatternExcluded(pattern)) {
            this.patternlab.patternBuilder.writePattern(pattern);
          }

          // Export pattern.
          if (Array.isArray(patternsToExport)) {
            if (patternsToExport.indexOf(pattern.patternPartial) > -1) {
              const patternPartialCode = beautify(pattern.extendedTemplate, rcOpts) + '\n';

              fs.outputFileSync(
                `${this.config.patternExportDirectory}/${pattern.patternPartial}.html`,
                patternPartialCode
              );
            }
          }

          // Write viewall body.
          if (this.isViewallValid) {
            if (this.patternlab.isPatternExcluded(pattern)) {
              // If this pattern is excluded, mark for deletion from nav.
              patternSubType.patternSubTypeItems[k] = null;
            }
            else {
              this.viewallBuilder.buildViewallSubTypeBody(patternSubTypeItem, patternSubType, patternType);
            }
          }

          this.patternlab.patternBuilder.freePattern(pattern);
        }

        // Finish writing subType viewall.
        if (this.isViewallValid) {
          this.viewallBuilder.buildViewallFooter(
            patternSubType.patternPartial,
            patternSubType.flatPatternPath
          );
        }
      }

      // Finish writing type viewall.
      if (this.isViewallValid && patternType.patternTypeLC !== scrapeTypeName) {
        this.viewallBuilder.buildViewallFooter(patternType.patternPartial, patternType.flatPatternPath);
      }
    }

    // Finish writing viewall.
    if (this.isViewallValid) {
      this.viewallBuilder.buildViewallFooter('viewall', 'viewall');
    }

    // Fully remove no longer needed data from patternTypes array so we don't write a huge patternlab-data.js file.
    for (let i = 0; i < this.patternlab.patternTypes.length; i++) {
      const patternType = this.patternlab.patternTypes[i];

      delete patternType.pathsPublic;

      for (let j = 0; j < patternType.patternTypeItems.length; j++) {
        const patternTypeItem = patternType.patternTypeItems[j];

        if (!patternTypeItem) {
          patternType.patternTypeItems.splice(j, 1);
          j--;
        }
        else {
          delete patternTypeItem.pathsPublic;
          delete patternTypeItem.pattern;
        }
      }

      for (let j = 0; j < patternType.patternSubTypes.length; j++) {
        const patternSubType = patternType.patternSubTypes[j];

        delete patternSubType.pathsPublic;

        for (let k = 0; k < patternSubType.patternSubTypeItems.length; k++) {
          const patternSubTypeItem = patternSubType.patternSubTypeItems[k];

          if (!patternSubTypeItem) {
            patternSubType.patternSubTypeItems.splice(k, 1);
            k--;
          }
          else {
            delete patternSubTypeItem.pathsPublic;
            delete patternSubTypeItem.pattern;
          }
        }
      }
    }
  }

  writePatternlabData() {
    // Clone this.config and delete .paths from it because we don't want absolute paths on the client.
    const configClone = JSON.parse(JSON.stringify(this.config));
    delete configClone.paths;

    // Build the data into text output.
    let output = '';
    output += 'window.config = ' + JSON.stringify(configClone) + ';\n';
    output += 'window.ishControls = {"ishControlsHide":' + JSON.stringify(configClone.ishControlsHide) +
      '};\n';
    output += 'window.navItems = {"patternTypes": ' + JSON.stringify(this.patternlab.patternTypes) + '};\n';
    output += 'window.patternPaths = ' + JSON.stringify(this.patternlab.patternPaths) + ';\n';
    output += 'window.viewallPaths = ' + JSON.stringify(this.patternlab.viewallPaths) + ';\n';

    // Write the output.
    fs.outputFileSync(`${this.public.styleguide}/data/patternlab-data.js`, output);
  }
};
