'use strict';

const path = require('path');

const Feplet = require('feplet');
const fs = require('fs-extra');

const annotationExporter = require('./annotation-exporter');
const objectFactory = require('./object-factory');
const eol = require('os').EOL;

// PRIVATE FUNCTIONS

function addToPatternPaths(patternlab, pattern) {
  if (!patternlab.patternPaths[pattern.patternGroup]) {
    patternlab.patternPaths[pattern.patternGroup] = {};
  }
  patternlab.patternPaths[pattern.patternGroup][pattern.patternBaseName] = pattern.name;
}

function isPatternExcluded(pattern) {
  // Returns whether the 1st character of the pattern type, subType, further nested dirs, or filename is an underscore.
  if (pattern.isPattern) {
    if (
      pattern.relPath.charAt(0) === '_' ||
      pattern.relPath.indexOf('/_') > -1
    ) {
      return true;
    }
  }
  return false;
}

// Returns the array of patterns to be rendered in the styleguide view and linked to in the pattern navigation.
// Checks if patterns are excluded.
function assembleStyleguidePatterns(patternlab) {
  const styleguideExcludes = patternlab.config.styleGuideExcludes;
  const styleguidePatterns = [];

  let prevSubdir = '';
  let prevGroup = '';

  for (let i = 0, l = patternlab.patterns.length; i < l; i++) {
    const pattern = patternlab.patterns[i];

    // Skip underscore-prefixed files.
    if (isPatternExcluded(pattern)) {
      if (patternlab.config.debug) {
        console.log('Omitting ' + pattern.patternPartial + ' from styleguide pattern exclusion.');
      }
      continue;
    }

    let isExcluded = false;
    if (Array.isArray(styleguideExcludes) && styleguideExcludes.length) {
      const partial = pattern.patternPartial;
      const partialType = partial.substring(0, partial.indexOf('-'));
      isExcluded = (styleguideExcludes.indexOf(partialType) > -1);
    }

    if (!isExcluded) {
      let viewallFound = false;

      if (pattern.patternGroup !== prevGroup) {
        prevGroup = pattern.patternGroup;

        for (let j in patternlab.subTypePatterns) {
          if (!patternlab.subTypePatterns.hasOwnProperty(j)) {
            continue;
          }

          if (patternlab.subTypePatterns[j].patternGroup === pattern.patternGroup) {
            styleguidePatterns.push(patternlab.subTypePatterns[j]);
            break;
          }
        }
      } else if (pattern.subdir !== prevSubdir && pattern.patternGroup !== pattern.patternSubGroup) {
        prevSubdir = pattern.subdir;

        for (let j in patternlab.subTypePatterns) {
          if (!patternlab.subTypePatterns.hasOwnProperty(j)) {
            continue;
          }

          if (patternlab.subTypePatterns[j].subdir === pattern.subdir) {
            for (let k = 0, l = styleguidePatterns.length; k < l; k++) {
              if (styleguidePatterns[k].patternPartial === patternlab.subTypePatterns[j].patternPartial) {
                viewallFound = true;
                break;
              }
            }

            if (!viewallFound) {
              styleguidePatterns.push(patternlab.subTypePatterns[j]);
              break;
            }
          }
        }
      }

      styleguidePatterns.push(pattern);
    }
  }
  return styleguidePatterns;
}

function buildNavigation(patternlab) {
  let patternTypeIndex;

  for (let i = 0, l = patternlab.patterns.length; i < l; i++) {
    const pattern = patternlab.patterns[i];

    let flatPatternItem;
    let patternSubType;
    let patternSubTypeItem;
    let patternSubTypeItemName;
    let patternSubTypeName;
    let patternType;
    let viewallPatternSubTypeItem;

    // Check if the patternType already exists.
    patternTypeIndex = patternlab.patternTypeIndex.indexOf(pattern.patternGroup);

    if (patternTypeIndex === -1) {
      // Add the patternType.
      patternType = new objectFactory.PatternType(pattern.patternGroup);

      // Add the patternType.
      patternlab.patternTypes.push(patternType);
      patternlab.patternTypeIndex.push(pattern.patternGroup);

      // Create a property for this group in the patternlab.viewallPaths array. The viewall property needs to be first.
      patternlab.viewallPaths[pattern.patternGroup] = {viewall: ''};
    }
    else {
      // Else find the patternType.
      patternType = patternlab.patternTypes[patternTypeIndex];
    }

    // Get the patternSubType.
    // If there is one or more slashes in the subdir, get everything after the last slash.
    // If no slash, get the whole subdir string and strip any numeric + hyphen prefix.
    patternSubTypeName = pattern.subdir.split('/').pop().replace(/^\d*\-/, '');

    // Get the patternSubTypeItem.
    patternSubTypeItemName = pattern.patternName.replace(/[\-~]/g, ' ');

    // Assume the patternSubTypeItem does not exist.
    patternSubTypeItem = new objectFactory.PatternSubTypeItem(patternSubTypeItemName);
    patternSubTypeItem.patternPath = pattern.patternLink;
    patternSubTypeItem.patternPartial = pattern.patternPartial;

    const isExcluded = isPatternExcluded(pattern);

    if (!isExcluded) {
      // Add to patternPaths.
      addToPatternPaths(patternlab, pattern);

      // Add the patternState if it exists.
      if (pattern.patternState) {
        patternSubTypeItem.patternState = pattern.patternState;
      }

      // Test whether the pattern structure is flat or not - usually due to a template or page.
      flatPatternItem = patternSubTypeName === pattern.patternGroup;
    }

    // Need to define patternTypeItemsIndex and patternSubType whether or not excluded.
    const patternTypeItemsIndex = patternType.patternTypeItemsIndex.indexOf(patternSubTypeName);

    if (patternTypeItemsIndex === -1) {
      patternSubType = new objectFactory.PatternSubType(patternSubTypeName);
    }

    if (!isExcluded) {
      // If it is flat, we should not add the pattern to patternPaths.
      if (flatPatternItem) {
        // Add the patternSubType to patternItems.
        patternType.patternItems.push(patternSubTypeItem);
      }
      else {
        // Check again whether the patternSubType exists.
        if (patternTypeItemsIndex === -1) {
          // Add the patternSubType and patternSubTypeItem.
          patternSubType.patternSubTypeItems.push(patternSubTypeItem);
          patternSubType.patternSubTypeItemsIndex.push(patternSubTypeItemName);
          patternType.patternTypeItems.push(patternSubType);
          patternType.patternTypeItemsIndex.push(patternSubTypeName);
        }
        else {
          // Add the patternSubTypeItem.
          patternSubType = patternType.patternTypeItems[patternTypeItemsIndex];
          patternSubType.patternSubTypeItems.push(patternSubTypeItem);
          patternSubType.patternSubTypeItemsIndex.push(patternSubTypeItemName);
        }
      }
    }

    // Check if we are moving to a new subgroup in the next loop.
    if (
      pattern.patternGroup !== pattern.patternSubGroup &&
      (!patternlab.patterns[i + 1] || pattern.patternSubGroup !== patternlab.patterns[i + 1].patternSubGroup)
    ) {
      // Add the viewall SubTypeItem.
      const viewallPatternSubTypeItem = new objectFactory.PatternSubTypeItem('View All');
      viewallPatternSubTypeItem.patternPath = pattern.flatPatternPath + '/index.html';
      viewallPatternSubTypeItem.patternPartial = 'viewall-' + pattern.patternGroup + '-' + pattern.patternSubGroup;

      if (patternSubType) {
        patternSubType.patternSubTypeItems.push(viewallPatternSubTypeItem);
        patternSubType.patternSubTypeItemsIndex.push('View All');
      }

      patternlab.viewallPaths[pattern.patternGroup][pattern.patternSubGroup] = pattern.flatPatternPath;
    }

    // Check if we are moving to a new group in the next loop.
    if (!patternlab.patterns[i + 1] || pattern.patternGroup !== patternlab.patterns[i + 1].patternGroup) {
      // Add the viewall TypeItem.
      const flatPatternPath = pattern.subdir.slice(
        0, pattern.subdir.indexOf(pattern.patternGroup) + pattern.patternGroup.length
      );
      const viewallPatternItem = new objectFactory.PatternSubTypeItem('View All');

      viewallPatternItem.patternPath = flatPatternPath + '/index.html';
      viewallPatternItem.patternPartial = 'viewall-' + pattern.patternGroup;
      patternType.patternItems.push(viewallPatternItem);
      patternlab.viewallPaths[pattern.patternGroup].viewall = flatPatternPath;
    }
  }

  return patternTypeIndex;
}

function buildFooterHtml(patternlab, patternPartial) {
  // Set the pattern-specific footer by compiling the general-footer with data, and then adding it to the meta footer.
  const patternPartialJson = patternPartial ? JSON.stringify({patternPartial: patternPartial}) : '{}';
  const footerPartial = Feplet.render(patternlab.footer, {
    patternData: patternPartialJson,
    cacheBuster: patternlab.cacheBuster
  });
  const footerHtml = Feplet.render(patternlab.userFoot, {
    patternLabFoot : footerPartial,
    cacheBuster: patternlab.cacheBuster
  });

  return footerHtml;
}

function insertPatternSubTypeDocumentationPattern(patternlab, patterns, patternPartial) {
  // Attempt to find a subType pattern before rendering.
  let subTypePattern = patternlab.subTypePatterns[patternPartial];

  if (subTypePattern) {
    patterns.unshift(subTypePattern);
  }
  else {
    for (let i = 0, l = patterns.length; i < l; i++) {
      if (patternPartial === 'viewall-elements') {
        subTypePattern = patternlab.subTypePatterns[
          'viewall-' + patterns[i].patternGroup + '-' + patterns[i].patternSubGroup
        ];

        let viewallExists = false;

        for (let j = 0; j < l; j++) {
          if (
            patterns[j].patternPartial === 'viewall-' + patterns[i].patternGroup + '-' + patterns[i].patternSubGroup
          ) {
            viewallExists = true;
          }
        }

        if (viewallExists) {
          continue;
        }

        if (subTypePattern) {
          patterns.splice(i, 0, subTypePattern);
        }
      }
    }
  }

  return patterns;
}

function buildViewAllHtml(patternlab, patterns, patternPartial) {
  const patternsPlusSubType = insertPatternSubTypeDocumentationPattern(patternlab, patterns, patternPartial);
  const viewallHtml = Feplet.render(
    patternlab.viewall,
    {
      partials: patternsPlusSubType,
      patternPartial: patternPartial,
      cacheBuster: patternlab.cacheBuster
    },
    {
      patternSection: patternlab.patternSection,
      patternSectionSubType: patternlab.patternSectionSubType
    }
  );

  return viewallHtml;
}

function buildViewAllPages(mainPageHeadHtml, patternlab, styleguidePatterns) {
  const paths = patternlab.config.paths;

  let prevSubdir = '';
  let prevGroup = '';

  for (let i = 0, l = styleguidePatterns.length; i < l; i++) {
    const pattern = styleguidePatterns[i];

    // Skip underscore-prefixed files.
    if (isPatternExcluded(pattern)) {
      if (patternlab.config.debug) {
        console.log('Omitting ' + pattern.patternPartial + ' from view all rendering.');
      }

      continue;
    }

    let viewallPatterns;
    let patternPartial;
    let footerHtml;
    let viewallHtml;

    // Create the view all for the section. Check if the current section is different from the previous one
    if (pattern.patternGroup !== prevGroup) {
      prevGroup = pattern.patternGroup;
      viewallPatterns = [];
      patternPartial = 'viewall-' + pattern.patternGroup;

      for (let j = 0; j < l; j++) {
        if (
          styleguidePatterns[j].patternGroup === pattern.patternGroup &&
          styleguidePatterns[j].patternPartial !== patternPartial
        ) {

          // Again, skip any sibling patterns to the current one that may have underscores.
          if (isPatternExcluded(styleguidePatterns[j])) {
            if (patternlab.config.debug) {
              console.log('Omitting ' + styleguidePatterns[j].patternPartial + ' from view all sibling rendering.');
            }

            continue;
          }

          viewallPatterns.push(styleguidePatterns[j]);
        }
      }

      // Render the footer needed for the viewall template.
      footerHtml = buildFooterHtml(patternlab, patternPartial);

      // Render the viewall template.
      viewallHtml = buildViewAllHtml(patternlab, viewallPatterns, patternPartial);
      fs.outputFileSync(
        path.resolve(
          paths.public.patterns,
          pattern.subdir.slice(0, pattern.subdir.indexOf(pattern.patternGroup) + pattern.patternGroup.length),
          'index.html'
        ),
        mainPageHeadHtml + viewallHtml + footerHtml
      );

    // Create the view all for the subsection. Check if the current sub section is different from the previous one.
    }
    else if (pattern.subdir !== prevSubdir && pattern.patternGroup !== pattern.patternSubGroup) {
      prevSubdir = pattern.subdir;
      viewallPatterns = [];
      patternPartial = 'viewall-' + pattern.patternGroup + '-' + pattern.patternSubGroup;

      for (let j = 0; j < l; j++) {
        if (
          styleguidePatterns[j].subdir === pattern.subdir &&
          styleguidePatterns[j].patternPartial !== patternPartial
        ) {

          // Again, skip any sibling patterns to the current one that may have underscores.
          if (isPatternExcluded(styleguidePatterns[j])) {
            if (patternlab.config.debug) {
              console.log('Omitting ' + styleguidePatterns[j].patternPartial + ' from view all sibling rendering.');
            }

            continue;
          }

          viewallPatterns.push(styleguidePatterns[j]);
        }
      }

      // Render the footer needed for the viewall template.
      footerHtml = buildFooterHtml(patternlab, patternPartial);

      // Render the viewall template.
      viewallHtml = buildViewAllHtml(patternlab, viewallPatterns, patternPartial);

      fs.outputFileSync(
        path.resolve(
          paths.public.patterns,
          pattern.flatPatternPath,
          'index.html'
        ),
        mainPageHeadHtml + viewallHtml + footerHtml
      );
    }
  }
}

// EXPORTED FUNCTION

module.exports = function (patternlab) {
  const paths = patternlab.config.paths;

  let styleguidePatterns = [];

  patternlab.patternTypes = [];
  patternlab.patternTypeIndex = [];
  patternlab.patternPaths = {};
  patternlab.viewallPaths = {};
  patternlab.data.cacheBuster = patternlab.cacheBuster;

  // Check if patterns are excluded, if not add them to styleguidePatterns.
  styleguidePatterns = assembleStyleguidePatterns(patternlab);

  // Set the pattern-specific header by compiling the general-header with data, then adding it to the meta header.
  let headerHtml = patternlab.userHead.replace('{{{ patternLabHead }}}', patternlab.header);
  headerHtml = Feplet.render(headerHtml, patternlab.data);

  // Set the pattern-specific footer by compiling the general-footer with data, then adding it to the meta footer.
  const footerHtml = buildFooterHtml(patternlab, null);

  // Build the styleguide.
  const styleguideHtml = Feplet.render(
    patternlab.viewall,
    {
      partials: styleguidePatterns,
      cacheBuster: patternlab.cacheBuster
    },
    {
      patternSection: patternlab.patternSection,
      patternSectionSubType: patternlab.patternSectionSubType
    }
  );

  fs.outputFileSync(
    path.resolve(paths.public.styleguide, 'styleguide.html'),
    headerHtml + styleguideHtml + footerHtml
  );

  // Build the viewall pages.
  buildViewAllPages(headerHtml, patternlab, styleguidePatterns);

  // Build the patternlab website.
  buildNavigation(patternlab);

  // Move the index file from its asset location into public root.
  let patternlabSiteHtml;

  try {
    patternlabSiteHtml = fs.readFileSync(
      path.resolve(__dirname, '../styleguide', 'index.mustache'),
      patternlab.enc
    );
  }
  catch (err) {
    reject(err);
  }

  fs.outputFileSync(path.resolve(paths.public.root, 'index.html'), patternlabSiteHtml);

  // Write out the data.
  let output = '';
  output += 'var config = ' + JSON.stringify(patternlab.config) + ';\n';
  output += 'var ishControls = {"ishControlsHide":' + JSON.stringify(patternlab.config.ishControlsHide) + '};' + eol;
  output += 'var navItems = {"patternTypes": ' + JSON.stringify(patternlab.patternTypes) + '};' + eol;
  output += 'var patternPaths = ' + JSON.stringify(patternlab.patternPaths) + ';' + eol;
  output += 'var viewallPaths = ' + JSON.stringify(patternlab.viewallPaths) + ';' + eol;
  output += 'var plugins = [];' + eol;
  output += 'var defaultShowPatternInfo = ';
  output += (patternlab.config.defaultShowPatternInfo ? patternlab.config.defaultShowPatternInfo : 'false') + ';' + eol;
  output += 'var defaultPattern = "' + (patternlab.config.defaultPattern ? patternlab.config.defaultPattern : 'all');
  output += '";' + eol;

  // Write all output to patternlab-data.
  fs.outputFileSync(path.resolve(paths.public.data, 'patternlab-data.js'), output);

  const annotationsJson = annotationExporter.gather(patternlab);
  const annotations = 'var comments = { "comments" : ' + JSON.stringify(annotationsJson) + '};';

  fs.outputFileSync(path.resolve(paths.public.annotations, 'annotations.js'), annotations);

  // Log memory usage when debug === true.
  if (patternlab.config.debug) {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;

    console.log(`The full build used approximately ${Math.round(used * 100) / 100} MB`);
  }
};
