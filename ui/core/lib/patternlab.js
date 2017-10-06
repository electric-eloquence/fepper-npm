/*
 * patternlab-node - v2.3.0 - 2016
 *
 * Brian Muenzenmeyer, Geoff Pursell, and the web community
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

'use strict';

var diveSync = require('diveSync');
var fs = require('fs-extra');
var glob = require('glob');
var JSON5 = require('json5');
var path = require('path');
var plutils = require('./utilities');

function buildPatternData(dataFilesPathParam) {
  var dataFilesPath = path.resolve(dataFilesPathParam);
  var dataFiles = glob.sync(dataFilesPath + '/*.json', {ignore: [dataFilesPath + 'listitems.json']});
  var mergedObject = {};
  dataFiles.forEach(function (filePath) {
    var jsonFileStr = fs.readFileSync(path.resolve(filePath), 'utf8');
    var jsonData = JSON5.parse(jsonFileStr);
    plutils.extendButNotOverride(mergedObject, jsonData);
  });
  return mergedObject;
}

function makePublicSubDir(srcDir, srcSub, pubDir) {
  var pubSub;

  if (srcSub && srcSub.indexOf(srcDir) === 0) {
    pubSub = srcSub.replace(srcDir, '');
    fs.mkdirsSync(pubDir + pubSub);
  }
}

function processAllPatternsIterative(pattern_assembler, patterns_dir, patternlab) {
  diveSync(
    patterns_dir,
    function (err, file) {
      // log any errors
      if (err) {
        console.log(err);
        return;
      }
      pattern_assembler.processPatternIterative(path.relative(patterns_dir, file), patternlab);
    }
  );
}

function processAllPatternsRecursive(pattern_assembler, patterns_dir, patternlab) {
  for (var i = 0; i < patternlab.patterns.length; i++) {
    pattern_assembler.processPatternRecursive(patternlab.patterns[i], i, patternlab);
  }
}

var patternlab_engine = function (configParam, configDirParam) {
  var pa = require('./pattern_assembler');
  var pe = require('./pattern_exporter');
  var lih = require('./list_item_hunter');
  var buildFrontend = require('./ui_builder');
  var sm = require('./starterkit_manager');
  var patternlab = {
    cwd: '.',
    data: {},
    footer: '',
    patterns: [],
    userHead: '',
    userFoot: '',
    viewAll: ''
  };

  // The configDir can be submitted as a param to resolve relative paths in configParam.
  var configDir = configDirParam || '';
  // Clone and mutate the config object to facilitate this portability.
  var config = JSON.parse(JSON.stringify(configParam));
  if (configDir) {
    var pathsSource = config.paths.source;
    for (var pathSrc in pathsSource) {
      if (pathsSource.hasOwnProperty(pathSrc)) {
        pathsSource[pathSrc] = path.resolve(configDir, pathsSource[pathSrc]);
      }
    }

    var pathsPublic = config.paths.public;
    for (var pathPub in pathsPublic) {
      if (pathsPublic.hasOwnProperty(pathPub)) {
        pathsPublic[pathPub] = path.resolve(configDir, pathsPublic[pathPub]);
      }
    }

    config.patternExportDirectory = path.resolve(configDir, config.patternExportDirectory);
    patternlab.cwd = configDir;
  }

  var jsonFileStr = fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8');
  patternlab.package = JSON5.parse(jsonFileStr);
  if (config) {
    patternlab.config = config;
  } else {
    jsonFileStr = fs.readFileSync(path.resolve(__dirname, '../../patternlab-config.json'), 'utf8');
    patternlab.config = JSON5.parse(jsonFileStr);
  }

  var paths = patternlab.config.paths;

  function getVersion() {
    console.log(patternlab.package.version);
  }


  function help() {
    /* eslint-disable max-len */
    console.log('');

    console.log('|=======================================|');
    plutils.logGreen('     Pattern Lab Node Help v' + patternlab.package.version);
    console.log('|=======================================|');

    console.log('');
    console.log('Command Line Interface - usually consumed by an edition');
    console.log('');

    plutils.logGreen(' patternlab:build');
    console.log('   > Builds the patterns and frontend, outputting to config.paths.public');
    console.log('');

    plutils.logGreen(' patternlab:patternsonly');
    console.log('   > Builds the patterns only, outputting to config.paths.public');
    console.log('');

    plutils.logGreen(' patternlab:version');
    console.log('   > Return the version of patternlab-node you have installed');
    console.log('');

    plutils.logGreen(' patternlab:help');
    console.log('   > Get more information about patternlab-node, pattern lab in general, and where to report issues.');
    console.log('');

    plutils.logGreen(' patternlab:liststarterkits');
    console.log('   > Returns a url with the list of available starterkits hosted on the Pattern Lab organization Github account');
    console.log('');

    plutils.logGreen(' patternlab:loadstarterkit');
    console.log('   > Load a starterkit into config.paths.source/*');
    console.log('   > NOTE: Overwrites existing content, and only cleans out existing directory if --clean=true argument is passed.');
    console.log('   > NOTE: In most cases, `npm install starterkit-name` will precede this call.');
    console.log('   > arguments:');
    console.log('      -- kit ');
    console.log('      > the name of the starter kit to load');
    console.log('      -- clean ');
    console.log('      > removes all files from config.paths.source/ prior to load');
    console.log('   > example (gulp):');
    console.log('    `gulp patternlab:loadstarterkit --kit=starterkit-mustache-demo`');
    console.log('');

    console.log('===============================');
    console.log('');
    console.log('Visit http://patternlab.io/ for more info about Pattern Lab');
    console.log('Visit https://github.com/pattern-lab/patternlab-node/issues to open an issue.');
    console.log('Visit https://github.com/pattern-lab/patternlab-node/wiki to view the changelog, roadmap, and other info.');
    console.log('');
    console.log('===============================');

    /* eslint-enable max-len */
  }

  function printDebug() {
    // A replacer function to pass to stringify below; this is here to prevent
    // the debug output from blowing up into a massive fireball of circular
    // references. This happens specifically with the Handlebars engine. Remove
    // if you like 180MB log files.
    function propertyStringReplacer(key, value) {
      if (key === 'engine' && value && value.engineName) {
        return '{' + value.engineName + ' engine object}';
      }
      return value;
    }

    // debug file can be written by setting flag on patternlab-config.json
    if (patternlab.config.debug) {
      console.log('writing patternlab debug file to ./patternlab.json');
      fs.outputFileSync('./patternlab.json', JSON.stringify(patternlab, propertyStringReplacer, 3));
    }
  }

  function setCacheBust() {
    if (patternlab.config.cacheBust) {
      if (patternlab.config.debug) {
        console.log('setting cacheBuster value for frontend assets.');
      }
      patternlab.cacheBuster = new Date().getTime();
    } else {
      patternlab.cacheBuster = 0;
    }
  }

  function listStarterkits() {
    var starterkit_manager = new sm(patternlab);
    return starterkit_manager.list_starterkits();
  }

  function loadStarterKit(starterkitName, clean) {
    var starterkit_manager = new sm(patternlab);
    starterkit_manager.load_starterkit(starterkitName, clean);
  }

  function buildViewAll(patternlab_) {
    // viewall markup from core templates
    var viewAllCoreDir = path.resolve(__dirname, '../styleguide/viewall');
    try {
      patternlab_.patternSection = fs.readFileSync(viewAllCoreDir + '/partials/patternSection.mustache', 'utf8');
      patternlab_.patternSectionSubType = fs.readFileSync(
        viewAllCoreDir + '/partials/patternSectionSubtype.mustache', 'utf8');
      patternlab_.viewAll = fs.readFileSync(viewAllCoreDir + '/viewall.mustache', 'utf8');
    } catch (ex) {
      plutils.logRed('ERROR: missing an essential file from ' + viewAllCoreDir +
        '. Pattern Lab won\'t work without this file.');
      console.log(ex.message || ex);
      throw ex;
    }

    // allow viewall templates to be overridden
    if (paths.source.ui) {
      var viewAllCustomDir = path.resolve(paths.source.ui, 'viewall');
      if (fs.existsSync(viewAllCustomDir + '/partials/patternSection.mustache')) {
        patternlab_.patternSection = fs.readFileSync(viewAllCustomDir + '/partials/patternSection.mustache', 'utf8');
      }
      if (fs.existsSync(viewAllCustomDir + '/partials/patternSectionSubtype.mustache')) {
        patternlab_.patternSectionSubType = fs.readFileSync(
          viewAllCustomDir + '/partials/patternSectionSubtype.mustache', 'utf8');
      }
      if (fs.existsSync(viewAllCustomDir + '/viewall.mustache')) {
        patternlab_.viewAll = fs.readFileSync(viewAllCustomDir + '/viewall.mustache', 'utf8');
      }
    }
  }

  function buildPatterns(cleanPublic) {
    try {
      patternlab.data = buildPatternData(paths.source.data);
    } catch (ex) {
      plutils.logRed('ERROR: missing or malformed ' + path.resolve(paths.source.data, 'data.json') +
      '. Pattern Lab may not work without this file.');
      console.log(ex.message || ex);
      patternlab.data = {};
    }
    try {
      jsonFileStr = fs.readFileSync(path.resolve(paths.source.data, 'listitems.json'), 'utf8');
      patternlab.listitems = JSON5.parse(jsonFileStr);
    } catch (ex) {
      plutils.logRed('ERROR: missing or malformed ' + path.resolve(paths.source.data, 'listitems.json') +
      '. Pattern Lab may not work without this file.');
      console.log(ex.message || ex);
      patternlab.listitems = {};
    }
    var immutableDir = path.resolve(__dirname, '../immutable');
    try {
      patternlab.header = fs.readFileSync(immutableDir + '/immutable-header.mustache', 'utf8');
      patternlab.footer = fs.readFileSync(immutableDir + '/immutable-footer.mustache', 'utf8');
    } catch (ex) {
      plutils.logRed('ERROR: missing an essential file from ' + immutableDir +
        '. Pattern Lab won\'t work without this file.');
      console.log(ex.message || ex);
      throw ex;
    }

    buildViewAll(patternlab);

    patternlab.patterns = [];
    patternlab.subtypePatterns = {};
    patternlab.partials = {};
    patternlab.data.link = {};

    setCacheBust();

    var pattern_assembler = new pa();
    var pattern_exporter = new pe(configDir || process.cwd());
    var list_item_hunter = new lih();
    var patterns_dir = paths.source.patterns;

    pattern_assembler.buildListItems(patternlab);

    var Pattern = require('./object_factory').Pattern;
    var patternEngines = require('./pattern_engines');
    var dummyPattern = Pattern.createEmpty();
    var engine = patternEngines.getEngineForPattern(dummyPattern);

    // diveSync once to perform iterative populating of patternlab object
    processAllPatternsIterative(pattern_assembler, patterns_dir, patternlab);

    // push list item keywords into dataKeys property
    patternlab.dataKeys = ['styleModifier'].concat(pattern_assembler.getDataKeys(patternlab.data));

    for (var i = 0; i < list_item_hunter.items.length; i++) {
      patternlab.dataKeys.push('listItems.' + list_item_hunter.items[i]);
      patternlab.dataKeys.push('listitems.' + list_item_hunter.items[i]);
    }

    // set user defined head and foot if they exist
    try {
      patternlab.userHead = fs.readFileSync(path.resolve(paths.source.meta, '_00-head.mustache'), 'utf8');
    } catch (ex) {
      if (patternlab.config.debug) {
        console.log(ex.message || ex);
        var warnHead = 'Could not find optional user-defined header, usually found at ';
        warnHead += './source/_meta/_00-head.mustache. It was likely deleted.';
        console.log(warnHead);
      }
    }
    try {
      patternlab.userFoot = fs.readFileSync(path.resolve(paths.source.meta, '_01-foot.mustache'), 'utf8');
    } catch (ex) {
      if (patternlab.config.debug) {
        console.log(ex.message || ex);
        var warnFoot = 'Could not find optional user-defined footer, usually found at ';
        warnFoot += './source/_meta/_01-foot.mustache. It was likely deleted.';
        console.log(warnFoot);
      }
    }

    // delete the contents of config.patterns.public before writing
    if (cleanPublic) {
      fs.emptyDirSync(paths.public.annotations);
      fs.emptyDirSync(paths.public.images);
      makePublicSubDir(paths.source.images, paths.source.imagesBld, paths.public.images);
      makePublicSubDir(paths.source.images, paths.source.imagesSrc, paths.public.images);
      fs.emptyDirSync(paths.public.js);
      makePublicSubDir(paths.source.js, paths.source.jsBld, paths.public.js);
      makePublicSubDir(paths.source.js, paths.source.jsSrc, paths.public.js);
      fs.emptyDirSync(paths.public.css);
      makePublicSubDir(paths.source.css, paths.source.cssBld, paths.public.css);
      makePublicSubDir(paths.source.css, paths.source.cssSrc, paths.public.css);
      fs.emptyDirSync(paths.public.patterns);
    }

    patternlab.footer = patternlab.footer.replace(
      '{{# lineageR }} = {{{ lineageR }}}{{/ lineageR }}',
      '\u0002# lineageR }} = \u0002{ lineageR }}}\u0002/ lineageR }}'
    );

    // diveSync again to recursively include partials, filling out the
    // extendedTemplate property of the patternlab.patterns elements
    processAllPatternsRecursive(pattern_assembler, patterns_dir, patternlab);
    patternlab.footer = patternlab.footer.replace(
      '\u0002# lineageR }} = \u0002{ lineageR }}}\u0002/ lineageR }}',
      '{{# lineageR }} = {{{ lineageR }}}{{/ lineageR }}'
    );

    for (var i = 0; i < patternlab.patterns.length; i++) {
      var pattern = patternlab.patterns[i];

      // skip unprocessed patterns
      if (!pattern.footer) { continue; }

      // set the pattern-specific footer by compiling the general-footer with data and then adding it to the meta footer
      var footerHTML = pattern.footer.replace(
        '\u0002# lineageR }} = \u0002{ lineageR }}}\u0002/ lineageR }}',
        '{{# lineageR }} = {{{ lineageR }}}{{/ lineageR }}'
      );
      footerHTML = engine.renderPattern(footerHTML, {lineageR: JSON.stringify(pattern.patternLineagesR)});

      fs.appendFileSync(path.resolve(paths.public.patterns, pattern.patternLink), footerHTML);
    }

    // export patterns if necessary
    pattern_exporter.exportPatterns(patternlab);
  }

  return {
    version: function () {
      return getVersion();
    },
    build: function (callback = () => {}, cleanPublic = false) {
      buildPatterns(cleanPublic);
      return buildFrontend(patternlab, printDebug, callback);
    },
    buildFrontend: function (patternlab_ = patternlab, callback = () => {}) {
      return buildFrontend(patternlab_, printDebug, callback);
    },
    buildPatternData: function (dataFilesPathParam) {
      return buildPatternData(dataFilesPathParam);
    },
    buildViewAll: function (patternlab_) {
      buildViewAll(patternlab_);
    },
    compileUi: function () {
      var componentizer = new (require('../styleguide/componentizer'))(patternlab);
      return componentizer.main(true);
    },
    help: function () {
      help();
    },
    patternsonly: function (callback = () => {}, cleanPublic = false) {
      buildPatterns(cleanPublic);
      printDebug();
      callback();
    },
    liststarterkits: function () {
      return listStarterkits();
    },
    loadstarterkit: function (starterkitName, clean) {
      loadStarterKit(starterkitName, clean);
    },
    processAllPatternsIterative: function (pattern_assembler, patterns_dir, patternlab_) {
      processAllPatternsIterative(pattern_assembler, patterns_dir, patternlab_);
    }
  };
};

module.exports = patternlab_engine;
