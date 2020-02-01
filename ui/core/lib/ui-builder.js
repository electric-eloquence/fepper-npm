'use strict';

const Feplet = require('feplet');
const fs = require('fs-extra');

const objectFactory = require('./object-factory');

module.exports = class {
  #patternlab;

  constructor(patternlab) {
    this.#patternlab = patternlab;

    this.config = patternlab.config;
    this.ingredients = patternlab.ingredients;
    this.isViewallValid = false;
    this.public = patternlab.config.paths.public;
    this.source = patternlab.config.paths.source;
    this.utils = patternlab.utils;
  }

  // GETTERS for patternlab instance props in case they are undefined at instantiation.

  get patternBuilder() {
    return this.#patternlab.patternBuilder;
  }

  get viewallBuilder() {
    return this.#patternlab.viewallBuilder;
  }

  // METHODS

  processAllPatterns() {
    const dateNow = Date.now();

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
    // 0 FOR-LOOP LEVELS IN.
    for (let in0 = 0, le0 = this.ingredients.patternTypes.length; in0 < le0; in0++) {
      const patternType = this.ingredients.patternTypes[in0];

      if (this.isViewallValid && patternType.patternTypeLC !== scrapeTypeName) {
        this.ingredients.viewallPatterns[patternType.flatPatternPath] = new objectFactory.PatternViewall(
          `${this.public.patterns}/${patternType.flatPatternPath}/index.html`,
          this.viewallBuilder.viewallPageHead
        );
        this.viewallBuilder.buildViewallTypeHead(patternType);
      }

      // Iterate through this type's items.
      // 1 FOR-LOOP LEVELS IN.
      for (let in1 = 0, le1 = patternType.patternTypeItems.length; in1 < le1; in1++) {
        const patternTypeItem = patternType.patternTypeItems[in1];

        if (patternTypeItem.patternName === 'View All') {
          continue;
        }

        const pattern = patternTypeItem.pattern;

        // Process pattern.
        // Always process Type if 1st pattern is subType.
        // Otherwise, skip if both in0 === 0 and in1 === 0.
        if (isFirstPatternSubType || in0 > 0 || in1 > 0) {
          this.patternBuilder.processPattern(pattern);
        }

        // Write pattern.
        if (!pattern.isHidden) {
          this.patternBuilder.writePattern(pattern, dateNow);
        }

        // Export pattern.
        if (patternsToExport && patternsToExport.indexOf(pattern.patternPartial) > -1) {
          const patternPartialCode = this.utils.beautifyTemplate(pattern.templateExtended);

          fs.outputFileSync(
            `${this.config.patternExportDirectory}/${pattern.patternPartial}.html`,
            patternPartialCode
          );
        }

        // Build viewall body.
        if (this.isViewallValid) {
          if (pattern.isHidden) {
            // If this pattern is hidden, mark for deletion from nav.
            patternType.patternTypeItems[in1] = null;
          }
          else if (patternType.patternTypeLC !== scrapeTypeName) {
            this.viewallBuilder.buildViewallTypeBody(patternTypeItem, patternType);
          }
        }

        this.patternBuilder.freePattern(pattern);
      }

      // 1 FOR-LOOP LEVELS IN.
      for (let in1 = 0, le1 = patternType.patternSubTypes.length; in1 < le1; in1++) {
        const patternSubType = patternType.patternSubTypes[in1];

        // Build viewall head for this subType.
        if (this.isViewallValid) {
          this.ingredients.viewallPatterns[patternSubType.flatPatternPath] = new objectFactory.PatternViewall(
            `${this.public.patterns}/${patternSubType.flatPatternPath}/index.html`,
            this.viewallBuilder.viewallPageHead
          );
          this.viewallBuilder.buildViewallSubTypeHead(patternSubType, patternType);
        }

        // Iterate through this subType's items.
        // 2 FOR-LOOP LEVELS IN.
        for (let in2 = 0, le2 = patternSubType.patternSubTypeItems.length; in2 < le2; in2++) {
          const patternSubTypeItem = patternSubType.patternSubTypeItems[in2];

          if (patternSubTypeItem.patternName === 'View All') {
            continue;
          }

          const pattern = patternSubTypeItem.pattern;

          // Process pattern.
          // Always process subType if 1st pattern is not subType.
          // Otherwise, skip if in0 === 0, in1 === 0, and in2 === 0.
          if (!isFirstPatternSubType || in0 > 0 || in1 > 0 || in2 > 0) {
            this.patternBuilder.processPattern(pattern);
          }

          // Write pattern.
          if (!pattern.isHidden) {
            this.patternBuilder.writePattern(pattern, dateNow);
          }

          // Export pattern.
          if (patternsToExport && patternsToExport.indexOf(pattern.patternPartial) > -1) {
            const patternPartialCode = this.utils.beautifyTemplate(pattern.templateExtended);

            fs.outputFileSync(
              `${this.config.patternExportDirectory}/${pattern.patternPartial}.html`,
              patternPartialCode
            );
          }

          // Build viewall body.
          if (this.isViewallValid) {
            if (pattern.isHidden) {
              // If this pattern is hidden, mark for deletion from nav.
              patternSubType.patternSubTypeItems[in2] = null;
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
    // 0 FOR-LOOP LEVELS IN.
    for (let in0 = 0, le0 = this.ingredients.patternTypes.length; in0 < le0; in0++) {
      const patternType = this.ingredients.patternTypes[in0];

      delete patternType.pathsPublic;

      // 1 FOR-LOOP LEVELS IN.
      // Must reevaluate length each iteration so we cannot cache le1.
      for (let in1 = 0; in1 < patternType.patternTypeItems.length; in1++) {
        const patternTypeItem = patternType.patternTypeItems[in1];

        if (!patternTypeItem) {
          patternType.patternTypeItems.splice(in1, 1);
          in1--;
        }
        else {
          delete patternTypeItem.pathsPublic;
          delete patternTypeItem.pattern;
        }
      }

      // 1 FOR-LOOP LEVELS IN.
      for (let in1 = 0, le1 = patternType.patternSubTypes.length; in1 < le1; in1++) {
        const patternSubType = patternType.patternSubTypes[in1];

        delete patternSubType.pathsPublic;

        // 2 FOR-LOOP LEVELS IN.
        // Must reevaluate length each iteration so we cannot cache le2.
        for (let in2 = 0; in2 < patternSubType.patternSubTypeItems.length; in2++) {
          const patternSubTypeItem = patternSubType.patternSubTypeItems[in2];

          if (!patternSubTypeItem) {
            patternSubType.patternSubTypeItems.splice(in2, 1);
            in2--;
          }
          else {
            delete patternSubTypeItem.pathsPublic;
            delete patternSubTypeItem.pattern;
          }
        }
      }
    }

    // Write hashes file.
    fs.writeJsonSync(`${this.config.paths.public.patterns}/hashes.json`, this.ingredients.hashesNew);

    // Unset partials and partialsComp;
    for (let i in this.ingredients.partials) { // eslint-disable-line guard-for-in
      this.ingredients.partials[i] = '';
      this.ingredients.partialsComp[i] = {};
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
