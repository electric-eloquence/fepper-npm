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
// Using all-lowercase, non-delimited "listitems" for naming filenames.
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
  constructor(config, cwd_) {
    // The current working directory can be submitted as a param to resolve relative paths.
    const cwd = slash(cwd_ || global.rootDir || path.resolve(__dirname, '..', '..', '..', '..', '..'));
    const appDir = slash(global.appDir || path.resolve(__dirname, '..', '..', '..'));

    // Normalize configs if necessary.
    if (!config.paths.core) {
      utils.uiConfigNormalize(
        config,
        cwd,
        appDir
      );
    }

    this.config = config;
    this.config.cwd = cwd;
    this.config.appDir = appDir;
    this.config.enc = utils.deepGet(global, 'conf.enc') || 'utf8';
    this.config.useListItems = false;

    this.ingredients = {
      data: {},
      dataKeysSchema: {},
      dataKeys: [],
      footer: '',
      hashesNew: {},
      hashesOld: {},
      listItems: {},
      partials: {},
      partialsComp: {},
      patternPaths: {},
      patterns: [],
      patternTypes: [],
      patternTypesIndex: [],
      portReloader: utils.deepGet(global, 'conf.livereload_port') || '',
      portServer: utils.deepGet(global, 'conf.express_port') || '',
      userHeadComp: null,
      userHeadGlobal: '',
      userHeadParse: [],
      userFootSplit: [],
      viewallPatterns: {}
    };

    this.utils = utils;

    this.annotationsBuilder = new AnnotationsBuilder(this);
    this.listItemsBuilder = new ListItemsBuilder(this);
    this.lineageBuilder = new LineageBuilder(this);
    this.patternBuilder = new PatternBuilder(this);
    this.pseudoPatternBuilder = new PseudoPatternBuilder(this);
    this.uiBuilder = new UiBuilder(this);
    this.uiCompiler = new UiCompiler(this);
    this.viewallBuilder = new ViewallBuilder(this);
  }

  /* PRIVATE METHODS */

  buildPatternData(dataFilesPath) {
    const jsonFileStr = fs.readFileSync(`${dataFilesPath}/data.json`, this.config.enc);
    const jsonData = JSON5.parse(jsonFileStr);

    return jsonData;
  }

  // DEPRECATED. Renamed and moved to fepper-utils.
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
      this.ingredients.data = this.buildPatternData(this.config.paths.source.data);
    }
    catch (err) /* istanbul ignore next */ {
      this.utils.error('ERROR: Missing or malformed ' + `${this.config.paths.source.data}/data.json`);
      this.utils.error(err);
    }

    const immutableDir = `${this.config.paths.core}/immutable`;

    try {
      this.ingredients.header = fs.readFileSync(`${immutableDir}/immutable-header.mustache`, this.config.enc);
      this.ingredients.footer = fs.readFileSync(`${immutableDir}/immutable-footer.mustache`, this.config.enc);
    }
    catch (err) /* istanbul ignore next */ {
      this.utils.error('ERROR: Missing an essential file from ' + immutableDir);
      this.utils.error(err);
    }

    this.ingredients.data.cacheBuster = '{{ cacheBuster }}';
    this.ingredients.data.link = {};
    this.ingredients.data.pathsPublic = this.config.pathsPublic;
    this.ingredients.patterns = [];

    this.viewallBuilder.readViewallTemplates();

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

    if (this.config.useListItems) {
      const listItemsFile = `${this.config.paths.source.data}/listitems.json`;

      if (fs.existsSync(listItemsFile)) {
        try {
          const listItemsStr = fs.readFileSync(listItemsFile, this.config.enc);

          this.ingredients.listItems = JSON5.parse(listItemsStr);
        }
        catch (err) /* istanbul ignore next */ {
          this.utils.error('ERROR: Malformed ' + listItemsFile);
          this.utils.error(err);
        }
      }

      const patternsPath = this.config.paths.source.patterns;

      for (let i = 0, l = this.ingredients.patterns.length; i < l; i++) {
        const pattern = this.ingredients.patterns[i];

        // Look for a listitems.json file for this template.
        const listJsonFileName = `${patternsPath}/${pattern.subdir}/${pattern.fileName}` + '.listitems.json';

        if (fs.existsSync(listJsonFileName)) {
          try {
            const jsonFileStr = fs.readFileSync(listJsonFileName, this.config.enc);

            pattern.listItems = JSON5.parse(jsonFileStr);

            if (this.config.debug) {
              this.utils.log('Found pattern-specific listitems.json for ' + pattern.patternPartial);
            }

            this.listItemsBuilder.listItemsBuild(pattern);
            this.utils.extendButNotOverride(pattern.jsonFileData.listItems, this.ingredients.data.listItems);
          }
          catch (err) /* istanbul ignore next */ {
            this.utils.error('There was an error parsing pattern-specific listitems.json for ' +
              pattern.relPath);
            this.utils.error(err);
          }
        }
      }
    }
  }

  preProcessDataKeys(schemaObj, dataObj) {
    for (let key of Object.keys(dataObj)) {
      if (dataObj[key].constructor === Object) {
        schemaObj[key] = this.preProcessDataKeys(schemaObj, dataObj[key]);
      }

      schemaObj[key] = true;
    }
  }

  preProcessDataAndParams() {
    if (this.config.useListItems) {
      this.listItemsBuilder.listItemsBuild(this.ingredients);
    }

    this.preProcessDataKeys(this.ingredients.dataKeysSchema, this.ingredients.data);
    // Create an array of data keys to not render when preprocessing partials.
    this.ingredients.dataKeys = Feplet.preProcessContextKeys(this.ingredients.dataKeysSchema);

    // Iterate through patternlab.partials and patternlab.patterns to preprocess partials with params.
    this.patternBuilder.preProcessPartialParams();
  }

  prepWrite() {
    let userHead;

    // Set user defined head and foot if they exist.
    try {
      userHead = fs.readFileSync(`${this.config.paths.source.meta}/_00-head.mustache`, this.config.enc);
    }
    catch (err) /* istanbul ignore next */ {
      if (this.config.debug) {
        this.utils.warn(err);

        let warnHead = 'Could not find optional user-defined header, usually found at ';
        warnHead += './source/_meta/_00-head.mustache. It was likely deleted.';

        utils.warn(warnHead);
      }

      // Default HTML head.
      userHead =
        fs.readFileSync(`${this.config.appDir}/excludes/profiles/base/source/_meta/_00-head.mustache`, this.config.enc);
    }

    userHead = userHead.replace(/\{\{\{?\s*patternlabHead\s*\}?\}\}/i, this.ingredients.header);
    this.ingredients.userHeadParse = Feplet.parse(Feplet.scan(userHead));
    this.ingredients.userHeadComp = Feplet.generate(this.ingredients.userHeadParse, userHead, {});
    this.ingredients.userHeadGlobal = this.ingredients.userHeadComp.render(this.ingredients.data);

    let userFoot;

    try {
      userFoot = fs.readFileSync(`${this.config.paths.source.meta}/_01-foot.mustache`, this.config.enc);
    }
    catch (err) /* istanbul ignore next */ {
      if (this.config.debug) {
        this.utils.warn(err);

        let warnFoot = 'Could not find optional user-defined footer, usually found at ';
        warnFoot += './source/_meta/_01-foot.mustache. It was likely deleted.';

        this.utils.warn(warnFoot);
      }

      // Default HTML foot.
      userFoot =
        fs.readFileSync(`${this.config.appDir}/excludes/profiles/base/source/_meta/_01-foot.mustache`, this.config.enc);
    }

    const userFootSplit = userFoot.split(/\{\{\{?\s*patternlabFoot\s*\}?\}\}/i);

    for (let i = 0, l = userFootSplit.length; i < l; i++) {
      this.ingredients.userFootSplit[i] = Feplet.render(userFootSplit[i], this.ingredients.data);
    }

    // Prepare for writing to file system. Delete the contents of config.patterns.public before writing.
    if (this.config.cleanPublic) {
      this.clean();
    }

    const hashesFile = `${this.config.paths.public.patterns}/hashes.json`;

    if (fs.existsSync(hashesFile)) {
      this.ingredients.hashesOld = fs.readJsonSync(hashesFile);
    }

    this.annotationsBuilder.main();
  }

  // DEPRECATED. Moved to fepper-utils.
  rmRfFilesNotDirs(dirToEmpty) /* istanbul ignore next */ {
    this.emptyFilesNotDirs(dirToEmpty);
  }

  // DEPRECATED. In fepper-utils and will be removed from here.
  strReplaceGlobal(haystack, needle, replacement) /* istanbul ignore next */ {
    let haystackNew = haystack;
    let needleIndex = needle ? haystackNew.indexOf(needle) : -1;

    while (needleIndex > -1) {
      haystackNew = haystackNew.substring(0, needleIndex) +
        replacement +
        haystackNew.substring(needleIndex + needle.length);

      needleIndex = haystackNew.indexOf(needle);
    }

    return haystackNew;
  }

  /* PUBLIC METHODS */

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

  clean() {
    // this.rmRfFilesNotDirs is DEPRECATED.
    // After deprecation period, permanently change conditionalObj to this.utils.
    let conditionalObj = this;

    /* istanbul ignore if */
    if (typeof this.utils.rmRfFilesNotDirs === 'function') {
      conditionalObj = this.utils;
    }

    conditionalObj.rmRfFilesNotDirs(this.config.paths.public.annotations);
    conditionalObj.rmRfFilesNotDirs(this.config.paths.public.images);
    conditionalObj.rmRfFilesNotDirs(this.config.paths.public.js);
    conditionalObj.rmRfFilesNotDirs(this.config.paths.public.css);

    fs.emptyDirSync(this.config.paths.public.patterns);
  }

  compile(options) {
    if (options && options.constructor === Object) {
      this.resetConfig(options);
    }

    this.uiCompiler.main();
  }

  getPattern(query) {
    let i = this.ingredients.patterns.length;

    // Going from highest index to lowest index because multiple patterns can have the same .patternPartial name and we
    // want the one at the highest index to be the match.
    // e.g.
    // 00-atoms/00-global/00-colors.mustache -> atoms-colors
    // 00-atoms/01-local/00-colors.mustache -> atoms-colors
    while (i--) {
      const pattern = this.ingredients.patterns[i];
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
