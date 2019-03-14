'use strict';

const Feplet = require('feplet');
const fs = require('fs-extra');

const objectFactory = require('./object-factory');

module.exports = class {
  constructor(patternlab) {
    this.patternlab = patternlab;
    this.isViewallValid = false;
    this.pathsPublic = patternlab.config.pathsPublic;
    this.patternSection = '';
    this.patternSectionSubType = '';
    this.patternSectionType = '';
    this.public = patternlab.config.paths.public;
    this.source = patternlab.config.paths.source;
    this.utils = patternlab.utils;
    this.viewallPageHead = '';
    this.viewallPaths = {};
    this.viewallPatterns = patternlab.viewallPatterns;
    this.viewallTemplateFull = '';
    this.viewallTemplateHead = '';
    this.viewallTemplateBody = '';
    this.viewallTemplateFoot = '';
  }

  addToPatternPaths(pattern) {
    this.patternlab.patternPaths[pattern.patternPartial] =
      `${this.pathsPublic.patterns}/${pattern.name}/${pattern.name}.html`;
  }

  buildViewallTypeHead(patternType, patternSubType) {
    const viewallTypeHead = Feplet.render(
      this.viewallTemplateBody,
      patternType,
      {
        patternSectionType: this.patternSectionType
      }
    );

    this.viewallPatterns.viewall.content += viewallTypeHead;
    this.viewallPatterns[patternType.flatPatternPath].content += viewallTypeHead;

    if (patternSubType) {
      this.viewallPatterns[patternSubType.flatPatternPath].content += viewallTypeHead;
    }
  }

  buildViewallTypeBody(patternTypeItem, patternType) {
    const viewallTypeBody = Feplet.render(
      this.viewallTemplateBody,
      patternTypeItem,
      {
        patternSection: this.patternSection
      }
    );

    this.viewallPatterns.viewall.content += viewallTypeBody;
    this.viewallPatterns[patternType.flatPatternPath].content += viewallTypeBody;
  }

  buildViewallSubTypeHead(patternSubType, patternType) {
    const viewallSubTypeHead = Feplet.render(
      this.viewallTemplateBody,
      patternSubType,
      {
        patternSectionSubType: this.patternSectionSubType
      }
    );

    this.viewallPatterns.viewall.content += viewallSubTypeHead;
    this.viewallPatterns[patternType.flatPatternPath].content += viewallSubTypeHead;
    this.viewallPatterns[patternSubType.flatPatternPath].content += viewallSubTypeHead;
  }

  buildViewallSubTypeBody(patternSubTypeItem, patternSubType, patternType) {
    const viewallSubTypeBody = Feplet.render(
      this.viewallTemplateBody,
      patternSubTypeItem,
      {
        patternSection: this.patternSection
      }
    );

    this.viewallPatterns.viewall.content += viewallSubTypeBody;
    this.viewallPatterns[patternType.flatPatternPath].content += viewallSubTypeBody;
    this.viewallPatterns[patternSubType.flatPatternPath].content += viewallSubTypeBody;
  }

  buildViewallFooter(patternPartial, name) {
    const viewallFooter = Feplet.render(
      this.patternlab.footer,
      {
        patternData: JSON.stringify({patternPartial}),
        portReloader: this.patternlab.portReloader,
        portServer: this.patternlab.portServer
      }
    );

    let userFoot = '';

    for (let i = 0, l = this.patternlab.userFootSplit.length; i < l; i++) {
      if (i > 0) {
        userFoot += viewallFooter;
      }

      userFoot += this.patternlab.userFootSplit[i];
    }

    this.viewallPatterns[name].content += this.viewallTemplateFoot + userFoot;
  }

  preParseViewallMarkup() {
    const viewallSplit = this.viewallTemplateFull.split(/\{\{[#\/]\s*partials\s*\}\}/);

    if (viewallSplit.length < 3) {
      this.utils.error('The "partials" list in viewall.mustache must have valid opening and closing tags!');
    }
    else if (viewallSplit.length > 3) {
      this.utils.error('There can be only one "partials" list in viewall.mustache!');
    }
    else {
      this.viewallTemplateHead = viewallSplit[0];
      this.viewallTemplateBody = viewallSplit[1];
      this.viewallTemplateFoot = viewallSplit[2];
    }

    this.isViewallValid = (viewallSplit.length === 3);
  }

  processViewallData() {
    this.patternlab.patternTypes = [];
    this.patternlab.patternTypesIndex = [];

    for (let i = 0; i < this.patternlab.patterns.length; i++) {
      let j;
      const pattern = this.patternlab.patterns[i];

      // Non-pattern files (like .md) files are not assigned a patternPartial. We can safely skip those.
      if (!pattern.patternPartial) {
        continue;
      }

      if (!pattern.isHidden) {
        this.addToPatternPaths(pattern);
      }

      let patternSubType;
      let patternType;

      // Check if the patternType is already indexed.
      const patternTypesIndex = this.patternlab.patternTypesIndex.indexOf(pattern.patternType);

      // Create and add patternType if not already indexed.
      if (patternTypesIndex === -1) {
        patternType = new objectFactory.PatternType(pattern);

        this.patternlab.patternTypes.push(patternType);
        this.patternlab.patternTypesIndex.push(pattern.patternType);

        // Create a property for this type in this.viewallPaths. The viewall property needs to be first.
        this.viewallPaths[pattern.patternType] = {viewall: ''};
      }
      else {
        patternType = this.patternlab.patternTypes[patternTypesIndex];
      }

      if (pattern.patternSubType) {
        // Check if the patternSubType is already indexed.
        const patternSubTypesIndex = patternType.patternSubTypesIndex.indexOf(pattern.patternSubType);

        // Create and add patternSubType if not already indexed.
        if (patternSubTypesIndex === -1) {
          patternSubType = new objectFactory.PatternSubType(pattern);

          patternType.patternSubTypes.push(patternSubType);
          patternType.patternSubTypesIndex.push(pattern.patternSubType);
        }
        else {
          patternSubType = patternType.patternSubTypes[patternSubTypesIndex];
        }

        // Create patternSubTypeItem.
        const patternSubTypeItem = new objectFactory.PatternItem(pattern.patternName, pattern);

        // Add the patternSubTypeItem to the patternSubType instance.
        patternSubType.patternSubTypeItems.push(patternSubTypeItem);
      }
      else {
        const patternTypeItem = new objectFactory.PatternItem(pattern.patternName, pattern);

        // Add the patternTypeItem to the patternType instance.
        patternType.patternTypeItems.push(patternTypeItem);
      }

      // Check if we are moving to a new subType in the next loop.
      for (j = i; j < this.patternlab.patterns.length; j++) {
        if (pattern.isHidden) {
          break;
        }

        const patternNext = this.patternlab.patterns[j + 1];

        if (patternNext) {
          if (patternNext.isHidden) {
            continue;
          }

          else if (
            patternSubType &&
            pattern.patternSubType &&
            (
              (
                pattern.patternType === patternNext.patternType &&
                pattern.patternSubType !== patternNext.patternSubType
              ) ||
              pattern.patternType !== patternNext.patternType
            )
          ) {
            // Create viewall for subType.
            const viewallPatternSubTypeItem = new objectFactory.PatternItem('View All', pattern);

            // Add viewall.
            patternSubType.patternSubTypeItems.push(viewallPatternSubTypeItem);

            // Create a property for this subType in this.viewallPaths.
            this.viewallPaths[pattern.patternType][pattern.patternSubType] = pattern.flatPatternPath;
            // Create a property for this subType in this.patternlab.patternPaths.
            this.patternlab.patternPaths[viewallPatternSubTypeItem.patternPartial] =
              `${this.pathsPublic.patterns}/${viewallPatternSubTypeItem.flatPatternPath}/index.html`;
          }
        }

        if (!patternNext || pattern.patternType !== patternNext.patternType) {
          // Omit scrape directory from viewalls.
          const scrapeTypeName = this.source.scrape.replace(`${this.source.patterns}/`, '').replace(/^\d*-/, '');

          if (pattern.patternType === scrapeTypeName) {
            break;
          }

          let patternSubst;

          // If this is a subType, we need to clone the pattern object and modify some of its string values.
          if (pattern.patternSubType) {
            patternSubst = JSON.parse(JSON.stringify(pattern));
            patternSubst.patternSubType = '';
            patternSubst.subdir = patternSubst.subdir.split('/')[0];
            patternSubst.flatPatternPath = patternSubst.subdir;
          }
          else {
            patternSubst = pattern;
          }

          // Create viewall for type.
          const viewallPatternTypeItem = new objectFactory.PatternItem('View All', patternSubst);

          // Add viewall.
          patternType.patternTypeItems.push(viewallPatternTypeItem);

          // Set viewall property for this type's viewallPath.
          this.viewallPaths[pattern.patternType].viewall =
            pattern.subdir.slice(0, pattern.subdir.indexOf(pattern.patternType) + pattern.patternType.length);
          // Create a property for this subType in this.patternlab.patternPaths.
          this.patternlab.patternPaths[viewallPatternTypeItem.patternPartial] =
            `${this.pathsPublic.patterns}/${viewallPatternTypeItem.flatPatternPath}/index.html`;
        }

        break;
      }
    }

    // Add viewall to patternPaths.
    this.patternlab.patternPaths['viewall'] = `${this.pathsPublic.patterns}/viewall/viewall.html`;
  }

  readViewallTemplates() {
    // Allow viewall templates to be overridden.
    if (this.source.ui) {
      const viewallCustomDir = `${this.source.ui}/viewall`;

      if (fs.existsSync(viewallCustomDir + '/partials/pattern-section.mustache')) {
        this.patternSection = fs.readFileSync(
          viewallCustomDir + '/partials/pattern-section.mustache', this.patternlab.enc
        );
      }
      if (fs.existsSync(viewallCustomDir + '/partials/pattern-section-sub-type.mustache')) {
        this.patternSectionSubType = fs.readFileSync(
          viewallCustomDir + '/partials/pattern-section-sub-type.mustache', this.patternlab.enc
        );
      }
      if (fs.existsSync(viewallCustomDir + '/partials/pattern-section-type.mustache')) {
        this.patternSectionType = fs.readFileSync(
          viewallCustomDir + '/partials/pattern-section-type.mustache', this.patternlab.enc
        );
      }
      if (fs.existsSync(viewallCustomDir + '/viewall.mustache')) {
        this.viewallTemplateFull = fs.readFileSync(
          viewallCustomDir + '/viewall.mustache', this.patternlab.enc
        );
      }
    }

    const viewallCoreDir = `${this.patternlab.config.paths.core}/styleguide/viewall`;

    try {
      if (!this.patternSection) {
        this.patternSection = fs.readFileSync(
          viewallCoreDir + '/partials/pattern-section.mustache', this.patternlab.enc
        );
      }
      if (!this.patternSectionSubType) {
        this.patternSectionSubType = fs.readFileSync(
          viewallCoreDir + '/partials/pattern-section-sub-type.mustache', this.patternlab.enc
        );
      }
      if (!this.patternSectionType) {
        this.patternSectionType = fs.readFileSync(
          viewallCoreDir + '/partials/pattern-section-type.mustache', this.patternlab.enc
        );
      }
      if (!this.viewallTemplateFull) {
        this.viewallTemplateFull = fs.readFileSync(
          viewallCoreDir + '/viewall.mustache', this.patternlab.enc
        );
      }
    }
    catch (err) {
      this.utils.error('ERROR: Missing an essential file from ' + viewallCoreDir);
      this.utils.error(err);
    }
  }

  writeViewalls() {
    const keys = Object.keys(this.viewallPatterns);

    // Iterate backwards to free up more memory early.
    let i = keys.length;

    while (i--) {
      const viewall = this.viewallPatterns[keys[i]];

      if (viewall.path && viewall.content) {
        fs.outputFileSync(viewall.path, viewall.content);

        delete viewall.content;
        delete viewall.path;
      }
    }
  }
};
