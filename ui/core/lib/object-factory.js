'use strict';

const path = require('path');

function spaceAndCapitalize(name) {
  return name
    .split('-')
    .reduce(function (accum, curr) {
      return accum.charAt(0).toUpperCase() + accum.slice(1) + ' ' + curr.charAt(0).toUpperCase() + curr.slice(1);
    }, '')
    .trim();
}

exports.Pattern = class {
  constructor(relPath, patternlab) {
    // We expect relPath to be the path of the pattern template, relative to the root of the pattern tree.
    // Parse out the path parts and save the useful ones.
    const pathObj = path.parse(relPath);

    this.cacheBuster = patternlab.cacheBuster;
    this.fileExtension = pathObj.ext; // '.mustache'
    this.fileName = pathObj.name; // '00-colors'
    this.outfileExtension = '.html';
    this.pathsPublic = patternlab.config.pathsPublic;
    this.relPath = relPath; // '00-elements/00-global/00-colors.mustache'
    this.subdir = pathObj.dir; // '00-elements/00-global'
    this.flatPatternPath = this.subdir.replace(/\//g, '-'); // '00-elements-00-global'
    this.relPathTrunc = `${this.subdir}/${pathObj.name}`; // '00-elements/00-global/00-colors'

    // This is the unique name, subdir + fileName (sans extension).
    // '00-elements-00-global-00-colors'
    this.name = this.subdir.replace(/\//g, '-') + '-' + this.fileName.replace(/~/g, '-');

    // Strip leading underscores (if any), "00-" (digits plus hyphen) from the file name.
    // In order to maintain compatibility with Pattern Lab PHP, we need patternBaseNamePhp to retain tildes.
    this.patternBaseNamePhp = this.fileName.replace(/^_*(\d*-)?/, '');

    // For the Node ecosystem, flip tildes to hyphens.
    this.patternBaseName = this.patternBaseNamePhp.replace(/~/g, '-');

    // Calculated path from the root of the public directory to the generated html file for this pattern.
    // '00-elements-00-global-00-colors/00-elements-00-global-00-colors.html'
    this.patternLink = `${this.name}/${this.name + this.outfileExtension}`;

    // This is the human-readable name for the ui. Replace hyphens with space, 1st letters capital.
    this.patternName = spaceAndCapitalize(this.patternBaseName);

    // The top-level pattern type this pattern belongs to, i.e. "elements".
    this.patternType = pathObj.dir.split('/')[0].replace(/^\d*-/, '');

    // For identifying patterns via url search param. Also the "shorthand" key for identifying patterns in Mustache.
    this.patternPartial = this.patternType + '-' + this.patternBaseName;

    // For Pattern Lab PHP compatibility with respect to tildes.
    this.patternPartialPhp = this.patternType + '-' + this.patternBaseNamePhp;

    // The sub-type this pattern belongs to, e.g. 'global'
    this.patternSubType = this.subdir.indexOf('/') > -1 ? path.basename(this.subdir).replace(/^\d*-/, '') : '';

    this.allData = null;
    this.extendedTemplate = '';
    this.fepletComp = null;
    this.fepletParse = null;
    this.frontMatterData = [];
    this.frontMatterRelPathTrunc = '';
    this.header = '';
    this.footer = '';
    this.isFrontMatter = false;
    this.isPattern = true;
    this.isPreProcessed = false;
    this.isPseudoPattern = false;
    this.jsonFileData = {};
    this.lineage = [];
    this.lineageIndex = [];
    this.lineageR = [];
    this.lineageRIndex = [];
    this.listItems = null;
    this.patternState = '';
    this.pseudoPatternPartial = ''; // For pseudo-patterns only. Will be the same as the main pattern's patternPartial.
    this.template = '';
  }
};

exports.PatternItem = class {
  constructor(name, pattern) {
    this.patternName = name;
    this.pattern = pattern;

    if (name === 'View All') {
      this.patternLink = `${pattern.flatPatternPath}/index.html`;

      if (pattern.patternSubType) {
        this.patternPartial = `viewall-${pattern.patternType}-${pattern.patternSubType}`;
      }
      else {
        this.patternPartial = `viewall-${pattern.patternType}`;
      }
    }
    else {
      this.patternLink = pattern.patternLink;
      this.patternPartial = pattern.patternPartial;
    }

    this.subdir = pattern.subdir;
    this.flatPatternPath = pattern.flatPatternPath;
    this.pathsPublic = pattern.pathsPublic;
    this.patternType = pattern.patternType;
    this.patternSubType = pattern.patternSubType;
    this.patternState = pattern.patternState;
  }
};

exports.PatternSubType = class {
  constructor(pattern) {
    this.patternSubTypeLC = pattern.patternSubType;
    this.patternSubTypeUC = spaceAndCapitalize(pattern.patternSubType);
    this.patternPartial = `viewall-${pattern.patternType}-${pattern.patternSubType}`;
    this.flatPatternPath = pattern.flatPatternPath;
    this.pathsPublic = pattern.pathsPublic;
    this.patternSubTypeItems = [];
  }
};

exports.PatternType = class {
  constructor(pattern) {
    this.patternTypeLC = pattern.patternType;
    this.patternTypeUC = spaceAndCapitalize(pattern.patternType);
    this.patternPartial = `viewall-${pattern.patternType}`;
    this.flatPatternPath = pattern.subdir.split('/')[0];
    this.pathsPublic = pattern.pathsPublic;
    this.patternTypeItems = [];
    this.patternSubTypes = [];
    this.patternSubTypesIndex = [];
  }
};

exports.PatternViewall = class {
  constructor(path, content) {
    this.path = path;
    this.content = content;
  }
};
