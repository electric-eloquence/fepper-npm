'use strict';

const Feplet = require('feplet');
const fs = require('fs-extra');

const objectFactory = require('./object-factory');

let patternlabInst;

module.exports = class {
  constructor(patternlab) {
    patternlabInst = patternlab;

    this.config = patternlab.config;
    this.ingredients = patternlab.ingredients;
    this.isViewallValid = false;
    this.public = patternlab.config.paths.public;
    this.source = patternlab.config.paths.source;
    this.utils = patternlab.utils;
  }

  // Getters for patternlab instance props in case they are undefined at instantiation.

  get patternBuilder() {
    return patternlabInst.patternBuilder;
  }

  get viewallBuilder() {
    return patternlabInst.viewallBuilder;
  }

  // METHODS

  processAllPatterns() {
    let patternsToExport;

    if (Array.isArray(this.config.patternExportPatternPartials) && this.config.patternExportPatternPartials.length) {
      patternsToExport = this.config.patternExportPatternPartials;
    }

    this.viewallBuilder.preParseViewallMarkup();
    this.viewallBuilder.processViewallData();

    this.isViewallValid = this.viewallBuilder.isViewallValid;

    // Need to process the first pattern in this.ingredients.patternTypes array in order to build viewall output.
    // Need to do this before the nested for loop.
    let isFirstPatternSubType;
    let firstPattern;

    if (this.ingredients.patternTypes.length && this.isViewallValid) {
      if (
        this.ingredients.patternTypes[0].patternTypeItems.length &&
        this.ingredients.patternTypes[0].patternTypeItems[0].patternName !== 'View All'
      ) {
        isFirstPatternSubType = false;
        firstPattern = this.ingredients.patternTypes[0].patternTypeItems[0].pattern;

        this.patternBuilder.processPattern(firstPattern);
      }
      else if (
        this.ingredients.patternTypes[0].patternSubTypes.length &&
        this.ingredients.patternTypes[0].patternSubTypes[0].patternSubTypeItems.length
      ) {
        isFirstPatternSubType = true;
        firstPattern = this.ingredients.patternTypes[0].patternSubTypes[0].patternSubTypeItems[0].pattern;

        this.patternBuilder.processPattern(firstPattern);
      }

      this.viewallBuilder.viewallPageHead = firstPattern.header +
        Feplet.render(this.viewallBuilder.viewallTemplateHead, this.ingredients.data);

      this.ingredients.viewallPatterns.viewall = new objectFactory.PatternViewall(
        // Naming the HTML file viewall.html instead of index.html to allow naming a Type "viewall" however unlikely.
        `${this.public.patterns}/viewall/viewall.html`,
        this.viewallBuilder.viewallPageHead
      );
    }

    // Omit scrape directory from viewalls.
    const scrapeTypeName = this.source.scrape.replace(`${this.source.patterns}/`, '').replace(/^\d*-/, '');

    // Process patterns and viewall in the same nested loop.
    // This way, memory can be freed for both at the end of each loop.
    for (let i = 0; i < this.ingredients.patternTypes.length; i++) {
      let j;
      const patternType = this.ingredients.patternTypes[i];

      if (this.isViewallValid && patternType.patternTypeLC !== scrapeTypeName) {
        this.ingredients.viewallPatterns[patternType.flatPatternPath] = new objectFactory.PatternViewall(
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
          this.patternBuilder.processPattern(pattern);
        }

        // Write pattern.
        if (!pattern.isHidden) {
          this.patternBuilder.writePattern(pattern);
        }

        // Export pattern.
        if (patternsToExport && patternsToExport.indexOf(pattern.patternPartial) > -1) {
          const patternPartialCode = this.utils.beautifyTemplate(pattern.extendedTemplate);

          fs.outputFileSync(
            `${this.config.patternExportDirectory}/${pattern.patternPartial}.html`,
            patternPartialCode
          );
        }

        // Write viewall body.
        if (this.isViewallValid) {
          if (pattern.isHidden) {
            // If this pattern is hidden, mark for deletion from nav.
            patternType.patternTypeItems[j] = null;
          }
          else if (patternType.patternTypeLC !== scrapeTypeName) {
            this.viewallBuilder.buildViewallTypeBody(patternTypeItem, patternType);
          }
        }

        this.patternBuilder.freePattern(pattern);
      }

      for (j = 0; j < patternType.patternSubTypes.length; j++) {
        let k;
        const patternSubType = patternType.patternSubTypes[j];

        // Build viewall head for this subType.
        if (this.isViewallValid) {
          this.ingredients.viewallPatterns[patternSubType.flatPatternPath] = new objectFactory.PatternViewall(
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
            this.patternBuilder.processPattern(pattern);
          }

          // Write pattern.
          if (!pattern.isHidden) {
            this.patternBuilder.writePattern(pattern);
          }

          // Export pattern.
          if (patternsToExport && patternsToExport.indexOf(pattern.patternPartial) > -1) {
            const patternPartialCode = this.utils.beautifyTemplate(pattern.extendedTemplate);

            fs.outputFileSync(
              `${this.config.patternExportDirectory}/${pattern.patternPartial}.html`,
              patternPartialCode
            );
          }

          // Write viewall body.
          if (this.isViewallValid) {
            if (pattern.isHidden) {
              // If this pattern is hidden, mark for deletion from nav.
              patternSubType.patternSubTypeItems[k] = null;
            }
            else {
              this.viewallBuilder.buildViewallSubTypeBody(patternSubTypeItem, patternSubType, patternType);
            }
          }

          this.patternBuilder.freePattern(pattern);
        }

        // Finish building subType viewall.
        if (this.isViewallValid) {
          this.viewallBuilder.buildViewallFooter(
            patternSubType.patternPartial,
            patternSubType.flatPatternPath
          );
        }
      }

      // Finish building type viewall.
      if (this.isViewallValid && patternType.patternTypeLC !== scrapeTypeName) {
        this.viewallBuilder.buildViewallFooter(patternType.patternPartial, patternType.flatPatternPath);
      }
    }

    // Finish building viewall.
    if (this.isViewallValid) {
      this.viewallBuilder.buildViewallFooter('viewall', 'viewall');
    }

    // Fully remove no longer needed data from patternTypes array so we don't write a huge ui/data.js file.
    for (let i = 0; i < this.ingredients.patternTypes.length; i++) {
      const patternType = this.ingredients.patternTypes[i];

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

    // Temporarily dereference .paths from the config object because we don't want absolute paths on the client.
    const configPaths = this.config.paths;
    delete this.config.paths;

    // Build the data into text output.
    let output = '';
    output += 'export const config = ' + JSON.stringify(this.config) + ';\n';
    output += 'export const ishControls = {"ishControlsHide":' + JSON.stringify(this.config.ishControlsHide) +
      '};\n';
    output += 'export const navItems = {"patternTypes": ' + JSON.stringify(this.ingredients.patternTypes) + '};\n';
    output += 'export const patternPaths = ' + JSON.stringify(this.ingredients.patternPaths) + ';\n';
    output += 'export const viewallPaths = ' + JSON.stringify(this.ingredients.viewallPaths) + ';\n';

    // Re-add .paths to the config object.
    this.config.paths = configPaths;

    // Write the output.
    fs.outputFileSync(`${this.public.styleguide}/scripts/ui/data.js`, output);
  }
};
