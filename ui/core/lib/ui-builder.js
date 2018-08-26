'use strict';

const eol = require('os').EOL;
const path = require('path');

const diveSync = require('diveSync');
const Feplet = require('feplet');
const fs = require('fs-extra');

const frontMatterParser = require('./front-matter-parser');
const objectFactory = require('./object-factory');

module.exports = class {
  constructor(patternlab) {
    this.patternlab = patternlab;
  }

  // PRIVATE METHODS

  addToPatternPaths(pattern) {
    if (!this.patternlab.patternPaths[pattern.patternGroup]) {
      this.patternlab.patternPaths[pattern.patternGroup] = {};
    }
    this.patternlab.patternPaths[pattern.patternGroup][pattern.patternBaseName] = pattern.name;
  }

  isPatternExcluded(pattern) {
    // Returns whether the 1st character of pattern type, subType, further nested dirs, or filename is an underscore.
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
  assembleStyleguidePatterns() {
    const styleguideExcludes = this.patternlab.config.styleGuideExcludes;
    const styleguidePatterns = [];

    let prevSubdir = '';
    let prevGroup = '';

    for (let i = 0, l = this.patternlab.patterns.length; i < l; i++) {
      const pattern = this.patternlab.patterns[i];

      // Skip underscore-prefixed files.
      if (this.isPatternExcluded(pattern)) {
        if (this.patternlab.config.debug) {
          this.patternlab.utils.log('Omitting ' + pattern.patternPartial + ' from styleguide pattern exclusion.');
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

          for (let j in this.patternlab.subTypePatterns) {
            if (!this.patternlab.subTypePatterns.hasOwnProperty(j)) {
              continue;
            }

            if (this.patternlab.subTypePatterns[j].patternGroup === pattern.patternGroup) {
              styleguidePatterns.push(this.patternlab.subTypePatterns[j]);
              break;
            }
          }
        }
        else if (pattern.subdir !== prevSubdir && pattern.patternGroup !== pattern.patternSubGroup) {
          prevSubdir = pattern.subdir;

          for (let j in this.patternlab.subTypePatterns) {
            if (!this.patternlab.subTypePatterns.hasOwnProperty(j)) {
              continue;
            }

            if (this.patternlab.subTypePatterns[j].subdir === pattern.subdir) {
              for (let k = 0, l = styleguidePatterns.length; k < l; k++) {
                if (styleguidePatterns[k].patternPartial === this.patternlab.subTypePatterns[j].patternPartial) {
                  viewallFound = true;
                  break;
                }
              }

              if (!viewallFound) {
                styleguidePatterns.push(this.patternlab.subTypePatterns[j]);
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

  buildNavigation() {
    let patternTypeIndex;

    for (let i = 0, l = this.patternlab.patterns.length; i < l; i++) {
      const pattern = this.patternlab.patterns[i];

      let flatPatternItem;
      let patternSubType;
      let patternSubTypeItem;
      let patternSubTypeItemName;
      let patternSubTypeName;
      let patternType;

      // Check if the patternType already exists.
      patternTypeIndex = this.patternlab.patternTypeIndex.indexOf(pattern.patternGroup);

      if (patternTypeIndex === -1) {
        // Add the patternType.
        patternType = new objectFactory.PatternType(pattern.patternGroup);

        // Add the patternType.
        this.patternlab.patternTypes.push(patternType);
        this.patternlab.patternTypeIndex.push(pattern.patternGroup);

        // Create a property for this group in this.patternlab.viewallPaths. The viewall property needs to be first.
        this.patternlab.viewallPaths[pattern.patternGroup] = {viewall: ''};
      }
      else {
        // Else find the patternType.
        patternType = this.patternlab.patternTypes[patternTypeIndex];
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

      const isExcluded = this.isPatternExcluded(pattern);

      if (!isExcluded) {
        // Add to patternPaths.
        this.addToPatternPaths(pattern);

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
        (
          !this.patternlab.patterns[i + 1] ||
          pattern.patternSubGroup !== this.patternlab.patterns[i + 1].patternSubGroup
        )
      ) {
        // Add the viewall SubTypeItem.
        const viewallPatternSubTypeItem = new objectFactory.PatternSubTypeItem('View All');
        viewallPatternSubTypeItem.patternPath = `${pattern.flatPatternPath}/index.html`;
        viewallPatternSubTypeItem.patternPartial = `viewall-${pattern.patternGroup}-${pattern.patternSubGroup}`;

        if (patternSubType) {
          patternSubType.patternSubTypeItems.push(viewallPatternSubTypeItem);
          patternSubType.patternSubTypeItemsIndex.push('View All');
        }

        this.patternlab.viewallPaths[pattern.patternGroup][pattern.patternSubGroup] = pattern.flatPatternPath;
      }

      // Check if we are moving to a new group in the next loop.
      if (!this.patternlab.patterns[i + 1] || pattern.patternGroup !== this.patternlab.patterns[i + 1].patternGroup) {
        // Add the viewall TypeItem.
        const flatPatternPath = pattern.subdir.slice(
          0, pattern.subdir.indexOf(pattern.patternGroup) + pattern.patternGroup.length
        );
        const viewallPatternItem = new objectFactory.PatternSubTypeItem('View All');

        viewallPatternItem.patternPath = `${flatPatternPath}/index.html`;
        viewallPatternItem.patternPartial = `viewall-${pattern.patternGroup}`;
        patternType.patternItems.push(viewallPatternItem);
        this.patternlab.viewallPaths[pattern.patternGroup].viewall = flatPatternPath;
      }
    }

    return patternTypeIndex;
  }

  buildFooterHtml(patternPartial) {
    // Set the pattern-specific footer by compiling the general-footer with data, and then adding it to the meta footer.
    const patternPartialJson = patternPartial ? JSON.stringify({patternPartial: patternPartial}) : '{}';
    const footerPartial = Feplet.render(this.patternlab.footer, {
      patternData: patternPartialJson,
      cacheBuster: this.patternlab.cacheBuster
    });
    const footerHtml = Feplet.render(this.patternlab.userFoot, {
      patternLabFoot: footerPartial,
      cacheBuster: this.patternlab.cacheBuster
    });

    return footerHtml;
  }

  insertPatternSubTypeDocumentationPattern(patterns, patternPartial) {
    // Attempt to find a subType pattern before rendering.
    let subTypePattern = this.patternlab.subTypePatterns[patternPartial];

    if (subTypePattern) {
      patterns.unshift(subTypePattern);
    }
    else {
      for (let i = 0, l = patterns.length; i < l; i++) {
        if (patternPartial === 'viewall-elements') {
          subTypePattern = this.patternlab.subTypePatterns[
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

  buildViewAllHtml(patterns, patternPartial) {
    const patternsPlusSubType = this.insertPatternSubTypeDocumentationPattern(patterns, patternPartial);
    const viewallHtml = Feplet.render(
      this.patternlab.viewall,
      {
        partials: patternsPlusSubType,
        patternPartial: patternPartial,
        cacheBuster: this.patternlab.cacheBuster
      },
      {
        patternSection: this.patternlab.patternSection,
        patternSectionSubType: this.patternlab.patternSectionSubType
      }
    );

    return viewallHtml;
  }

  buildViewAllPages(mainPageHeadHtml, styleguidePatterns) {
    const paths = this.patternlab.config.paths;

    let prevSubdir = '';
    let prevGroup = '';

    for (let i = 0, l = styleguidePatterns.length; i < l; i++) {
      const pattern = styleguidePatterns[i];

      // Skip underscore-prefixed files.
      if (this.isPatternExcluded(pattern)) {
        if (this.patternlab.config.debug) {
          this.patternlab.utils.log('Omitting ' + pattern.patternPartial + ' from view all rendering.');
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
            if (this.isPatternExcluded(styleguidePatterns[j])) {
              if (this.patternlab.config.debug) {
                this.patternlab.utils.log('Omitting ' + styleguidePatterns[j].patternPartial +
                  ' from view all sibling rendering.');
              }

              continue;
            }

            viewallPatterns.push(styleguidePatterns[j]);
          }
        }

        // Render the footer needed for the viewall template.
        footerHtml = this.buildFooterHtml(patternPartial);

        // Render the viewall template.
        const viewallOutfile = paths.public.patterns + '/' +
          pattern.subdir.slice(0, pattern.subdir.indexOf(pattern.patternGroup) + pattern.patternGroup.length) + '/' +
          'index.html';
        viewallHtml = this.buildViewAllHtml(viewallPatterns, patternPartial);

        fs.outputFileSync(viewallOutfile, mainPageHeadHtml + viewallHtml + footerHtml);
      }

      // Create the view all for the subsection. Check if the current sub section is different from the previous one.
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
            if (this.isPatternExcluded(styleguidePatterns[j])) {
              if (this.patternlab.config.debug) {
                this.patternlab.utils.log('Omitting ' + styleguidePatterns[j].patternPartial +
                  ' from view all sibling rendering.');
              }

              continue;
            }

            viewallPatterns.push(styleguidePatterns[j]);
          }
        }

        // Render the footer needed for the viewall template.
        footerHtml = this.buildFooterHtml(patternPartial);

        // Render the viewall template.
        const viewallOutfile = `${paths.public.patterns}/${pattern.flatPatternPath}/index.html`;
        viewallHtml = this.buildViewAllHtml(viewallPatterns, patternPartial);

        fs.outputFileSync(viewallOutfile, mainPageHeadHtml + viewallHtml + footerHtml);
      }
    }
  }

  // PUBLIC METHOD

  main() {
    const paths = this.patternlab.config.paths;

    let styleguidePatterns = [];

    this.patternlab.patternTypes = [];
    this.patternlab.patternTypeIndex = [];
    this.patternlab.patternPaths = {};
    this.patternlab.viewallPaths = {};
    this.patternlab.data.cacheBuster = this.patternlab.cacheBuster;

    // Check if patterns are excluded, if not add them to styleguidePatterns.
    styleguidePatterns = this.assembleStyleguidePatterns();

    // Set the pattern-specific header by compiling the general-header with data, then adding it to the meta header.
    let headerHtml = this.patternlab.userHead.replace('{{{ patternLabHead }}}', this.patternlab.header);
    headerHtml = Feplet.render(headerHtml, this.patternlab.data);

    // Set the pattern-specific footer by compiling the general-footer with data, then adding it to the meta footer.
    const footerHtml = this.buildFooterHtml(null);

    // Build the styleguide.
    const styleguideHtml = Feplet.render(
      this.patternlab.viewall,
      {
        partials: styleguidePatterns,
        cacheBuster: this.patternlab.cacheBuster
      },
      {
        patternSection: this.patternlab.patternSection,
        patternSectionSubType: this.patternlab.patternSectionSubType
      }
    );

    fs.outputFileSync(`${paths.public.styleguide}/styleguide.html`, headerHtml + styleguideHtml + footerHtml);

    // Build the viewall pages.
    this.buildViewAllPages(headerHtml, styleguidePatterns);

    // Build the patternlab website.
    this.buildNavigation();

    // Move the index file from its asset location into public root.
    let patternlabSiteHtml;

    // this.patternlab.config.paths.source.styleguide is not publicly documented and only configurable for testing.
    // Configure it in ui/test/patternlab-config.json.
    let styleguideDir =
      this.patternlab.config.paths.source.styleguide || `${this.patternlab.config.paths.core}/styleguide`;

    try {
      patternlabSiteHtml = fs.readFileSync(`${styleguideDir}/index.mustache`, this.patternlab.enc);
    }
    catch (err) {
      this.patternlab.utils.error(err);
      this.patternlab.utils.error('Run `fp ui:compile` to fix this.');
    }

    fs.outputFileSync(`${paths.public.root}/index.html`, patternlabSiteHtml);

    // Write out the data.
    let output = '';
    output += 'window.config = ' + JSON.stringify(this.patternlab.config) + ';\n';
    output += 'window.ishControls = {"ishControlsHide":' + JSON.stringify(this.patternlab.config.ishControlsHide) +
      '};' + eol;
    output += 'window.navItems = {"patternTypes": ' + JSON.stringify(this.patternlab.patternTypes) + '};' + eol;
    output += 'window.patternPaths = ' + JSON.stringify(this.patternlab.patternPaths) + ';' + eol;
    output += 'window.viewallPaths = ' + JSON.stringify(this.patternlab.viewallPaths) + ';' + eol;
    output += 'window.plugins = [];' + eol;
    output += 'window.defaultShowPatternInfo = ';
    output += (this.patternlab.config.defaultShowPatternInfo ? this.patternlab.config.defaultShowPatternInfo :
      'false') + ';' + eol;
    output += 'window.defaultPattern = "' + (this.patternlab.config.defaultPattern ?
      this.patternlab.config.defaultPattern : 'all');
    output += '";' + eol;

    // Write all output to patternlab-data.
    fs.outputFileSync(`${paths.public.data}/patternlab-data.js`, output);

    // Gather annotations and write them to annotations.js.
    let annotationsArr = [];

    // Gather what's in the annotations directory.
    diveSync(
      paths.source.annotations,
      (err, file) => {
        // Log any errors.
        if (err) {
          this.patternlab.utils.error(err);
          return;
        }

        const ext = path.extname(file);

        if (ext === this.patternlab.config.frontMatterExtension || ext === '.md') {
          const fileContent = fs.readFileSync(file, this.patternlab.enc);
          annotationsArr = annotationsArr.concat(frontMatterParser.main(fileContent));
        }
      }
    );

    // Gather what's been parsed in the patterns directory.
    for (let i = 0, l = this.patternlab.patterns.length; i < l; i++) {
      const pattern = this.patternlab.patterns[i];

      if (pattern.isFrontMatter && Array.isArray(pattern.frontMatterData)) {
        annotationsArr = annotationsArr.concat(pattern.frontMatterData);
      }
    }

    // Writing non-strict js so it can be tested in Node.
    const annotationsNew = 'comments=' + JSON.stringify(annotationsArr) + ';';

    // In order to improve browser LiveReload performance, only write annotationsFile if there are changes.
    const annotationsFile = `${paths.public.annotations}/annotations.js`;
    let annotationsOld = '';

    if (fs.existsSync(annotationsFile)) {
      annotationsOld = fs.readFileSync(annotationsFile, this.patternlab.enc);
    }

    if (annotationsNew !== annotationsOld) {
      fs.outputFileSync(annotationsFile, annotationsNew);
    }

    // Log memory usage when debug === true.
    if (this.patternlab.config.debug) {
      const used = process.memoryUsage().heapUsed / 1024 / 1024;

      this.patternlab.utils.log(`The full build used approximately ${Math.round(used * 100) / 100} MB`);
    }
  }
};
