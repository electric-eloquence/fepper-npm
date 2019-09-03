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
// CamelCasing "ListItems" (and "listItems") for the purpose of naming within code.
// Using all-lowercase, non-delimited "listitems" for naming within filenames.
// Documented (probably unintentionally) by Pattern Lab at
// https://patternlab.io/docs/data-listitems.html
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

    // The current working directory can be submitted as a param to resolve relative paths.
    this.cwd = slash(cwd || global.rootDir || path.resolve(__dirname, '..', '..', '..', '..', '..'));
    this.appDir = slash(global.appDir || path.resolve(__dirname, '..', '..', '..'));
    this.utils = utils;

    // Normalize configs if necessary.
    if (!this.config.paths.core) {
      this.utils.uiConfigNormalize(
        this.config,
        this.cwd,
        this.appDir
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
    this.userHeadComp = null;
    this.userHeadGlobal = '';
    this.userHeadParseArr = [];
    this.userFootSplit = [];
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

  // DEPRECATED. Moved to fepper-utils.
  emptyFilesNotDirs(publicDir) /* istanbul ignore next */ {
    if (!fs.existsSync(publicDir)) {
      return;
    }

    diveSync(
      publicDir,
      (err, file) => {
        // Log any errors.
        /* istanbul ignore if */
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

  preProcessAllPatterns(patternsDir) {
    try {
      this.data = this.buildPatternData(this.config.paths.source.data);
    }
    catch (err) /* istanbul ignore next */ {
      this.utils.error('ERROR: Missing or malformed ' + `${this.config.paths.source.data}/data.json`);
      this.utils.error(err);
    }

    const listItemsFile = `${this.config.paths.source.data}/listitems.json`;

    if (fs.existsSync(listItemsFile)) {
      try {
        const listItemsStr = fs.readFileSync(listItemsFile, this.enc);

        this.listItems = JSON5.parse(listItemsStr);
      }
      catch (err) /* istanbul ignore next */ {
        this.utils.error('ERROR: Malformed ' + listItemsFile);
        this.utils.error(err);
      }
    }

    const immutableDir = `${this.config.paths.core}/immutable`;

    try {
      this.header = fs.readFileSync(`${immutableDir}/immutable-header.mustache`, this.enc);
      this.footer = fs.readFileSync(`${immutableDir}/immutable-footer.mustache`, this.enc);
    }
    catch (err) /* istanbul ignore next */ {
      this.utils.error('ERROR: Missing an essential file from ' + immutableDir);
      this.utils.error(err);
    }

    this.data.link = {};
    this.data.pathsPublic = this.config.pathsPublic;
    this.patterns = [];

    this.viewallBuilder.readViewallTemplates();
    this.setCacheBuster();

    diveSync(
      patternsDir,
      (err, file) => {
        // Log any errors.
        /* istanbul ignore if */
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
    let userHead;

    // Set user defined head and foot if they exist.
    try {
      userHead = fs.readFileSync(`${this.config.paths.source.meta}/_00-head.mustache`, this.enc);
    }
    catch (err) /* istanbul ignore next */ {
      if (this.config.debug) {
        this.utils.warn(err);

        let warnHead = 'Could not find optional user-defined header, usually found at ';
        warnHead += './source/_meta/_00-head.mustache. It was likely deleted.';

        utils.warn(warnHead);
      }

      // Default HTML head.
      userHead = fs.readFileSync(`${this.appDir}/excludes/profiles/base/source/_meta/_00-head.mustache`, this.enc);
    }

    userHead = userHead.replace(/\{\{\{?\s*patternlabHead\s*\}?\}\}/i, this.header);
    this.userHeadParseArr = Feplet.parse(Feplet.scan(userHead));
    this.userHeadComp = Feplet.generate(this.userHeadParseArr, userHead, {});
    this.userHeadGlobal = this.userHeadComp.render(this.data);

    let userFoot;

    try {
      userFoot = fs.readFileSync(`${this.config.paths.source.meta}/_01-foot.mustache`, this.enc);
    }
    catch (err) /* istanbul ignore next */ {
      if (this.config.debug) {
        this.utils.warn(err);

        let warnFoot = 'Could not find optional user-defined footer, usually found at ';
        warnFoot += './source/_meta/_01-foot.mustache. It was likely deleted.';

        this.utils.warn(warnFoot);
      }

      // Default HTML foot.
      userFoot = fs.readFileSync(`${this.appDir}/excludes/profiles/base/source/_meta/_01-foot.mustache`, this.enc);
    }

    const userFootSplit = userFoot.split(/\{\{\{?\s*patternlabFoot\s*\}?\}\}/i);

    for (let i = 0, l = userFootSplit.length; i < l; i++) {
      this.userFootSplit[i] = Feplet.render(userFootSplit[i], this.data);
    }

    // Prepare for writing to file system. Delete the contents of config.patterns.public before writing.
    if (this.config.cleanPublic) {
      // this.emptyFilesNotDirs is DEPRECATED.
      // After deprecation period, permanently change conditionalObj to this.utils.
      let conditionalObj = this;

      /* istanbul ignore if */
      if (typeof this.utils.emptyFilesNotDirs === 'function') {
        conditionalObj = this.utils;
      }

      conditionalObj.emptyFilesNotDirs(this.config.paths.public.annotations);
      conditionalObj.emptyFilesNotDirs(this.config.paths.public.images);
      conditionalObj.emptyFilesNotDirs(this.config.paths.public.js);
      conditionalObj.emptyFilesNotDirs(this.config.paths.public.css);

      fs.emptyDirSync(this.config.paths.public.patterns);
    }

    this.annotationsBuilder.main();
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

  build(options) {
    if (options && options.constructor === Object) {
      this.resetConfig(options);
    }

    const indexHtml = `${this.config.paths.public.root}/index.html`;

    // If UI hasn't been compiled, try to compile.
    /* istanbul ignore if */
    if (!fs.existsSync(indexHtml)) {
      this.compile();
    }

    // Throw error if compilation fails.
    /* istanbul ignore if */
    if (!fs.existsSync(indexHtml)) {
      utils.error('There is no public/index.html, which means the UI needs to be compiled.');
      utils.log('Please run `fp ui:compile`.');

      throw new Error('ENOENT');
    }

    const patternsDir = this.config.paths.source.patterns;

    this.preProcessAllPatterns(patternsDir);
    this.preProcessDataAndParams();
    this.prepWrite();

    // Delegating processAllPatterns() to UiBuilder. This Patternlab class should manage its own properties and provide
    // utility functions. Reading, data processing, writing, etc. should be delegated to its member classes.
    this.uiBuilder.processAllPatterns();
    this.viewallBuilder.writeViewalls();
    this.uiBuilder.writePatternlabData();

    // Update access and modified times of public/index.html to trigger LiveReload.
    const unixTime = Date.now() / 1000;

    fs.utimesSync(indexHtml, unixTime, unixTime);

    // Log memory usage when debug === true.
    if (this.config.debug) {
      const used = process.memoryUsage().heapUsed / 1024 / 1024;

      this.utils.log(`The build used approximately ${Math.round(used * 100) / 100} MB`);
    }
  }

  compile(options) {
    if (options && options.constructor === Object) {
      this.resetConfig(options);
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
    <task> [<additional args>... [-d | --debug]]

Tasks:
    fp ui:build         Build the patterns, outputting to the public directory.
    fp ui:clean         Delete all patterns in the public directory.
    fp ui:compile       Compile the user interface from its component parts.
    fp ui:copy          Copy frontend files (_assets, _scripts, _styles) to the public directory.
    fp ui:copy-styles   Copy _styles to the public directory (for injection into browser without refresh.
    fp ui:help          Get more information about Fepper UI CLI commands.
`;

    this.utils.info(out);
  }

  resetConfig(config) {
    if (config && config.constructor === Object) {
      this.config = this.utils.extendButNotOverride(config, this.config);

      this.annotationsBuilder.config = this.config;
      this.listItemsBuilder.config = this.config;
      this.lineageBuilder.config = this.config;
      this.patternBuilder.config = this.config;
      this.pseudoPatternBuilder.config = this.config;

      this.uiBuilder.config = this.config;
      this.uiBuilder.public = this.config.paths.public;
      this.uiBuilder.source = this.config.paths.source;

      this.uiCompiler.config = this.config;
      this.uiCompiler.componentsDirCoreRoot = `${this.config.paths.core}/styleguide`;
      this.uiCompiler.pathsPublic = this.config.pathsPublic;
      this.uiCompiler.componentsDirCustomRoot = this.utils.deepGet(this, 'config.paths.source.ui');
      this.uiCompiler.styleguidePath = this.config.paths.public.styleguide;

      this.viewallBuilder.config = this.config;
      this.viewallBuilder.pathsPublic = this.config.pathsPublic;
      this.viewallBuilder.public = this.config.paths.public;
      this.viewallBuilder.source = this.config.paths.source;
    }
    else {
      /* istanbul ignore next */
      this.utils.error('Invalid config object!');
    }
  }
};
