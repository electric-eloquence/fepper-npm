'use strict';

const path = require('path');

const Feplet = require('feplet');
const fs = require('fs-extra');
const JSON5 = require('json5');

const frontMatterParser = require('./front-matter-parser');
const Pattern = require('./object-factory').Pattern;

module.exports = class {
  constructor(patternlab) {
    this.patternlab = patternlab;
    this.utils = patternlab.utils;
  }

  // PRIVATE METHODS

  addPattern(pattern) {
    this.patternlab.data.link[pattern.patternPartial] = '../' + pattern.patternLink;

    // Only push to array if the array doesn't contain this pattern.
    let isNew = true;

    for (let i = 0, l = this.patternlab.patterns.length; i < l; i++) {
      // So we need the identifier to be unique, which patterns[i].relPath is.
      if (pattern.relPath === this.patternlab.patterns[i].relPath) {
        // If relPath already exists, overwrite that element.
        this.patternlab.patterns[i] = pattern;
        isNew = false;

        break;
      }
    }

    // If the pattern is new, we must register it with various data structures!
    if (isNew) {
      if (this.patternlab.config.debug) {
        this.utils.log('Found new pattern ' + pattern.patternPartial);
      }

      this.patternlab.patterns.push(pattern);
    }
  }

  isPseudoPatternJson(fileName) {
    const extension = path.extname(fileName);

    return (extension === '.json' && fileName.indexOf('~') > -1);
  }

  isPatternFile(fileName) {
    const extension = path.extname(fileName);

    // Skip hidden patterns and data files.
    if (fileName.charAt(0) === '.' || (extension === '.json' && !this.isPseudoPatternJson(fileName))) {
      return false;
    }

    // Return boolean condition for everything else.
    return (
      extension === this.patternlab.config.patternExtension ||
      extension === this.patternlab.config.frontMatterExtension ||
      this.isPseudoPatternJson(fileName)
    );
  }

  preProcessFrontMatter(pattern) {
    pattern.frontMatterData = frontMatterParser.main(pattern.template);
    pattern.frontMatterRelPathTrunc = pattern.relPathTrunc;
    pattern.isFrontMatter = true;
    pattern.isHidden = true;
    pattern.isPattern = false;

    // Unset Patternlab.getPattern identifiers.
    pattern.patternPartialPhp = '';
    pattern.patternPartial = '';
    pattern.relPathTrunc = '';
    pattern.relPath = '';
  }

  preProcessPartials(fepletPartials) {
    for (let i in fepletPartials) {
      if (!fepletPartials.hasOwnProperty(i)) {
        continue;
      }

      const partial = fepletPartials[i];

      // If undefined, create a placeholder in the partials object to get populated later.
      if (typeof this.patternlab.partials[partial.name] === 'undefined') {
        this.patternlab.partials[partial.name] = ''; // Needs to be string.
      }

      // Same thing for partialsComp object.
      if (typeof this.patternlab.partialsComp[partial.name] === 'undefined') {
        this.patternlab.partialsComp[partial.name] = null;
      }
    }
  }

  setState(pattern) {

    // Check for a corresponding Front Matter file to the pattern and get the patternState from its data.
    for (let i = 0, l = this.patternlab.patterns.length; i < l; i++) {
      const fmCandidate = this.patternlab.patterns[i];

      if (
        fmCandidate.isFrontMatter &&
        fmCandidate.frontMatterRelPathTrunc === pattern.relPathTrunc &&
        fmCandidate.frontMatterData
      ) {
        for (let j = 0, le = fmCandidate.frontMatterData.length; j < le; j++) {
          if (fmCandidate.frontMatterData[j].state) {
            pattern.patternState = fmCandidate.frontMatterData[j].state;

            return;
          }
        }
      }
    }

    // DEPRECATED.
    if (this.patternlab.config.patternStates && this.patternlab.config.patternStates[pattern.patternPartial]) {
      pattern.patternState = this.patternlab.config.patternStates[pattern.patternPartial];
    }
  }

  // PUBLIC METHODS

  preProcessPattern(relPath) {
    const fileObject = path.parse(relPath);

    // Extract some information.
    const fileName = fileObject.base;
    const ext = fileObject.ext;
    const patternsPath = this.patternlab.config.paths.source.patterns;

    // Skip non-pattern files.
    if (!this.isPatternFile(fileName)) {
      return null;
    }

    // Make a new Pattern instance.
    const pattern = new Pattern(relPath, this.patternlab);

    // Look for a json file for this template.
    let jsonFileName;

    if (ext === this.patternlab.config.patternExtension || ext === '.json') {
      jsonFileName = `${patternsPath}/${pattern.subdir}/${pattern.fileName}.json`;

      if (fs.existsSync(jsonFileName)) {
        try {
          const jsonFileStr = fs.readFileSync(jsonFileName, this.patternlab.enc);

          pattern.jsonFileData = JSON5.parse(jsonFileStr);

          if (this.patternlab.config.debug) {
            this.utils.log('Found pattern-specific JSON data for ' + pattern.patternPartial);
          }
        }
        catch (err) {
          this.utils.error('There was an error parsing pattern-specific JSON for ' + pattern.relPath);
          this.utils.error(err);
        }
      }

      // If file is named in the syntax for variants, add data keys to dataKeysSchemaObj, add and return pattern.
      if (this.isPseudoPatternJson(fileName)) {
        this.utils.extendButNotOverride(this.patternlab.dataKeysSchemaObj, pattern.jsonFileData);
        this.addPattern(pattern);

        return pattern;
      }
    }

    // Preprocess Front Matter files.
    else if (ext === this.patternlab.config.frontMatterExtension || ext === '.md') {
      const mustacheFileName =
        `${patternsPath}/${pattern.subdir}/${pattern.fileName}` + this.patternlab.config.patternExtension;
      const jsonFileName =
        `${patternsPath}/${pattern.subdir}/${pattern.fileName}` + '.json';

      // Check for a corresponding Pattern or JSON file.
      // If it exists, preprocess Front Matter and add it to the patterns array.
      if (fs.existsSync(mustacheFileName) || fs.exists(jsonFileName)) {
        pattern.template = fs.readFileSync(`${patternsPath}/${relPath}`, this.patternlab.enc);

        this.addPattern(pattern);
        this.preProcessFrontMatter(pattern);
      }

      return pattern;
    }

    // Can ignore all non-supported files at this point.
    else {
      return pattern;
    }

    // See if this file has a state.
    this.setState(pattern);

    // Look for a listitems.json file for this template.
    const listJsonFileName = `${patternsPath}/${pattern.subdir}/${pattern.fileName}` + '.listitems.json';

    if (fs.existsSync(listJsonFileName)) {
      try {
        const jsonFileStr = fs.readFileSync(listJsonFileName, this.patternlab.enc);

        pattern.listItems = JSON5.parse(jsonFileStr);

        if (this.patternlab.config.debug) {
          this.utils.log('Found pattern-specific listitems.json for ' + pattern.patternPartial);
        }

        this.patternlab.listItemsBuilder.listItemsBuild(pattern);
        this.utils.extendButNotOverride(pattern.jsonFileData.listItems, this.patternlab.data.listItems);
      }
      catch (err) {
        this.utils.error('There was an error parsing pattern-specific listitems.json for ' +
          pattern.relPath);
        this.utils.error(err);
      }
    }

    this.utils.extendButNotOverride(this.patternlab.dataKeysSchemaObj, pattern.jsonFileData);
    pattern.template = fs.readFileSync(`${patternsPath}/${relPath}`, this.patternlab.enc);

    const scan = Feplet.scan(pattern.template);
    const parseArr = Feplet.parse(scan);

    // Check if the template uses listItems.
    this.patternlab.useListItems = this.patternlab.listItemsBuilder.listItemsScan(parseArr);

    pattern.fepletParse = parseArr;
    pattern.fepletComp = Feplet.generate(parseArr, pattern.template, {});

    // Prepopulate possible non-param matches for partials with params.
    // These are references, so they shouldn't use significant memory, thus justifying not having to regenerate.
    this.patternlab.partialsComp[pattern.patternPartialPhp] = pattern.fepletComp;
    this.patternlab.partialsComp[pattern.patternPartial] = pattern.fepletComp;
    this.patternlab.partialsComp[pattern.relPathTrunc] = pattern.fepletComp;
    this.patternlab.partialsComp[pattern.relPath] = pattern.fepletComp;

    this.preProcessPartials(pattern.fepletComp.partials);

    // Add pattern to this.patternlab.patterns array.
    this.addPattern(pattern);

    return pattern;
  }

  preProcessPartialParams() {
    const {
      partials,
      partialsComp,
      patterns
    } = this.patternlab;

    for (let partialName in partials) {
      if (!partials.hasOwnProperty(partialName)) {
        continue;
      }

      const pattern = this.patternlab.getPattern(partialName);

      if (pattern) {
        partials[partialName] = pattern.template;
        partialsComp[partialName] = pattern.fepletComp;
      }

      // If no exact match, must have param.
      else {
        // Make sure there is an entry for the non-param partial.
        for (let i = 0, l = patterns.length; i < l; i++) {
          let nonParamPartialName;

          if (partialName.indexOf(patterns[i].patternPartialPhp) === 0) {
            nonParamPartialName = patterns[i].patternPartialPhp;
          }
          else if (partialName.indexOf(patterns[i].patternPartial) === 0) {
            nonParamPartialName = patterns[i].patternPartial;
          }
          else if (partialName.indexOf(patterns[i].relPathTrunc) === 0) {
            nonParamPartialName = patterns[i].relPathTrunc;
          }
          else if (partialName.indexOf(patterns[i].relPath) === 0) {
            nonParamPartialName = patterns[i].relPath;
          }

          if (nonParamPartialName) {
            partials[nonParamPartialName] = patterns[i].template;
            partialsComp[nonParamPartialName] = patterns[i].fepletComp;

            break;
          }
        }
      }
    }

    // Remove any reference between partialKeysArr and partials object because we need to add to the partials object.
    // We therefore do not want to iterate on the partials object itself.
    const partialKeysArr = Object.keys(partials);

    // Since we have all non-param partials saved, preprocess partials with params.
    for (let i = 0, l = partialKeysArr.length; i < l; i++) {
      const partialKey = partialKeysArr[i];
      const partialText = partials[partialKey];
      const partialComp = partialsComp[partialKey];
      const pattern = this.patternlab.getPattern(partialKey);

      Feplet.preProcessPartialParams(partialText, partialComp, partials, partialsComp, this.patternlab.dataKeys);

      if (pattern) {
        pattern.isPreProcessed = true;
      }
    }

    // Iterate through patterns this time.
    for (let i = 0, l = patterns.length; i < l; i++) {
      const pattern = patterns[i];

      // Preprocess partials with params that exist in higher level patterns.
      if (!pattern.isPreProcessed) {
        Feplet.preProcessPartialParams(pattern.template, pattern.fepletComp, partials, partialsComp,
          this.patternlab.dataKeys);
      }

      // Find and set lineages.
      this.patternlab.lineageBuilder.main(pattern);
      pattern.lineageExists = pattern.lineage.length > 0;
      pattern.lineageRExists = pattern.lineageR.length > 0;
    }
  }

  processPattern(pattern) {
    if (pattern.isFrontMatter) {
      return;
    }

    // The tilde suffix will sort pseudoPatterns after basePatterns.
    // So first, check if this is not a pseudoPattern (therefore a basePattern) and set up the .allData property.
    if (!this.isPseudoPatternJson(pattern.relPath)) {

      if (pattern.jsonFileData) {
        pattern.allData =
          this.utils.extendButNotOverride(JSON.parse(JSON.stringify(pattern.jsonFileData)), this.patternlab.data);
      }
      else {
        pattern.jsonFileData = {};
        // If no local data, create reference to this.patternlab.allData.
        pattern.allData = this.patternlab.data;
      }

      // Set cacheBuster property on allData.
      pattern.allData.cacheBuster = pattern.cacheBuster;
    }

    // Render extendedTemplate whether pseudoPattern or not. Write it to pattern object.
    pattern.extendedTemplate =
      pattern.fepletComp.render(pattern.allData, this.patternlab.partials, null, this.patternlab.partialsComp);

    // If this is not a pseudoPattern (and therefore a basePattern), look for its pseudoPattern variants.
    if (!this.isPseudoPatternJson(pattern.relPath)) {
      this.patternlab.pseudoPatternBuilder.main(pattern);
    }

    // Render header.
    const dataKeys = Object.keys(pattern.jsonFileData);
    let header;
    let useUserHeadLocal = false;

    for (let i = 0, l = this.patternlab.userHeadComp.length; i < l; i++) {
      const compItem = this.patternlab.userHeadComp[i];

      if (compItem.tag === '_v') {
        if (dataKeys.indexOf(compItem.n) > -1) {
          useUserHeadLocal = true;

          break;
        }
      }
    }

    if (useUserHeadLocal) {
      header = Feplet.render(this.patternlab.userHeadRaw, pattern.allData);
    }
    else {
      header = this.patternlab.userHeadGlobal;
    }

    // Prepare footer.
    // Exclude hidden lineage items from array destined for output.
    const lineage = [];

    for (let lineageItem of pattern.lineage) {
      if (!lineageItem.isHidden) {
        lineage.push(lineageItem);
      }
    }

    const lineageExists = Boolean(lineage.length);

    // Exclude hidden lineageR items from array destined for output.
    const lineageR = [];

    for (let lineageRItem of pattern.lineageR) {
      if (!lineageRItem.isHidden) {
        lineageR.push(lineageRItem);
      }
    }

    const lineageRExists = Boolean(lineageR.length);

    // Stringify these data for individual pattern rendering and use on the styleguide.
    pattern.allData.patternData = JSON.stringify({
      lineage,
      lineageExists,
      lineageR,
      lineageRExists,
      patternDesc: pattern.patternDescExists ? pattern.patternDesc : '',
      patternExtension: pattern.fileExtension,
      patternName: pattern.patternName,
      patternPartial: pattern.patternPartial,
      patternState: pattern.patternState
    });

    // Set the pattern-specific footer by compiling the general-footer with data, and then adding it to userFoot.
    const footerPartial = Feplet.render(this.patternlab.footer, {
      cacheBuster: this.patternlab.cacheBuster,
      isPattern: pattern.isPattern,
      lineage: JSON.stringify(lineage),
      lineageR: JSON.stringify(lineageR),
      patternData: pattern.allData.patternData,
      patternPartial: pattern.patternPartial,
      patternState: pattern.patternState,
      portReloader: this.patternlab.portReloader,
      portServer: this.patternlab.portServer
    });

    // Build footer.
    let footer = '';

    for (let i = 0, l = this.patternlab.userFootSplit.length; i < l; i++) {
      if (i > 0) {
        footer += footerPartial;
      }

      footer += this.patternlab.userFootSplit[i];
    }

    pattern.header = header;
    pattern.footer = footer;
  }

  writePattern(pattern) {
    if (pattern.isFrontMatter) {
      return;
    }

    // Write the built template to the public patterns directory.
    const paths = this.patternlab.config.paths;
    const patternPage = pattern.header + pattern.extendedTemplate + pattern.footer;

    fs.outputFileSync(`${paths.public.patterns}/${pattern.patternLink}`, patternPage);

    // Write the mustache file.
    const outfileMustache = paths.public.patterns + '/' +
      pattern.patternLink.slice(0, -(pattern.outfileExtension.length)) + this.patternlab.config.patternExtension;

    fs.outputFileSync(outfileMustache, pattern.template);

    // Write the markup-only version.
    const outfileMarkupOnly = paths.public.patterns + '/' +
      pattern.patternLink.slice(0, -(pattern.outfileExtension.length)) + '.markup-only' + pattern.outfileExtension;

    fs.outputFileSync(outfileMarkupOnly, pattern.extendedTemplate);
  }

  freePattern(pattern) {
    // Will free significant memory if processing many templates.
    for (let key in pattern) {
      if (!pattern.hasOwnProperty(key)) {
        continue;
      }

      // Retain these keys so patterns can continue to be looked up.
      switch (key) {
        case 'patternLink':
        case 'patternPartialPhp':
        case 'patternPartial':
        case 'pseudoPatternPartial':
        case 'relPathTrunc':
        case 'relPath':
          continue;
      }

      delete pattern[key];
    }
  }
};
