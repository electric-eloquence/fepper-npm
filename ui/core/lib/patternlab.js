/*
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
const feplet = require('feplet');
const fs = require('fs-extra');
const glob = require('glob');
const JSON5 = require('json5');

const listItemsBuilder = require('./list-items-builder');
const Pattern = require('./object-factory').Pattern;
const patternAssembler = require('./pattern-assembler');
const patternExport = require('./pattern-export');
const plutils = require('./utilities');
const uiBuild = require('./ui-build');

module.exports = class Patternlab {
  constructor(config, cwd) {
    // Clone before adapting the config object. Do not directly mutate the parameter!
    if (config) {
      this.config = JSON.parse(JSON.stringify(config));
    }
    else {
      const jsonFileStr = fs.readFileSync(
        path.resolve(__dirname, '../../../excludes/patternlab-config.json'),
        global.conf.enc
      );

      this.config = JSON5.parse(jsonFileStr);
    }

    // The app's working directory can be submitted as a param to resolve relative paths.
    this.cwd = cwd || path.resolve(__dirname, '../../../../..');

    this.data = {};
    this.enc = global.conf.enc;
    this.footer = '';
    this.patterns = [];
    this.useListItems = false;
    this.userHead = '';
    this.userFoot = '';
    this.viewall = '';

    // Normalize configs.

    const pathsPublic = this.config.paths.public;
    const pathsSource = this.config.paths.source;

    for (let i in pathsPublic) {
      if (!pathsPublic.hasOwnProperty(i)) {
        continue;
      }

      pathsPublic[i] = path.resolve(this.cwd, pathsPublic[i]);
    }

    for (let i in pathsSource) {
      if (!pathsSource.hasOwnProperty(i)) {
        continue;
      }

      pathsSource[i] = path.resolve(this.cwd, pathsSource[i]);
    }

    // Normalize this.config.patternExtension here. It's not used anywhere else in Fepper, so there's no real reason to
    // normalize it in /core, where Patternlab is instantiated. It's also possible that this Patternlab class may be
    // instantiated elsewhere, so normalization needs to be done here for maximum utility.
    if (this.config.patternExtension.charAt(0) !== '.') {
      this.config.patternExtension = `.${this.config.patternExtension}`;
    }

    this.config.patternExportDirectory = path.resolve(this.cwd, config.patternExportDirectory);
  }

  // PRIVATE METHODS

  buildPatternData(dataFilesPath_) {
    const dataFilesPath = path.resolve(dataFilesPath_);
    const jsonFileStr = fs.readFileSync(dataFilesPath + '/data.json', this.enc);
    const jsonData = JSON5.parse(jsonFileStr);

    return jsonData;
  }

  buildPatterns() {
    try {
      this.data = this.buildPatternData(this.config.paths.source.data);
    }
    catch (err) {
      plutils.logRed('ERROR: missing or malformed ' + path.resolve(this.config.paths.source.data, 'data.json'));
      console.log(err.message || err);

      this.data = {};
    }


    try {
      const jsonFileStr = fs.readFileSync(path.resolve(this.config.paths.source.data, 'listitems.json'), this.enc);

      this.listItems = JSON5.parse(jsonFileStr);
    }
    catch (err) {
      plutils.logRed('ERROR: missing or malformed ' + path.resolve(this.config.paths.source.data, 'listitems.json'));
      console.log(err.message || err);

      this.listItems = {};
    }

    const immutableDir = path.resolve(__dirname, '../immutable');

    try {
      this.header = fs.readFileSync(immutableDir + '/immutable-header.mustache', this.enc);
      this.footer = fs.readFileSync(immutableDir + '/immutable-footer.mustache', this.enc);
    }
    catch (err) {
      plutils.logRed('ERROR: missing an essential file from ' + immutableDir);
      console.log(err.message || err);

      throw err;
    }

    this.buildViewAll();
    this.patterns = [];
    this.subTypePatterns = {};
    this.partials = {};
    this.data.link = {};
    this.setCacheBust();

    const patternsDir = this.config.paths.source.patterns;

    // diveSync once to populate patternlab.patterns array
    this.preprocessAllPatterns(patternsDir);

    // iterate through patternlab.partials and patternlab.patterns to preprocess partials with params
    patternAssembler.preprocessPartialParams(this);

    if (this.useListItems) {
      listItemsBuilder.listItemsBuild(this);
    }

    // set user defined head and foot if they exist
    try {
      this.userHead = fs.readFileSync(path.resolve(this.config.paths.source.meta, '_00-head.mustache'), this.enc);
    }
    catch (err) {
      if (this.config.debug) {
        console.log(err.message || err);

        let warnHead = 'Could not find optional user-defined header, usually found at ';
        warnHead += './source/_meta/_00-head.mustache. It was likely deleted.';

        console.log(warnHead);
      }
    }

    try {
      this.userFoot = fs.readFileSync(path.resolve(this.config.paths.source.meta, '_01-foot.mustache'), this.enc);
    }
    catch (err) {
      if (this.config.debug) {
        console.log(err.message || err);

        let warnFoot = 'Could not find optional user-defined footer, usually found at ';
        warnFoot += './source/_meta/_01-foot.mustache. It was likely deleted.';

        console.log(warnFoot);
      }
    }

    // prepare for writing to file system
    // delete the contents of config.patterns.public before writing
    if (this.config.cleanPublic) {
      this.emptyFilesNotDirs(this.config.paths.public.annotations);
      this.emptyFilesNotDirs(this.config.paths.public.images);
      this.emptyFilesNotDirs(this.config.paths.public.js);
      this.emptyFilesNotDirs(this.config.paths.public.css);
      fs.emptyDirSync(this.config.paths.public.patterns);
    }

    // process patterns and write them to file system
    this.processAllPatterns();

    // export patterns if necessary
    patternExport(this);

    // log memory usage
    if (this.config.debug) {
      const used = process.memoryUsage().heapUsed / 1024 / 1024;

      console.log(`The patterns-only build used approximately ${Math.round(used * 100) / 100} MB`);
    }
  }

  buildViewAll() {
    // allow viewall templates to be overridden
    if (this.config.paths.source.ui) {
      const viewallCustomDir = path.resolve(this.config.paths.source.ui, 'viewall');

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

    const viewallCoreDir = path.resolve(__dirname, '../styleguide/viewall');

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
      plutils.logRed('ERROR: missing an essential file from ' + viewallCoreDir);
      console.log(err.message || err);

      throw err;
    }
  }

  emptyFilesNotDirs(publicDir) {
    diveSync(
      publicDir,
      function (err, file) {
        // log any errors
        if (err) {
          console.log(err);

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
    const patternlab = this;

    diveSync(
      patternsDir,
      function (err, file) {
        // log any errors
        if (err) {
          console.log(err);
          return;
        }
        patternAssembler.preprocessPattern(path.relative(patternsDir, file), patternlab);
      }
    );
  }

  processAllPatterns() {
    for (let i = 0, l = this.patterns.length; i < l; i++) {
      patternAssembler.processPattern(this.patterns[i], this);
    }
  }

  setCacheBust() {
    if (this.config.cacheBust) {
      if (this.config.debug) {
        console.log('Setting cacheBuster value for frontend assets.');
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
      this.config = plutils.extendButNotOverride(options, this.config);
    }

    this.buildPatterns();

    return uiBuild(this);
  }

  compileUi(options) {
    if (options && options.constructor === Object) {
      this.config = plutils.extendButNotOverride(options, this.config);
    }

    const componentizer = new (require('../styleguide/componentizer'))(this);

    return componentizer.main(true);
  }

  getPattern(patternName) {
    let i = this.patterns.length;

    // going from highest index to lowest index because multiple patterns can have the same .patternPartial name and we
    // want the one at the highest index to be the match
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
    console.log('Command Line Interface');
    console.log('');

    plutils.logGreen(' fp ui:build');
    console.log('  > Builds the patterns and frontend, outputting to config.paths.public');
    console.log('');

    plutils.logGreen(' fp ui:clean');
    console.log('  > Delete all patterns in config.paths.public');
    console.log('');

    plutils.logGreen(' fp ui:compile');
    console.log('  > Compiles the UI frontend only');
    console.log('');

    plutils.logGreen(' fp ui:copy');
    console.log('  > Copies frontend files (_assets, _scripts, _styles) to config.paths.public');
    console.log('');

    plutils.logGreen(' fp ui:copy-styles');
    console.log('  > Copies _styles to config.paths.public (for injection into browser without refresh)');
    console.log('');

    plutils.logGreen(' fp ui:help');
    console.log('  > Get more information about Fepper UI CLI commands');
    console.log('');

    plutils.logGreen(' fp ui:patternsonly');
    console.log('  > Builds the patterns only, outputting to config.paths.public');
    console.log('');

    plutils.logGreen(' fp ui:v');
    console.log('  > Output the version of the fepper-ui NPM');
    console.log('');
  }

  patternsonly(options) {
    if (options && options.constructor === Object) {
      this.config = plutils.extendButNotOverride(options, this.config);
    }

    this.buildPatterns();
  }

  resetConfig(config) {
    if (config && config.constructor === Object) {
      this.config = plutils.extendButNotOverride(config, this.config);
    }
    else {
      console.error('Invalid config object!');
    }
  }
};
