/**
 *
 * Brian Muenzenmeyer, Geoff Pursell, and the web community
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */
'use strict';

const path = require('path');

const diveSync = require('diveSync');
const Feplet = require('feplet');
const fs = require('fs-extra');
const JSON5 = require('json5');
const slash = require('slash');
const utils = require('fepper-utils');

const AnnotationsBuilder = require('./annotations-builder');
const ListItemsBuilder = require('./listitems-builder');
const LineageBuilder = require('./lineage-builder');
const PatternBuilder = require('./pattern-builder');
const PseudoPatternBuilder = require('./pseudo-pattern-builder');
const UiBuilder = require('./ui-builder');
const UiCompiler = require('./ui-compiler');
const ViewallBuilder = require('./viewall-builder');

module.exports = class {
  constructor(config, cwd) {
    this.config = config;
    this.utils = utils;

    // The app's working directory can be submitted as a param to resolve relative paths.
    this.cwd = slash(cwd || path.resolve(__dirname, '..', '..', '..', '..', '..'));

    // Normalize configs if necessary.
    if (!this.config.paths.core) {
      this.utils.uiConfigNormalize(
        this.config,
        this.cwd,
        slash(global.appDir || path.resolve(__dirname, '..', '..', '..'))
      );
    }

    this.data = {};
    this.dataKeysSchemaObj = {};
    this.dataKeys = {};
    this.enc = this.utils.deepGet(global, 'conf.enc') || 'utf8';
    this.footer = '';
    this.listItems = {};
    this.partials = {};
    this.partialsComp = {};
    this.patternPaths = {};
    this.patterns = [];
    this.patternTypes = [];
    this.patternTypesIndex = [];
    this.portReloader = this.utils.deepGet(global, 'conf.livereload_port') || '';
    this.portServer = this.utils.deepGet(global, 'conf.express_port') || '';
    this.useListItems = false;
    this.userHead = '';
    this.userFoot = '';
    this.viewallPatterns = {};

    this.annotationsBuilder = new AnnotationsBuilder(this);
    this.listItemsBuilder = new ListItemsBuilder(this);
    this.lineageBuilder = new LineageBuilder(this);
    this.patternBuilder = new PatternBuilder(this);
    this.pseudoPatternBuilder = new PseudoPatternBuilder(this);
    this.uiBuilder = new UiBuilder(this);
    this.uiCompiler = new UiCompiler(this);
    this.viewallBuilder = new ViewallBuilder(this);
  }

  // PRIVATE METHODS

  buildPatternData(dataFilesPath) {
    const jsonFileStr = fs.readFileSync(`${dataFilesPath}/data.json`, this.enc);
    const jsonData = JSON5.parse(jsonFileStr);

    return jsonData;
  }

  buildPatterns() {
    const patternsDir = this.config.paths.source.patterns;

    this.preProcessAllPatterns(patternsDir);
    this.preProcessDataAndParams();
    this.prepWrite();
    // Delegating processAllPatterns() to UiBuilder. This Patternlab class should manage its own properties and provide
    // utility functions. Reading, data processing, writing, etc. should be delegated.
    this.uiBuilder.processAllPatterns();
    this.viewallBuilder.writeViewalls();
    this.uiBuilder.writePatternlabData();

    // Log memory usage if debug === true.
    if (this.config.debug) {
      const used = process.memoryUsage().heapUsed / 1024 / 1024;

      this.utils.log(`The patterns-only build used approximately ${Math.round(used * 100) / 100} MB`);
    }
  }

  emptyFilesNotDirs(publicDir) {
    diveSync(
      publicDir,
      (err, file) => {
        // Log any errors.
        if (err) {
          this.utils.error(err);

          return;
        }

        const stat = fs.statSync(file);

        if (!stat.isDirectory()) {
          fs.removeSync(file);
        }
      }
    );
  }

  isPatternExcluded(pattern) {
    if (!pattern.isPattern) {
      return true;
    }
    // Return true if the 1st character of pattern type, subType, further nested dirs, or filename is an underscore.
    else if (
      pattern.relPath.charAt(0) === '_' ||
      pattern.relPath.indexOf('/_') > -1
    ) {
      return true;
    }

    // Retaining inconsistent camelCasing from Pattern Lab. The casing of the "styleGuideExcludes" config is publicly
    // documented by Pattern Lab and is unlikely to change. Internally, "styleguide" will be all lowercase.
    // Return true if the pattern is configured to be excluded in patternlab-config.json.
    const styleguideExcludes = this.config.styleGuideExcludes || [];

    if (Array.isArray(styleguideExcludes) && styleguideExcludes.length) {
      const partial = pattern.patternPartial;
      const partialType = partial.substring(0, partial.indexOf('-'));

      if (styleguideExcludes.indexOf(partialType) > -1) {
        return true;
      }
    }

    return false;
  }

  preProcessAllPatterns(patternsDir) {
    try {
      this.data = this.buildPatternData(this.config.paths.source.data);
    }
    catch (err) {
      this.utils.error('ERROR: Missing or malformed ' + `${this.config.paths.source.data}/data.json`);
      this.utils.error(err);
    }

    try {
      const jsonFileStr = fs.readFileSync(`${this.config.paths.source.data}/listitems.json`, this.enc);

      this.listItems = JSON5.parse(jsonFileStr);
    }
    catch (err) {
      this.utils.error('ERROR: Missing or malformed ' + `${this.config.paths.source.data}/listitems.json`);
      this.utils.error(err);
    }

    const immutableDir = `${this.config.paths.core}/immutable`;

    try {
      this.header = fs.readFileSync(`${immutableDir}/immutable-header.mustache`, this.enc);
      this.footer = fs.readFileSync(`${immutableDir}/immutable-footer.mustache`, this.enc);
    }
    catch (err) {
      this.utils.error('ERROR: Missing an essential file from ' + immutableDir);
      this.utils.error(err);
    }

    this.data.link = {};
    this.data.pathsPublic = this.config.pathsPublic;

    this.viewallBuilder.readViewallTemplates();
    this.setCacheBuster();

    diveSync(
      patternsDir,
      (err, file) => {
        // Log any errors.
        if (err) {
          this.utils.error(err);
          return;
        }
        // Submit relPath.
        this.patternBuilder.preProcessPattern(slash(path.relative(patternsDir, file)));
      }
    );
  }

  preProcessDataAndParams() {
    this.annotationsBuilder.main();

    if (this.useListItems) {
      this.listItemsBuilder.listItemsBuild(this);
    }

    // Create an array of data keys to not render when preprocessing partials.
    this.utils.extendButNotOverride(this.dataKeysSchemaObj, this.data);
    this.dataKeys = Feplet.preProcessContextKeys(this.dataKeysSchemaObj);

    // Iterate through patternlab.partials and patternlab.patterns to preprocess partials with params.
    this.patternBuilder.preProcessPartialParams(this);
  }

  prepWrite() {
    // Set user defined head and foot if they exist.
    try {
      this.userHead = fs.readFileSync(`${this.config.paths.source.meta}/_00-head.mustache`, this.enc);
    }
    catch (err) {
      if (this.config.debug) {
        this.utils.error(err);

        let warnHead = 'Could not find optional user-defined header, usually found at ';
        warnHead += './source/_meta/_00-head.mustache. It was likely deleted.';

        this.utils.error(warnHead);
      }
    }

    try {
      this.userFoot = fs.readFileSync(`${this.config.paths.source.meta}/_01-foot.mustache`, this.enc);
    }
    catch (err) {
      if (this.config.debug) {
        this.utils.error(err);

        let warnFoot = 'Could not find optional user-defined footer, usually found at ';
        warnFoot += './source/_meta/_01-foot.mustache. It was likely deleted.';

        this.utils.error(warnFoot);
      }
    }

    // Prepare for writing to file system. Delete the contents of config.patterns.public before writing.
    if (this.config.cleanPublic) {
      this.emptyFilesNotDirs(this.config.paths.public.annotations);
      this.emptyFilesNotDirs(this.config.paths.public.images);
      this.emptyFilesNotDirs(this.config.paths.public.js);
      this.emptyFilesNotDirs(this.config.paths.public.css);
      fs.emptyDirSync(this.config.paths.public.patterns);
    }
  }

  setCacheBuster() {
    if (this.config.cacheBust) {
      this.cacheBuster = this.data.cacheBuster = '?' + Date.now();
    }
    else {
      this.cacheBuster = this.data.cacheBuster = '';
    }
  }

  // PUBLIC METHODS

  build(options, debug = false) {
    if (options && options.constructor === Object) {
      this.config = this.utils.extendButNotOverride(options, this.config);
    }

    const debugOrig = this.config.debug;

    if (debug) {
      this.config.debug = true;
    }

    this.buildPatterns();

    // Log memory usage when debug === true.
    if (this.config.debug) {
      const used = process.memoryUsage().heapUsed / 1024 / 1024;

      this.utils.log(`The full build used approximately ${Math.round(used * 100) / 100} MB`);
    }

    if (debug) {
      this.config.debug = debugOrig;
    }
  }

  compileui(options) {
    if (options && options.constructor === Object) {
      this.config = this.utils.extendButNotOverride(options, this.config);
    }

    this.uiCompiler.main();
  }

  getPattern(query) {
    let i = this.patterns.length;

    // Going from highest index to lowest index because multiple patterns can have the same .patternPartial name and we
    // want the one at the highest index to be the match.
    // e.g.
    // 00-atoms/00-global/00-colors.mustache -> atoms-colors
    // 00-atoms/01-local/00-colors.mustache -> atoms-colors
    while (i--) {
      const pattern = this.patterns[i];
      switch (query) {
        case pattern.patternPartialPhp:
        case pattern.patternPartial:
        case pattern.relPathTrunc:
        case pattern.relPath:
          return pattern;
      }
    }

    return null;
  }

  help() {
    let out = `
User Interface CLI

Use:
    fp <task> [<additional args>... [-d | --debug]]

Tasks:
    fp ui:build         Build the patterns and frontend, outputting to the public directory.
    fp ui:clean         Delete all patterns in the public directory.
    fp ui:compile       Compile the UI frontend and build the patterns and frontend.
    fp ui:compileui     Compile the UI frontend only.
    fp ui:copy          Copy frontend files (_assets, _scripts, _styles) to the public directory.
    fp ui:copy-styles   Copy _styles to the public directory (for injection into browser without refresh.
    fp ui:help          Get more information about Fepper UI CLI commands.
    fp ui:patternsonly  Build the patterns only, outputting to the public directory.
`;

    this.utils.info(out);
  }

  patternsonly(options) {
    if (options && options.constructor === Object) {
      this.config = this.utils.extendButNotOverride(options, this.config);
    }

    this.buildPatterns();
  }

  resetConfig(config) {
    if (config && config.constructor === Object) {
      this.config = this.utils.extendButNotOverride(config, this.config);
    }
    else {
      this.utils.error('Invalid config object!');
    }
  }
};
