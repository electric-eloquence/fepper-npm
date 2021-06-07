'use strict';

const Feplet = require('feplet');
const fs = require('fs-extra');
const Prism = require('prismjs');

module.exports = class {
  constructor(fpExpress) {
    this.options = fpExpress.options;
    this.conf = this.options.conf;
    this.html = fpExpress.html;
    this.immutableHeader = this.html.getImmutableHeader(this.conf);
    this.immutableFooter = this.html.getImmutableFooter(this.conf);
    this.ui = fpExpress.ui;
    this.utils = this.options.utils;
  }

  getPattern(queryPartial) {
    return this.ui.patternlab.getPattern(queryPartial);
  }

  /**
   * Message indicating inability to match a partial to a Mustache file.
   *
   * @param {object} req - Request object.
   * @param {object} res - Response object.
   * @param {string} err - Error.
   */
  noResult(req, res, err) {
    let template = this.html.headMustache;
    template += '<pre><code class="language-markup" style="color: red;">';

    /* istanbul ignore if */
    if (err) {
      template += err.toString();
    }
    else {
      template +=
        `${t('There is no pattern named')} ${req.query.partial}. ${t('Please check its spelling.')}`;
    }

    template += '</code></pre>';
    template += this.html.foot;
    const output = Feplet.render(
      template,
      {
        html_class: 'mustache-browser',
        title: 'Fepper Mustache Browser',
        body_class: 'mustache-browser__body',
        main_class: 'mustache-browser__no-result'
      }
    );

    res.send(output);
  }

  /**
   * Strip Mustache tag to only the partial name.
   *
   * It is debatable whether or not to submit Mustache control structures as part of the query string. The main
   * advantage for doing so is that it is a greater performance burden to strip them on rendering the Mustache Browser
   * output. This means searching the entire body of Mustache code for partial tags and stripping the control structures
   * for each one.
   *
   * By submitting the control structures, the stripping only needs to occur for a very short piece of text.
   *
   * @param {string} partialParam - Mustache syntax.
   * @returns {string} Partial path.
   */
  stripPartialTag(partialParam) {
    // Strip opening Mustache braces and control character.
    let partial = partialParam.replace(/^\{\{>\s*/, '');
    // Strip closing Mustache braces.
    partial = partial.replace(/\s*\}\}$/, '');

    return partial;
  }

  /**
   * Make angle brackets, indentation, and newlines viewable as HTML and hotlink partials.
   *
   * @param {string} code - Feplet.
   * @returns {string} Viewable and linkable code.
   */
  toHtmlEntitiesAndLinks(code) {
    const highlighted = Prism.highlight(code, Prism.languages.markup, 'markup');
    const highlightedSplit = highlighted.split('{{>');

    for (let i = 0; i < highlightedSplit.length; i++) {
      if (i === 0 && highlighted.indexOf('{{>') !== 0) {
        continue;
      }

      const includer = highlightedSplit[i];
      const endStashIndex = includer.indexOf('}}');

      if (endStashIndex > -1) {
        let relPath = includer.slice(0, endStashIndex).trim();

        // Strip parameters.
        if (relPath.includes('(')) {
          relPath = relPath.slice(0, relPath.indexOf('('));
        }

        // Strip styleModifiers. Even after styleModifier deprecation and removal, leave the next line intact.
        if (relPath.includes(':')) {
          relPath = relPath.slice(0, relPath.indexOf(':'));
        }

        const includerIndex = includer.indexOf('}}');
        const includerSplit0 = includer.slice(0, includerIndex);
        const includerSplit1 = includer.slice(includerIndex + 2);
        const pattern = this.ui.getPattern(relPath);

        if (pattern) {
          highlightedSplit[i] = '<a href="/?p=' + pattern.patternPartial + '" target="_top">{{>' + includerSplit0 +
            '}}</a>' + includerSplit1;
        }
        else {
          highlightedSplit[i] = '{{>' + includerSplit0 + '}}' + includerSplit1;
        }
      }
    }

    return highlightedSplit.join('');
  }

  main() {
    return (req, res) => {
      if (typeof req.query.partial !== 'string') {
        this.noResult(req, res);

        return;
      }

      try {
        // Can be verbose or shorthand partial syntax. Use patternlab.getPattern() to query.
        const queryPartial = this.stripPartialTag(req.query.partial.trim());
        let pattern = this.ui.patternlab.getPattern(queryPartial);

        if (!pattern) {
          this.noResult(req, res);

          return;
        }

        if (pattern.pseudoPatternPartial) {
          pattern = this.ui.patternlab.getPattern(pattern.pseudoPatternPartial);
        }

        const fullPath = `${this.conf.ui.paths.source.patterns}/${pattern.relPath}`;
        // Check if query string correlates to actual Mustache file.
        const stat = fs.statSync(fullPath);

        /* istanbul ignore else */
        if (stat.isFile()) {
          const mustacheCode = fs.readFileSync(fullPath, this.conf.enc);

          // Render the Mustache code if it does correlate.
          // First, link the Mustache tags.
          let entitiesAndLinks = this.toHtmlEntitiesAndLinks(mustacheCode);

          // Render the output with HTML head and foot.
          let template = this.html.headMustache;
          template += `
<pre><code class="language-markup">{{{ entitiesAndLinks }}}</code></pre>
`;
          template += this.html.foot;
          const output = Feplet.render(
            template,
            {
              html_class: 'mustache-browser',
              title: 'Fepper Mustache Browser',
              body_class: 'mustache-browser__body',
              main_class: 'mustache-browser__main',
              entitiesAndLinks
            }
          );

          res.send(output);
        }
        else {
          this.noResult(req, res);
        }
      }
      catch (err) /* istanbul ignore next */ {
        this.utils.error(err);
        this.noResult(req, res, err);
      }
    };
  }
};
