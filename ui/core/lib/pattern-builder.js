'use strict';

const path = require('path');

const Feplet = require('feplet');
const fs = require('fs-extra');
const JSON5 = require('json5');
const XXHash = require('xxhash');

const frontMatterParser = require('./front-matter-parser');
const Pattern = require('./object-factory').Pattern;

module.exports = class {
  #patternlab;

  constructor(patternlab) {
    this.#patternlab = patternlab;

    this.config = patternlab.config;
    this.ingredients = patternlab.ingredients;
    this.utils = patternlab.utils;
  }

  // Getters for patternlab instance props in case they are undefined at instantiation.

  get lineageBuilder() {
    return this.#patternlab.lineageBuilder;
  }

  get listItemsBuilder() {
    return this.#patternlab.listItemsBuilder;
  }

  get pseudoPatternBuilder() {
    return this.#patternlab.pseudoPatternBuilder;
  }

  // PRIVATE METHODS

  addPattern(pattern) {
    this.ingredients.data.link[pattern.patternPartial] = '../' + pattern.patternLink;

    // Only push to array if the array doesn't contain this pattern.
    let isNew = true;

    for (let i = 0, l = this.ingredients.patterns.length; i < l; i++) {
      // So we need the identifier to be unique, which patterns[i].relPath is.
      if (pattern.relPath === this.ingredients.patterns[i].relPath) {
        // If relPath already exists, overwrite that element.
        this.ingredients.patterns[i] = pattern;
        isNew = false;

        break;
      }
    }

    // If the pattern is new, we must register it with various data structures!
    if (isNew) {
      if (this.config.debug) {
        this.utils.log('Found new pattern ' + pattern.patternPartial);
      }

      this.ingredients.patterns.push(pattern);
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
      extension === this.config.patternExtension ||
      extension === this.config.frontMatterExtension ||
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
    const fepletPartialsValues = Object.values(fepletPartials);

    // Not using for..in because fepletPartials is constructed within the hogan.js library.
    // It might be trivial to verify with absolute certainty that its constructor is plain Object, but there is no
    // erring (cautionary or otherwise) while using Object.values and a plain for loop, and being on the safe side.
    for (let i = 0, l = fepletPartialsValues.length; i < l; i++) {
      const partial = fepletPartialsValues[i];

      // If undefined, create a placeholder in the partials object to get populated later.
      if (typeof this.ingredients.partials[partial.name] === 'undefined') {
        this.ingredients.partials[partial.name] = '';
      }

      // Same thing for partialsComp object.
      if (typeof this.ingredients.partialsComp[partial.name] === 'undefined') {
        this.ingredients.partialsComp[partial.name] = {};
      }
    }
  }

  setState(pattern) {
    // Check for a corresponding Front Matter file to the pattern and get the patternState from its data.
    // 0 FOR-LOOP LEVELS IN.
    for (let in0 = 0, le0 = this.ingredients.patterns.length; in0 < le0; in0++) {
      const fmCandidate = this.ingredients.patterns[in0];

      if (
        fmCandidate.isFrontMatter &&
        fmCandidate.frontMatterRelPathTrunc === pattern.relPathTrunc &&
        fmCandidate.frontMatterData
      ) {
        // 1 FOR-LOOP LEVELS IN.
        for (let in1 = 0, le1 = fmCandidate.frontMatterData.length; in1 < le1; in1++) {
          if (fmCandidate.frontMatterData[in1].state) {
            pattern.patternState = fmCandidate.frontMatterData[in1].state;

            return;
          }
        }
      }
    }
  }

  // PUBLIC METHODS

  freePattern(pattern) {
    // Will free significant memory if processing many templates.
    // Disabling guard-for-in because we have complete control over construction of pattern.
    for (let key in pattern) { // eslint-disable-line guard-for-in
      // Retain these keys so patterns can continue to be looked up.
      switch (key) {
        case 'hash':
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

  preProcessPartialParams() {
    const {
      partials,
      partialsComp,
      patterns
    } = this.#patternlab.ingredients;

    // Populate non-param partials with templates, fepletParses, and fepletComps.
    // Disabling guard-for-in because we have complete control over construction of partials.
    // eslint-disable-next-line guard-for-in
    for (let partialKey in partials) {
      // The partialKey may or may not have a param.
      // Whether it does or not, make sure there is an entry for the non-param partial.
      for (let i = 0, l = patterns.length; i < l; i++) {
        const pattern = patterns[i];

        let nonParamPartialKey;

        /* istanbul ignore else */
        if (partialKey.indexOf(pattern.patternPartialPhp) === 0) {
          nonParamPartialKey = pattern.patternPartialPhp;
        }
        else if (partialKey.indexOf(pattern.patternPartial) === 0) {
          nonParamPartialKey = pattern.patternPartial;
        }
        else if (partialKey.indexOf(pattern.relPathTrunc) === 0) {
          nonParamPartialKey = pattern.relPathTrunc;
        }
        else if (partialKey.indexOf(pattern.relPath) === 0) {
          nonParamPartialKey = pattern.relPath;
        }

        if (nonParamPartialKey && !partials[nonParamPartialKey]) {
          partials[nonParamPartialKey] = pattern.template;
          partialsComp[nonParamPartialKey] = {
            parseArr: pattern.fepletParse,
            compilation: pattern.fepletComp
          };

          break;
        }
      }
    }

    // 0 FOR-LOOP LEVELS IN.
    for (let in0 = 0, le0 = patterns.length; in0 < le0; in0++) {
      const pattern = patterns[in0];
      const partialsKeys = pattern.fepletComp ? Object.keys(pattern.fepletComp.partials) : [];
      const partialsKeysLength = partialsKeys.length;

      // Preprocess partials with params if included within this pattern.
      if (partialsKeysLength) {
        let hasParam = false;
        let hasStyleModifier = false;

        // 1 FOR-LOOP LEVELS IN.
        for (let in1 = 0; in1 < partialsKeysLength; in1++) {
          if (/\([\S\s]*\)/.test(partialsKeys[in1])) {
            hasParam = true;

            break;
          }

          // eslint-disable-next-line no-useless-escape
          if (/\:([\w\-\|]+)/.test(partialsKeys[in1])) {
            hasStyleModifier = true;

            break;
          }
        }

        if (hasParam || hasStyleModifier) {
          Feplet.preProcessPartialParams(
            pattern.template, pattern.fepletComp, partials, partialsComp, this.ingredients.dataKeys
          );
        }
      }

      // Find and set lineages.
      this.lineageBuilder.main(pattern);
      pattern.lineageExists = pattern.lineage.length > 0;
      pattern.lineageRExists = pattern.lineageR.length > 0;
    }
  }

  preProcessPattern(relPath) {
    const fileObject = path.parse(relPath);

    // Extract some information.
    const fileName = fileObject.base;
    const ext = fileObject.ext;
    const patternsPath = this.config.paths.source.patterns;

    // Skip non-pattern files.
    if (!this.isPatternFile(fileName)) {
      return null;
    }

    // Make a new Pattern instance.
    const pattern = new Pattern(relPath, this.#patternlab);

    // Look for a json file for this template.
    let jsonFileName;

    if (ext === this.config.patternExtension || ext === '.json') {
      jsonFileName = `${patternsPath}/${pattern.subdir}/${pattern.fileName}.json`;

      if (fs.existsSync(jsonFileName)) {
        try {
          const jsonFileStr = fs.readFileSync(jsonFileName, this.config.enc);

          pattern.jsonFileData = JSON5.parse(jsonFileStr);

          if (this.config.debug) {
            this.utils.log('Found pattern-specific JSON data for ' + pattern.patternPartial);
          }
        }
        catch (err) /* istanbul ignore next */ {
          this.utils.error('There was an error parsing pattern-specific JSON for ' + pattern.relPath);
          this.utils.error(err);
        }
      }

      // If file is named in the syntax for variants, add data keys to dataKeysSchema, add and return pattern.
      if (this.isPseudoPatternJson(fileName)) {
        this.#patternlab.preProcessDataKeys(this.ingredients.dataKeysSchema, pattern.jsonFileData);
        this.addPattern(pattern);

        return pattern;
      }
    }

    // Preprocess Front Matter files.
    else if (ext === this.config.frontMatterExtension || ext === '.md') {
      const mustacheFileName =
        `${patternsPath}/${pattern.subdir}/${pattern.fileName}` + this.config.patternExtension;
      const jsonFileName =
        `${patternsPath}/${pattern.subdir}/${pattern.fileName}` + '.json';

      // Check for a corresponding Pattern or JSON file.
      // If it exists, preprocess Front Matter and add it to the patterns array.
      if (fs.existsSync(mustacheFileName) || fs.exists(jsonFileName)) {
        pattern.template = fs.readFileSync(`${patternsPath}/${relPath}`, this.config.enc);

        this.addPattern(pattern);
        this.preProcessFrontMatter(pattern);
      }

      return pattern;
    }

    // Can ignore all non-supported files at this point.
    else {
      /* istanbul ignore next */
      return pattern;
    }

    // See if this file has a state.
    this.setState(pattern);

    this.#patternlab.preProcessDataKeys(this.ingredients.dataKeysSchema, pattern.jsonFileData);
    pattern.template = fs.readFileSync(`${patternsPath}/${relPath}`, this.config.enc).replace(/\s*\n\s*/g, '');

    const parseArr = Feplet.parse(Feplet.scan(pattern.template));

    // Check if the template uses listItems and set boolean for whether the project uses listItems.
    this.config.useListItems = this.listItemsBuilder.listItemsScan(parseArr);

    // Continue generating Feplet.
    pattern.fepletParse = parseArr;
    pattern.fepletComp = Feplet.generate(parseArr, pattern.template, {});

    this.preProcessPartials(pattern.fepletComp.partials);

    // Add pattern to this.ingredients.patterns array.
    this.addPattern(pattern);

    return pattern;
  }

  processPattern(pattern) {
    /* istanbul ignore if */
    if (pattern.isFrontMatter) {
      return;
    }

    // The tilde suffix will sort pseudoPatterns after basePatterns.
    // So first, check if this is not a pseudoPattern (therefore a basePattern) and set up the .allData property.
    if (!this.isPseudoPatternJson(pattern.relPath)) {
      if (pattern.jsonFileData instanceof Object && Object.keys(pattern.jsonFileData).length) {
        pattern.allData = this.utils.extendButNotOverride({}, pattern.jsonFileData, this.ingredients.data);
      }
      else {
        pattern.jsonFileData = {};
        pattern.allData = this.ingredients.data;
      }
    }

    // Render extendedTemplate whether pseudoPattern or not.
    pattern.extendedTemplate =
      pattern.fepletComp.render(pattern.allData, this.ingredients.partials, null, this.ingredients.partialsComp);

    // If this is not a pseudoPattern (and therefore a basePattern), look for its pseudoPattern variants.
    if (!this.isPseudoPatternJson(pattern.relPath)) {
      this.pseudoPatternBuilder.main(pattern);
    }

    // Render header.
    let header;
    let useUserHeadLocal = false;

    for (let i = 0, l = this.ingredients.userHeadParse.length; i < l; i++) {
      const compItem = this.ingredients.userHeadParse[i];

      if (compItem.tag === '_v' && compItem.n) {
        // eslint-disable-next-line eqeqeq
        if (pattern.jsonFileData[compItem.n] != null) {
          useUserHeadLocal = true;

          break;
        }
      }
    }

    if (useUserHeadLocal) {
      header = this.ingredients.userHeadComp.render(pattern.allData);
    }
    else {
      header = this.ingredients.userHeadGlobal;
    }

    // Prepare footer.
    // Exclude hidden lineage items from array destined for output.
    const lineage = [];

    for (let i = 0, l = pattern.lineage.length; i < l; i++) {
      const lineageItem = pattern.lineage[i];

      if (!lineageItem.isHidden) {
        lineage.push(lineageItem);
      }
    }

    const lineageExists = Boolean(lineage.length);

    // Exclude hidden lineageR items from array destined for output.
    const lineageR = [];

    for (let i = 0, l = pattern.lineageR.length; i < l; i++) {
      const lineageRItem = pattern.lineageR[i];

      if (!lineageRItem.isHidden) {
        lineageR.push(lineageRItem);
      }
    }

    const lineageRExists = Boolean(lineageR.length);

    // Stringify these data for individual pattern rendering and use on the styleguide.
    pattern.patternData = JSON.stringify({
      lineage,
      lineageExists,
      lineageR,
      lineageRExists,
      patternDesc: pattern.patternDescExists ? pattern.patternDesc : '',
      patternExtension: pattern.fileExtension,
      patternName: pattern.patternName,
      patternPartial: pattern.patternPartial,
      patternState: pattern.patternState,
      portReloader: this.ingredients.portReloader,
      portServer: this.ingredients.portServer
    });

    // Set the pattern-specific footer by compiling the general-footer with data, and then adding it to userFoot.
    const footerPartial = Feplet.render(this.ingredients.footer, {
      isPattern: pattern.isPattern,
      patternData: pattern.patternData,
      portReloader: this.ingredients.portReloader
    });

    // Build footer.
    let footer = '';

    for (let i = 0, l = this.ingredients.userFootSplit.length; i < l; i++) {
      if (i > 0) {
        footer += footerPartial;
      }

      footer += this.ingredients.userFootSplit[i];
    }

    pattern.header = header;
    pattern.footer = footer;
    pattern.hash = XXHash.hash64(
      Buffer.from(pattern.header + pattern.extendedTemplate + pattern.footer, this.config.enc), 64, 'base64'
    );

    this.ingredients.hashesNew[pattern.patternPartial] = pattern.hash;
  }

  writePattern(pattern, dateNow) {
    /* istanbul ignore if */
    if (pattern.isFrontMatter) {
      return;
    }

    // Check to see whether the last pattern build has been modified. If modified, write pattern files.
    if (this.ingredients.hashesOld[pattern.patternPartial] !== pattern.hash) {

      // Write the built template to the public patterns directory.
      const paths = this.config.paths;
      const outfileFull = `${paths.public.patterns}/${pattern.patternLink}`;
      const patternFull = pattern.header + pattern.extendedTemplate + pattern.footer;

      let cacheBuster;

      if (this.config.cacheBust) {
        cacheBuster = `?${dateNow}`;
      }
      else {
        cacheBuster = '';
      }

      // Write the full pattern page.
      fs.outputFileSync(outfileFull, patternFull.replace(/\{\{ cacheBuster \}\}/g, cacheBuster));

      // Write the markup-only version.
      const outfileMarkupOnly = paths.public.patterns + '/' +
        pattern.patternLink.slice(0, -(pattern.outfileExtension.length)) + '.markup-only' + pattern.outfileExtension;

      fs.outputFileSync(outfileMarkupOnly, pattern.extendedTemplate.replace(/\{\{ cacheBuster \}\}/g, cacheBuster));

      // Write the mustache file.
      const outfileMustache = paths.public.patterns + '/' +
        pattern.patternLink.slice(0, -(pattern.outfileExtension.length)) + this.config.patternExtension;

      fs.outputFileSync(outfileMustache, this.utils.beautifyTemplate(pattern.template));
    }
  }
};
