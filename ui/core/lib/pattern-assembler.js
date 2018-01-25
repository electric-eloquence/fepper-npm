'use strict';

const path = require('path');
  
const feplet = require('feplet');
const fs = require('fs-extra');
const JSON5 = require('json5');

const lineageHunt = require('./lineage-hunt');
const listItemsBuilder = require('./list-items-builder');
const Pattern = require('./object-factory').Pattern;
const plutils = require('./utilities');
const pseudopatternHunt = require('./pseudopattern-hunt');

// PRIVATE FUNCTIONS

function addPattern(pattern, patternlab) {
  // add the link to the global object
  patternlab.data.link[pattern.patternPartial] = '/patterns/' + pattern.patternLink;

  // only push to array if the array doesn't contain this pattern
  let isNew = true;

  for (let i = 0, l = patternlab.patterns.length; i < l; i++) {
    // so we need the identifier to be unique, which patterns[i].relPath is
    if (pattern.relPath === patternlab.patterns[i].relPath) {
      // if relPath already exists, overwrite that element
      patternlab.patterns[i] = pattern;
      isNew = false;

      break;
    }
  }

  // if the pattern is new, we must register it with various data structures!
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

  // skip hidden patterns and data files
  if (filename.charAt(0) === '.' || (extension === '.json' && !isPseudopatternJson(filename))) {
    return false;
  }

  // return boolean condition for everything else
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

    // if undefined, create a placeholder in the partials object to get populated later
    // possible performance improvement by skipping unnecessary assignment
    if (typeof patternlab.partials[partial.name] === 'undefined') {
      patternlab.partials[partial.name] = '';
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

  // extract some information
  const filename = fileObject.base;
  const ext = fileObject.ext;
  const patternsPath = patternlab.config.paths.source.patterns;

  // skip non-pattern files
  if (!isPatternFile(filename, patternlab)) {
    return null;
  }

  // make a new Pattern Object
  const pattern = new Pattern(relPath);

  // create subTypePattern if it doesn't already exist
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

  // if file is named in the syntax for variants
  if (isPseudopatternJson(filename)) {
    addPattern(pattern, patternlab);

    return pattern;
  }

  // can ignore all non-supported files at this point
  if (ext !== patternlab.config.patternExtension) {
    return pattern;
  }

  // see if this file has a state
  setState(pattern, patternlab);

  // look for a json file for this template
  let jsonFilename = '';
  let jsonFilenameStats;
  let jsonFileStr = '';

  try {
    jsonFilename = path.resolve(patternsPath, pattern.subdir, pattern.fileName + '.json');
    jsonFilenameStats = fs.statSync(jsonFilename);
  }
  catch (err) {
    // not a file
  }

  if (jsonFilenameStats && jsonFilenameStats.isFile()) {
    try {
      jsonFileStr = fs.readFileSync(jsonFilename, patternlab.enc);
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

  // look for a listitems.json file for this template
  try {
    const listJsonFileName = path.resolve(patternsPath, pattern.subdir, pattern.fileName + '.listitems.json');

    let listJsonFileStats;

    try {
      listJsonFileStats = fs.statSync(listJsonFileName);
    }
    catch (err) {
      // not a file
    }

    if (listJsonFileStats && listJsonFileStats.isFile()) {
      jsonFileStr = fs.readFileSync(listJsonFileName, patternlab.enc);
      pattern.listItems = JSON5.parse(jsonFileStr);

      if (patternlab.config.debug) {
        console.log('Found pattern-specific listitems.json for ' + pattern.patternPartial);
      }

      listItemsBuilder.listItemsBuild(pattern);
      plutils.extendButNotOverride(pattern.jsonFileData.listItems, patternlab.data.listItems);
    }
  }
  catch (err) {
    console.log('There was an error parsing sibling listitem JSON for ' + pattern.relPath);
    console.log(err.message || err);
  }

  pattern.template = fs.readFileSync(path.resolve(patternsPath, relPath), patternlab.enc);

  const scan = feplet.scan(pattern.template);
  const parseArr = feplet.parse(scan);

  // check if the template uses listItems
  patternlab.useListItems = listItemsBuilder.listItemsScan(parseArr, patternlab);

  pattern.fepletParse = parseArr;
  pattern.fepletComp = feplet.generate(parseArr, pattern.template, {});

  preprocessPartials(pattern.fepletComp.partials, patternlab);

  // add pattern to patternlab.patterns array
  addPattern(pattern, patternlab);

  return pattern;
}

exports.preprocessPartialParams = function (patternlab) {
  let partials = patternlab.partials;

  for (let partialName in partials) {
    if (!partials.hasOwnProperty(partialName)) {
      continue;
    }

    const partialTemplate = partials[partialName];

    let pattern = patternlab.getPattern(partialName);

    if (pattern) {
      partials[partialName] = pattern.template;
    }

    // if no exact match, must have param
    // make sure there is an entry for the non-param partial
    else {
      for (let i = 0, l = patternlab.patterns.length; i < l; i++) {
        const pattern = patternlab.patterns[i];

        let nonParamPartialName;

        if (partialName.indexOf(pattern.patternPartialPhp) === 0) {
          nonParamPartialName = pattern.patternPartialPhp;
        }
        else if (partialName.indexOf(pattern.patternPartial) === 0) {
          nonParamPartialName = pattern.patternPartial;
        }
        else if (partialName.indexOf(pattern.relPathTrunc) === 0) {
          nonParamPartialName = pattern.relPathTrunc;
        }
        else if (partialName.indexOf(pattern.relPath) === 0) {
          nonParamPartialName = pattern.relPath;
        }

        if (nonParamPartialName) {
          partials[nonParamPartialName] = pattern.template;
        }
      }
    }
  }

  for (let i = 0, l = patternlab.patterns.length; i < l; i++) {
    const pattern = patternlab.patterns[i];

    feplet.preprocessPartialParams(pattern.template, partials);

    // find and set lineages
    lineageHunt(pattern, patternlab);
    pattern.lineageExists = pattern.lineage.length > 0;
    pattern.lineageRExists = pattern.lineageR.length > 0;
  }
};

exports.processPattern = function (pattern, patternlab) {
  let patternVariants = [];
  let preRenderObj;
  let tmpPartial;

  // the tilde suffix will sort pseudopatterns after basePatterns
  // so first, check if this is not a pseudopattern (therefore a basePattern) and look for its pseudopattern variants
  if (!isPseudopatternJson(pattern.relPath)) {
    if (pattern.jsonFileData) {
      pattern.allData = plutils.extendButNotOverride(pattern.jsonFileData, patternlab.data);
    }
    else {
      pattern.jsonFileData = {};
      // if no local data, create reference to patternlab.allData
      pattern.allData = patternlab.data;
    }

    // set cacheBuster property if not already set
    if (!pattern.allData.cacheBuster) {
      pattern.allData.cacheBuster = patternlab.cacheBuster;
    }

    pattern.extendedTemplate = pattern.fepletComp.render(pattern.allData, patternlab.partials);
    patternVariants = pseudopatternHunt(pattern, patternlab);
  }

  // identified a pseudopattern by checking if this is a file containing same name, with ~ in it, ending in .json
  // copy its basePattern.extendedTemplate to extendedTemplate and return
  else {
    // set cacheBuster property if not already set
    if (!pattern.allData.cacheBuster) {
      pattern.allData.cacheBuster = patternlab.cacheBuster;
    }

    pattern.extendedTemplate = pattern.fepletComp.render(pattern.allData, patternlab.partials);
  }

  // stringify these data for individual pattern rendering and use on the styleguide
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

  let headHtml = feplet.render(head, pattern.allData);

  // set the pattern-specific footer by compiling the general-footer with data, and then adding it to the meta footer
  const footerPartial = feplet.render(patternlab.footer, {
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
  footerHtml = feplet.render(footerHtml, pattern.allData);

  pattern.header = headHtml;
  pattern.footer = footerHtml;

  // write the built template to the public patterns directory
  const paths = patternlab.config.paths;
  const patternPage = pattern.header + pattern.extendedTemplate + pattern.footer;

  fs.outputFileSync(
    path.resolve(
      paths.public.patterns,
      pattern.patternLink
    ),
    patternPage
  );

  // write the mustache file too
  fs.outputFileSync(
    path.resolve(
      paths.public.patterns,
      pattern.patternLink.slice(0, -(pattern.outfileExtension.length))  + pattern.fileExtension
    ),
    pattern.template
  );

  // write the markup-only version too
  fs.outputFileSync(
    path.resolve(
      paths.public.patterns,
      pattern.patternLink.slice(0, -(pattern.outfileExtension.length)) + '.markup-only' + pattern.outfileExtension
    ),
    pattern.extendedTemplate
  );

  // free memory
  for (let key in pattern) {
    if (!pattern.hasOwnProperty(key)) {
      continue;
    }

    switch (key) {
      case 'footer':
      case 'extendedTemplate':
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

    pattern[key] = null;
    delete pattern[key];
  }
};
