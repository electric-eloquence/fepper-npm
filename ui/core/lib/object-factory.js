'use strict';

const extend = require('util')._extend;
const path = require('path');

const slash = require('slash');

exports.Pattern = class {
  constructor(relPath, data) {
    // We expect relPath to be the path of the pattern template, relative to the
    // root of the pattern tree. Parse out the path parts and save the useful ones.
    const relPathNormalized = path.normalize(relPath);
    const pathObj = path.parse(relPathNormalized);

    this.fileExtension = pathObj.ext; // '.mustache'
    this.fileName = pathObj.name; // '00-colors'
    this.outfileExtension = '.html';
    this.subdir = slash(pathObj.dir); // '00-atoms/00-global'

    this.flatPatternPath = this.subdir.replace(/[\/\\]/g, '-'); // '00-atoms-00-global'
    this.relPath = slash(relPathNormalized); // '00-atoms/00-global/00-colors.mustache'
    this.relPathTrunc = this.subdir + '/' + pathObj.name; // '00-atoms/00-global/00-colors'

    // the JSON used to render values in the pattern
    this.jsonFileData = data || {};

    // this is the unique name, subDir + fileName (sans extension)
    // '00-atoms-00-global-00-colors'
    this.name = this.subdir.replace(/[\/\\]/g, '-') + '-' + this.fileName.replace(/~/g, '-');

    // strip leading underscores (if any), "00-" (digits plus hyphen) from the file name
    // in order to maintain compatibility with Pattern Lab PHP, we need patternBaseNamePhp to retain tildes
    this.patternBaseNamePhp = this.fileName.replace(/^_*(\d*-)?/, '');

    // for the Node ecosystem, flip tildes to hyphens
    this.patternBaseName = this.patternBaseNamePhp.replace(/~/g, '-');

    // calculated path from the root of the public directory to the generated html file for this pattern
    // '00-atoms-00-global-00-colors/00-atoms-00-global-00-colors.html'
    this.patternLink = slash(this.name + path.sep + this.name + this.outfileExtension);

    // the top-level pattern group this pattern belongs to. 'atoms'
    this.patternGroup = pathObj.dir.split(path.sep)[0].replace(/^\d*-/, '');

    // this is the human-readable name for the ui. replace hyphens with space, 1st letters capital
    this.patternName = this.patternBaseName.split('-').reduce((val, working) => {
      return val.charAt(0).toUpperCase() + val.slice(1) + ' ' + working.charAt(0).toUpperCase() + working.slice(1);
    }, '').trim();

    // for identifying patterns via url search param
    // also the "shorthand" key for identifying patterns in Mustache
    this.patternPartial = this.patternGroup + '-' + this.patternBaseName;

    // for Pattern Lab PHP compatibility with respect to tildes
    this.patternPartialPhp = this.patternGroup + '-' + this.patternBaseNamePhp;

    // the sub-group this pattern belongs to
    this.patternSubGroup = path.basename(this.subdir).replace(/^\d*-/, ''); // 'global'

    this.allData = null;
    this.isPattern = true;
    this.isPseudoPattern = false;
    this.lineage = [];
    this.lineageIndex = [];
    this.lineageR = [];
    this.lineageRIndex = [];
    this.patternState = '';
    this.template = '';
  }
};

exports.PatternSubType = class {
  constructor(name) {
    this.patternSubTypeLC = name;
    this.patternSubTypeUC = name.split('-').reduce(function (val, working) {
      return val.charAt(0).toUpperCase() + val.slice(1) + ' ' + working.charAt(0).toUpperCase() + working.slice(1);
    }, '').trim();
    this.patternSubTypeItems = [];
    this.patternSubTypeItemsIndex = [];
  }
};

exports.PatternSubTypeItem = class {
  constructor(name) {
    this.patternPath = '';
    this.patternName = name.split(' ').reduce(function (val, working) {
      return val.charAt(0).toUpperCase() + val.slice(1) + ' ' + working.charAt(0).toUpperCase() + working.slice(1);
    }, '').trim();
  }
};

exports.PatternType = class {
  constructor(name) {
    this.patternTypeLC = name;
    this.patternTypeUC = name.split('-').reduce(function (val, working) {
      return val.charAt(0).toUpperCase() + val.slice(1) + ' ' + working.charAt(0).toUpperCase() + working.slice(1);
    }, '').trim();
    this.patternTypeItems = [];
    this.patternTypeItemsIndex = [];
    this.patternItems = [];
    this.patternItemsIndex = [];
  }
};
