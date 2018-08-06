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

const ListItemsBuilder = require('./list-items-builder');
const LineageHunter = require('./lineage-hunter');
const PatternAssembler = require('./pattern-assembler');
const PatternExporter = require('./pattern-exporter');
const PseudopatternHunter = require('./pseudopattern-hunter');
const UiBuilder = require('./ui-builder');

module.exports = class {
  constructor(config, cwd) {
    this.config = config;
    this.utils = utils;

    if (!this.config.paths.core) {
      this.config.paths.core = this.utils.pathResolve(slash(__dirname), '..');
    }

    // The app's working directory can be submitted as a param to resolve relative paths.
    this.cwd = cwd || this.utils.pathResolve(this.config.paths.core, '..', '..', '..', '..');

    this.utils.uiConfigNormalize(this.config, this.cwd);

    this.data = {};
    this.dataKeysSchemaObj = {};
    this.dataKeys = {};
    this.enc = (global.conf && global.conf.enc) || 'utf8';
    this.footer = '';
    this.partials = {};
    this.partialsComp = {};
    this.patterns = [];
    this.subTypePatterns = {};
    this.useListItems = false;
    this.userHead = '';
    this.userFoot = '';
    this.viewall = '';

    this.listItemsBuilder = new ListItemsBuilder(this);
    this.lineageHunter = new LineageHunter(this);
    this.patternAssembler = new PatternAssembler(this);
    this.patternExporter = new PatternExporter(this);
    this.uiBuilder = new UiBuilder(this);
    this.pseudopatternHunter = new PseudopatternHunter(this);
  }

  // PRIVATE METHODS

  buildPatternData(dataFilesPath) {
    const jsonFileStr = fs.readFileSync(`${dataFilesPath}/data.json`, this.enc);
    const jsonData = JSON5.parse(jsonFileStr);

    return jsonData;
  }

  buildPatterns() {
    const patternsDir = this.config.paths.source.patterns;

    this.preprocessAllPatterns(patternsDir); // diveSync to populate patternlab.patterns array.
    this.preprocessDataAndParams();
    this.prepWrite();
    this.processAllPatterns(); // Process patterns and write them to file system.

    // Export patterns if necessary.
    this.patternExporter.main(this);

    // Log memory usage if debug === true.
    if (this.config.debug) {
      const used = process.memoryUsage().heapUsed / 1024 / 1024;

      this.utils.log(`The patterns-only build used approximately ${Math.round(used * 100) / 100} MB`);
    }
  }

  buildViewAll() {
    // Allow viewall templates to be overridden.
    if (this.config.paths.source.ui) {
      const viewallCustomDir = `${this.config.paths.source.ui}/viewall`;

      if (fs.existsSync(viewallCustomDir + '/partials/pattern-section.mustache')) {
        this.patternSection = fs.readFileSync(viewallCustomDir + '/partials/pattern-section.mustache', this.enc);
      }
      if (fs.existsSync(viewallCustomDir + '/partials/pattern-section-sub-type.mustache')) {
        this.patternSectionSubType = fs.readFileSync(
          viewallCustomDir + '/partials/pattern-section-sub-type.mustache', this.enc
        );
      }
      if (fs.existsSync(viewallCustomDir + '/viewall.mustache')) {
        this.viewall = fs.readFileSync(viewallCustomDir + '/viewall.mustache', this.enc);
      }
    }

    const viewallCoreDir = `${this.config.paths.core}/styleguide/viewall`;

    try {
      if (!this.patternSection) {
        this.patternSection = fs.readFileSync(viewallCoreDir + '/partials/pattern-section.mustache', this.enc);
      }
      if (!this.patternSectionSubType) {
        this.patternSectionSubType = fs.readFileSync(
          viewallCoreDir + '/partials/pattern-section-sub-type.mustache', this.enc
        );
      }
      if (!this.viewall) {
        this.viewall = fs.readFileSync(viewallCoreDir + '/viewall.mustache', this.enc);
      }
    }
    catch (err) {
      this.utils.error('ERROR: Missing an essential file from ' + viewallCoreDir);
      this.utils.error(err.message || err);

      throw err;
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
          fs.unlinkSync(file);
        }
      }
    );
  }

  preprocessAllPatterns(patternsDir) {
    try {
      this.data = this.buildPatternData(this.config.paths.source.data);
    }
    catch (err) {
      this.utils.error('ERROR: Missing or malformed ' + `${this.config.paths.source.data}/data.json`);
      this.utils.error(err.message || err);

      this.data = {};
    }

    try {
      const jsonFileStr = fs.readFileSync(`${this.config.paths.source.data}/listitems.json`, this.enc);

      this.listItems = JSON5.parse(jsonFileStr);
    }
    catch (err) {
      this.utils.error('ERROR: Missing or malformed ' + `${this.config.paths.source.data}/listitems.json`);
      this.utils.error(err.message || err);

      this.listItems = {};
    }

    const immutableDir = `${this.config.paths.core}/immutable`;

    try {
      this.header = fs.readFileSync(`${immutableDir}/immutable-header.mustache`, this.enc);
      this.footer = fs.readFileSync(`${immutableDir}/immutable-footer.mustache`, this.enc);
    }
    catch (err) {
      this.utils.error('ERROR: Missing an essential file from ' + immutableDir);
      this.utils.error(err.message || err);

      throw err;
    }

    this.data.link = {};
    this.partials = {};
    this.partialsComp = {};
    this.patterns = [];
    this.subTypePatterns = {};

    this.buildViewAll();
    this.setCacheBust();

    const patternlab = this;

    diveSync(
      patternsDir,
      (err, file) => {
        // Log any errors.
        if (err) {
          this.utils.error(err);
          return;
        }
        // Submit relPath.
        this.patternAssembler.preprocessPattern(slash(path.relative(patternsDir, file)), patternlab);
      }
    );
  }

  preprocessDataAndParams() {
    if (this.useListItems) {
      this.listItemsBuilder.listItemsBuild(this);
    }

    // Create an array of data keys to not render when preprocessing partials.
    this.utils.extendButNotOverride(this.dataKeysSchemaObj, this.data);
    this.dataKeys = Feplet.preprocessContextKeys(this.dataKeysSchemaObj);

    // Iterate through patternlab.partials and patternlab.patterns to preprocess partials with params.
    this.patternAssembler.preprocessPartialParams(this);
  }

  prepWrite() {
    // Set user defined head and foot if they exist.
    try {
      this.userHead = fs.readFileSync(`${this.config.paths.source.meta}/_00-head.mustache`, this.enc);
    }
    catch (err) {
      if (this.config.debug) {
        this.utils.error(err.message || err);

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
        this.utils.error(err.message || err);

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

  processAllPatterns() {
    for (let i = 0, l = this.patterns.length; i < l; i++) {
      this.patternAssembler.processPattern(this.patterns[i], this);
      this.patternAssembler.writePattern(this.patterns[i], this);
      this.patternAssembler.freePattern(this.patterns[i], this);
    }
  }

  setCacheBust() {
    if (this.config.cacheBust) {
      if (this.config.debug) {
        this.utils.log('Setting cacheBuster value for frontend assets.');
      }

      this.cacheBuster = '?' + Date.now();
    }
    else {
      this.cacheBuster = '';
    }
  }

  // PUBLIC METHODS

  build(options) {
    if (options && options.constructor === Object) {
      this.config = this.utils.extendButNotOverride(options, this.config);
    }

    this.buildPatterns();
    this.uiBuilder.main(this);
  }

  compileui(options) {
    if (options && options.constructor === Object) {
      this.config = this.utils.extendButNotOverride(options, this.config);
    }

    const componentizer = new (require('../styleguide/componentizer'))(this);

    return componentizer.main(true);
  }

  getPattern(patternName) {
    let i = this.patterns.length;

    // Going from highest index to lowest index because multiple patterns can have the same .patternPartial name and we
    // want the one at the highest index to be the match.
    // e.g.
    // 00-atoms/00-global/00-colors.mustache -> atoms-colors
    // 00-atoms/01-local/00-colors.mustache -> atoms-colors
    while (i--) {
      const pattern = this.patterns[i];

      switch (patternName) {
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
    fp <task> [<additional args>...]

Tasks:
    fp ui:build         Build the patterns and frontend, outputting to config.paths.public.
    fp ui:clean         Delete all patterns in config.paths.public.
    fp ui:compile       Compile the UI frontend and build the patterns.
    fp ui:compileui     Compile the UI frontend only.
    fp ui:copy          Copy frontend files (_assets, _scripts, _styles) to config.paths.public.
    fp ui:copy-styles   Copy _styles to config.paths.public (for injection into browser without refresh.
    fp ui:help          Get more information about Fepper UI CLI commands.
    fp ui:patternsonly  Build the patterns only, outputting to config.paths.public.
    fp ui:v             Output the version of the fepper-ui NPM.
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
