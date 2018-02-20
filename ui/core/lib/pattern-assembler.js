'use strict';

const path = require('path');
  
const Feplet = require('feplet');
const fs = require('fs-extra');
const JSON5 = require('json5');

const lineageHunt = require('./lineage-hunt');
const listItemsBuilder = require('./list-items-builder');
const Pattern = require('./object-factory').Pattern;
const plutils = require('./utilities');
const pseudopatternHunt = require('./pseudopattern-hunt');

// PRIVATE FUNCTIONS

function addPattern(pattern, patternlab) {
  // Add the link to the global object.
  patternlab.data.link[pattern.patternPartial] = '/patterns/' + pattern.patternLink;

  // Only push to array if the array doesn't contain this pattern.
  let isNew = true;

  for (let i = 0, l = patternlab.patterns.length; i < l; i++) {
    // So we need the identifier to be unique, which patterns[i].relPath is.
    if (pattern.relPath === patternlab.patterns[i].relPath) {
      // If relPath already exists, overwrite that element.
      patternlab.patterns[i] = pattern;
      isNew = false;

      break;
    }
  }

  // If the pattern is new, we must register it with various data structures!
  if (isNew) {
    if (patternlab.config.debug) {
      console.log('Found new pattern ' + pattern.patternPartial);
    }

    patternlab.patterns.push(pattern);
  }
}

function addSubTypePattern(subTypePattern, patternlab) {
  patternlab.subTypePatterns[subTypePattern.patternPartial] = subTypePattern;
}

function isPatternFile(filename, patternlab) {
  const extension = path.extname(filename);

  // Skip hidden patterns and data files.
  if (filename.charAt(0) === '.' || (extension === '.json' && !isPseudopatternJson(filename))) {
    return false;
  }

  // Return boolean condition for everything else.
  return (extension === patternlab.config.patternExtension || isPseudopatternJson(filename));
}

function isPseudopatternJson(filename) {
  const extension = path.extname(filename);

  return (extension === '.json' && filename.indexOf('~') > -1);
}

function preprocessPartials(fepletPartials, patternlab) {
  for (let i in fepletPartials) {
    if (!fepletPartials.hasOwnProperty(i)) {
      continue;
    }

    const partial = fepletPartials[i];

    // If undefined, create a placeholder in the partials object to get populated later.
    if (typeof patternlab.partials[partial.name] === 'undefined') {
      patternlab.partials[partial.name] = ''; // Needs to be string.
    }

    // Same thing for partialsComp object.
    if (typeof patternlab.partialsComp[partial.name] === 'undefined') {
      patternlab.partialsComp[partial.name] = null;
    }
  }
}

function setState(pattern, patternlab) {
  if (patternlab.config.patternStates && patternlab.config.patternStates[pattern.patternPartial]) {
    pattern.patternState = patternlab.config.patternStates[pattern.patternPartial];
  }
}

// EXPORTED FUNCTIONS

exports.preprocessPattern = function (relPath, patternlab) {
  const fileObject = path.parse(relPath);

  // Extract some information.
  const filename = fileObject.base;
  const ext = fileObject.ext;
  const patternsPath = patternlab.config.paths.source.patterns;

  // Skip non-pattern files.
  if (!isPatternFile(filename, patternlab)) {
    return null;
  }

  // Make a new Pattern instance.
  const pattern = new Pattern(relPath);

  // Create subTypePattern if it doesn't already exist.
  const subTypeKey = 'viewall-' + pattern.patternGroup + '-' + pattern.patternSubGroup;

  if (pattern.patternSubGroup && !patternlab.subTypePatterns[subTypeKey]) {
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

    addSubTypePattern(subTypePattern, patternlab);
  }

  // If file is named in the syntax for variants.
  if (isPseudopatternJson(filename)) {
    addPattern(pattern, patternlab);

    return pattern;
  }

  // Can ignore all non-supported files at this point.
  if (ext !== patternlab.config.patternExtension) {
    return pattern;
  }

  // See if this file has a state.
  setState(pattern, patternlab);

  // Look for a json file for this template.
  const jsonFilename = path.resolve(patternsPath, pattern.subdir, pattern.fileName + '.json');

  if (fs.existsSync(jsonFilename)) {
    try {
      const jsonFileStr = fs.readFileSync(jsonFilename, patternlab.enc);

      pattern.jsonFileData = JSON5.parse(jsonFileStr);

      if (patternlab.config.debug) {
        console.log('Found pattern-specific data.json for ' + pattern.patternPartial);
      }
    }
    catch (err) {
      console.log('There was an error parsing sibling JSON for ' + pattern.relPath);
      console.log(err.message || err);
    }
  }

  // Look for a listitems.json file for this template.
  const listJsonFileName = path.resolve(patternsPath, pattern.subdir, pattern.fileName + '.listitems.json');

  if (fs.existsSync(listJsonFileName)) {
    try {
      const jsonFileStr = fs.readFileSync(listJsonFileName, patternlab.enc);

      pattern.listItems = JSON5.parse(jsonFileStr);

      if (patternlab.config.debug) {
        console.log('Found pattern-specific listitems.json for ' + pattern.patternPartial);
      }

      listItemsBuilder.listItemsBuild(pattern);
      plutils.extendButNotOverride(pattern.jsonFileData.listItems, patternlab.data.listItems);
    }
    catch (err) {
      console.log('There was an error parsing sibling listitem JSON for ' + pattern.relPath);
      console.log(err.message || err);
    }
  }

  plutils.extendButNotOverride(patternlab.dataKeysSchemaObj, pattern.jsonFileData);
  pattern.template = fs.readFileSync(path.resolve(patternsPath, relPath), patternlab.enc);

  const scan = Feplet.scan(pattern.template);
  const parseArr = Feplet.parse(scan);

  // Check if the template uses listItems.
  patternlab.useListItems = listItemsBuilder.listItemsScan(parseArr, patternlab);

  pattern.fepletParse = parseArr;
  pattern.fepletComp = Feplet.generate(parseArr, pattern.template, {});

  // Prepopulate possible non-param matches for partials with params.
  // These are references, so they shouldn't use significant memory, thus justifying not having to regenerate.
  patternlab.partialsComp[pattern.patternPartialPhp] = pattern.fepletComp;
  patternlab.partialsComp[pattern.patternPartial] = pattern.fepletComp;
  patternlab.partialsComp[pattern.relPathTrunc] = pattern.fepletComp;
  patternlab.partialsComp[pattern.relPath] = pattern.fepletComp;

  preprocessPartials(pattern.fepletComp.partials, patternlab);

  // Add pattern to patternlab.patterns array.
  addPattern(pattern, patternlab);

  return pattern;
}

exports.preprocessPartialParams = function (patternlab) {
  const {
    partials,
    partialsComp,
    patterns
  } = patternlab;

  for (let partialName in partials) {
    if (!partials.hasOwnProperty(partialName)) {
      continue;
    }

    const partialTemplate = partials[partialName];
    const pattern = patternlab.getPattern(partialName);

    if (pattern) {
      partials[partialName] = pattern.template;
      partialsComp[partialName] = pattern.fepletComp;
    }

    // If no exact match, must have param.
    else {
      // Make sure there is an entry for the non-param partial.
      let patternTemplate;

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
    const pattern = patternlab.getPattern(partialKey);

    Feplet.preprocessPartialParams(partialText, partialComp, partials, partialsComp, patternlab.dataKeys);

    if (pattern) {
      pattern.isPreprocessed = true;
    }
  }

  // Iterate through patterns this time.
  for (let i = 0, l = patterns.length; i < l; i++) {
    const pattern = patterns[i];

    // Preprocess partials with params that exist in higher level patterns.
    if (!pattern.isPreprocessed) {
      Feplet.preprocessPartialParams(pattern.template, pattern.fepletComp, partials, partialsComp, patternlab.dataKeys);
    }

    // Find and set lineages.
    lineageHunt(pattern, patternlab);
    pattern.lineageExists = pattern.lineage.length > 0;
    pattern.lineageRExists = pattern.lineageR.length > 0;
  }
};

exports.processPattern = function (pattern, patternlab) {
  let patternVariants = [];
  let preRenderObj;
  let tmpPartial;

  // The tilde suffix will sort pseudopatterns after basePatterns.
  // So first, check if this is not a pseudopattern (therefore a basePattern) and look for its pseudopattern variants.
  if (!isPseudopatternJson(pattern.relPath)) {
    if (pattern.jsonFileData) {
      pattern.allData = plutils.extendButNotOverride(pattern.jsonFileData, patternlab.data);
    }
    else {
      pattern.jsonFileData = {};
      // If no local data, create reference to patternlab.allData.
      pattern.allData = patternlab.data;
    }

    // Set cacheBuster property if not already set.
    if (!pattern.allData.cacheBuster) {
      pattern.allData.cacheBuster = patternlab.cacheBuster;
    }

    pattern.extendedTemplate = pattern.fepletComp.render(pattern.allData, patternlab.partials, null, patternlab.partialsComp);
    patternVariants = pseudopatternHunt(pattern, patternlab);
  }

  // Identified a pseudopattern by checking if this is a file containing same name, with ~ in it, ending in .json.
  // Copy its basePattern.extendedTemplate to extendedTemplate and return.
  else {
    // Set cacheBuster property if not already set.
    if (!pattern.allData.cacheBuster) {
      pattern.allData.cacheBuster = patternlab.cacheBuster;
    }

    pattern.extendedTemplate = pattern.fepletComp.render(pattern.allData, patternlab.partials, null, patternlab.partialsComp);
  }

  // Stringify these data for individual pattern rendering and use on the styleguide.
  pattern.allData.patternData = JSON.stringify({
    cssEnabled: false,
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

  if (patternlab.userHead) {
    head = patternlab.userHead.replace('{{{ patternLabHead }}}', patternlab.header);
  }
  else {
    head = patternlab.header;
  }

  let headHtml = Feplet.render(head, pattern.allData);

  // Set the pattern-specific footer by compiling the general-footer with data, and then adding it to the meta footer.
  const footerPartial = Feplet.render(patternlab.footer, {
    cacheBuster: patternlab.cacheBuster,
    isPattern: pattern.isPattern,
    lineage: JSON.stringify(pattern.lineage),
    lineageR: JSON.stringify(pattern.lineageR),
    patternData: pattern.allData.patternData,
    patternPartial: pattern.patternPartial,
    patternState: pattern.patternState,
    portReloader: global.conf.livereload_port,
    portServer: global.conf.express_port
  });

  let footerHtml = patternlab.userFoot.replace('{{{ patternLabFoot }}}', footerPartial);
  footerHtml = Feplet.render(footerHtml, pattern.allData);

  pattern.header = headHtml;
  pattern.footer = footerHtml;

  // Write the built template to the public patterns directory.
  const paths = patternlab.config.paths;
  const patternPage = pattern.header + pattern.extendedTemplate + pattern.footer;

  fs.outputFileSync(
    path.resolve(
      paths.public.patterns,
      pattern.patternLink
    ),
    patternPage
  );

  // Write the mustache file.
  fs.outputFileSync(
    path.resolve(
      paths.public.patterns,
      pattern.patternLink.slice(0, -(pattern.outfileExtension.length))  + pattern.fileExtension
    ),
    pattern.template
  );

  // Write the markup-only version.
  fs.outputFileSync(
    path.resolve(
      paths.public.patterns,
      pattern.patternLink.slice(0, -(pattern.outfileExtension.length)) + '.markup-only' + pattern.outfileExtension
    ),
    pattern.extendedTemplate
  );

  // Free memory.
  for (let key in pattern) {
    if (!pattern.hasOwnProperty(key)) {
      continue;
    }

    switch (key) {
      case 'footer':
      case 'flatPatternPath':
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
      const patternExportPatternPartials = patternlab.config.patternExportPatternPartials;

      if (Array.isArray(patternExportPatternPartials) && patternExportPatternPartials.length) {
        continue;
      }
    }

    pattern[key] = null;
    delete pattern[key];
  }
};
