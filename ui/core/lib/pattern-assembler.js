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
  }

  // PRIVATE METHODS

  addPattern(pattern) {
    // Add the link to the global object.
    if (!this.patternlab.data.link) {
      this.patternlab.data.link = {};
    }

    this.patternlab.data.link[pattern.patternPartial] = '/patterns/' + pattern.patternLink;

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
        this.patternlab.utils.log('Found new pattern ' + pattern.patternPartial);
      }

      this.patternlab.patterns.push(pattern);
    }
  }

  addSubTypePattern(subTypePattern) {
    this.patternlab.subTypePatterns[subTypePattern.patternPartial] = subTypePattern;
  }

  isPseudopatternJson(fileName) {
    const extension = path.extname(fileName);

    return (extension === '.json' && fileName.indexOf('~') > -1);
  }

  isPatternFile(fileName) {
    const extension = path.extname(fileName);

    // Skip hidden patterns and data files.
    if (fileName.charAt(0) === '.' || (extension === '.json' && !this.isPseudopatternJson(fileName))) {
      return false;
    }

    // Return boolean condition for everything else.
    return (
      extension === this.patternlab.config.patternExtension ||
      extension === this.patternlab.config.frontMatterExtension ||
      this.isPseudopatternJson(fileName)
    );
  }

  preprocessFrontMatter(pattern) {
    pattern.frontMatterData = frontMatterParser.main(pattern.template);
    pattern.frontMatterRelPathTrunc = pattern.relPathTrunc;
    pattern.isFrontMatter = true;
    pattern.isPattern = false;
    // Unset Patternlab.getPattern identifiers.
    pattern.patternPartialPhp = '';
    pattern.patternPartial = '';
    pattern.relPathTrunc = '';
    pattern.relPath = '';
  }

  preprocessPartials(fepletPartials) {
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

  preprocessPattern(relPath) {
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
    const pattern = new Pattern(relPath);

    // Create subTypePattern if it doesn't already exist.
    const subTypeKey = 'viewall-' + pattern.patternGroup + '-' + pattern.patternSubGroup;

    if (pattern.patternSubGroup && !this.patternlab.subTypePatterns[subTypeKey]) {
      const subTypePattern = {
        subdir: pattern.subdir,
        patternName: pattern.patternSubGroup,
        patternLink: pattern.flatPatternPath + '/index.html',
        patternGroup: pattern.patternGroup,
        patternSubGroup: pattern.patternSubGroup,
        flatPatternPath: pattern.flatPatternPath,
        patternPartial: subTypeKey,
        patternSectionSubType: true
      };

      this.addSubTypePattern(subTypePattern);
    }

    // Look for a json file for this template.
    let jsonFileName;

    if (ext === this.patternlab.config.patternExtension || ext === '.json') {
      jsonFileName = `${patternsPath}/${pattern.subdir}/${pattern.fileName}.json`;

      if (fs.existsSync(jsonFileName)) {
        try {
          const jsonFileStr = fs.readFileSync(jsonFileName, this.patternlab.enc);

          pattern.jsonFileData = JSON5.parse(jsonFileStr);

          if (this.patternlab.config.debug) {
            this.patternlab.utils.log('Found pattern-specific data.json for ' + pattern.patternPartial);
          }
        }
        catch (err) {
          this.patternlab.utils.error('There was an error parsing sibling JSON for ' + pattern.relPath);
          this.patternlab.utils.error(err.message || err);
        }
      }

      // If file is named in the syntax for variants, add data keys to dataKeysSchemaObj, add and return pattern.
      if (this.isPseudopatternJson(fileName)) {
        this.patternlab.utils.extendButNotOverride(this.patternlab.dataKeysSchemaObj, pattern.jsonFileData);
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
        this.preprocessFrontMatter(pattern);
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
          this.patternlab.utils.log('Found pattern-specific listitems.json for ' + pattern.patternPartial);
        }

        this.patternlab.listItemsBuilder.listItemsBuild(pattern);
        this.patternlab.utils.extendButNotOverride(pattern.jsonFileData.listItems, this.patternlab.data.listItems);
      }
      catch (err) {
        this.patternlab.utils.error('There was an error parsing sibling listitem JSON for ' + pattern.relPath);
        this.patternlab.utils.error(err.message || err);
      }
    }

    this.patternlab.utils.extendButNotOverride(this.patternlab.dataKeysSchemaObj, pattern.jsonFileData);
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

    this.preprocessPartials(pattern.fepletComp.partials);

    // Add pattern to this.patternlab.patterns array.
    this.addPattern(pattern);

    return pattern;
  }

  preprocessPartialParams() {
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

      Feplet.preprocessPartialParams(partialText, partialComp, partials, partialsComp, this.patternlab.dataKeys);

      if (pattern) {
        pattern.isPreprocessed = true;
      }
    }

    // Iterate through patterns this time.
    for (let i = 0, l = patterns.length; i < l; i++) {
      const pattern = patterns[i];

      // Preprocess partials with params that exist in higher level patterns.
      if (!pattern.isPreprocessed) {
        Feplet.preprocessPartialParams(pattern.template, pattern.fepletComp, partials, partialsComp,
          this.patternlab.dataKeys);
      }

      // Find and set lineages.
      this.patternlab.lineageHunter.main(pattern);
      pattern.lineageExists = pattern.lineage.length > 0;
      pattern.lineageRExists = pattern.lineageR.length > 0;
    }
  }

  processPattern(pattern) {
    if (pattern.isFrontMatter) {
      return;
    }

    // The tilde suffix will sort pseudopatterns after basePatterns.
    // So first, check if this is not a pseudopattern (therefore a basePattern) and look for its pseudopattern variants.
    if (!this.isPseudopatternJson(pattern.relPath)) {

      if (pattern.jsonFileData) {
        pattern.allData = this.patternlab.utils.extendButNotOverride(pattern.jsonFileData, this.patternlab.data);
      }
      else {
        pattern.jsonFileData = {};
        // If no local data, create reference to this.patternlab.allData.
        pattern.allData = this.patternlab.data;
      }

      // Set cacheBuster property if not already set.
      if (!pattern.allData.cacheBuster) {
        pattern.allData.cacheBuster = this.patternlab.cacheBuster;
      }

      pattern.extendedTemplate =
        pattern.fepletComp.render(pattern.allData, this.patternlab.partials, null, this.patternlab.partialsComp);
      this.patternlab.pseudopatternHunter.main(pattern);
    }

    // Identified a pseudopattern by checking if this is a file containing same name, with ~ in it, ending in .json.
    // Copy its basePattern.extendedTemplate to extendedTemplate and return.
    else {
      // Set cacheBuster property if not already set.
      if (!pattern.allData.cacheBuster) {
        pattern.allData.cacheBuster = this.patternlab.cacheBuster;
      }

      pattern.extendedTemplate =
        pattern.fepletComp.render(pattern.allData, this.patternlab.partials, null, this.patternlab.partialsComp);
    }

    // Stringify these data for individual pattern rendering and use on the styleguide.
    pattern.allData.patternData = JSON.stringify({
      lineage: pattern.lineage,
      lineageExists: pattern.lineageExists,
      lineageR: pattern.lineageR,
      lineageRExists: pattern.lineageRExists,
      patternDesc: pattern.patternDescExists ? pattern.patternDesc : '',
      patternExtension: pattern.fileExtension,
      patternName: pattern.patternName,
      patternPartial: pattern.patternPartial,
      patternState: pattern.patternState
    });

    let head;

    if (this.patternlab.userHead) {
      head = this.patternlab.userHead.replace('{{{ patternLabHead }}}', this.patternlab.header);
    }
    else {
      head = this.patternlab.header;
    }

    let headHtml = Feplet.render(head, pattern.allData);

    // Set the pattern-specific footer by compiling the general-footer with data, and then adding it to the meta footer.
    const footerPartial = Feplet.render(this.patternlab.footer, {
      cacheBuster: this.patternlab.cacheBuster,
      isPattern: pattern.isPattern,
      lineage: JSON.stringify(pattern.lineage),
      lineageR: JSON.stringify(pattern.lineageR),
      patternData: pattern.allData.patternData,
      patternPartial: pattern.patternPartial,
      patternState: pattern.patternState,
      portReloader: (global.conf && global.conf.livereload_port) || 35729,
      portServer: (global.conf && global.conf.express_port) || 3000
    });

    let footerHtml = this.patternlab.userFoot.replace('{{{ patternLabFoot }}}', footerPartial);
    footerHtml = Feplet.render(footerHtml, pattern.allData);

    pattern.header = headHtml;
    pattern.footer = footerHtml;
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
    // Free memory.
    for (let key in pattern) {
      if (!pattern.hasOwnProperty(key)) {
        continue;
      }

      switch (key) {
        case 'footer':
        case 'flatPatternPath':
        case 'frontMatterData':
        case 'isFrontMatter':
        case 'isPattern':
        case 'name':
        case 'patternBaseName':
        case 'patternGroup':
        case 'patternLink':
        case 'patternName':
        case 'patternPartial':
        case 'patternPartialPhp':
        case 'patternState':
        case 'patternSubGroup':
        case 'relPath':
        case 'relPathTrunc':
        case 'subdir':
        case 'lineageR':
        case 'lineageRIndex':
          continue;
      }

      if (key === 'extendedTemplate') {
        const patternExportPatternPartials = this.patternlab.config.patternExportPatternPartials;

        if (Array.isArray(patternExportPatternPartials) && patternExportPatternPartials.length) {
          continue;
        }
      }

      pattern[key] = null;
      delete pattern[key];
    }
  }
};
