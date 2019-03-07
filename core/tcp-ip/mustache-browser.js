'use strict';

const Feplet = require('feplet');
const fs = require('fs-extra');

const backButton =
  '<a href="#" class="fp-express mustache-browser__back" onclick="window.history.back();return false;">&#8678;</a>';

module.exports = class {
  constructor(options, html, ui) {
    this.conf = options.conf;
    this.html = html;
    this.immutableHeader = this.html.getImmutableHeader(this.conf);
    this.immutableFooter = this.html.getImmutableFooter(this.conf);
    this.ui = ui;
    this.utils = options.utils;
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
    let template = this.html.head;
    template += backButton;

    if (typeof err === 'string') {
      template += err;
    }
    else {
      template += '<p>There is no pattern by that name. Please check its spelling:</p><code>' + req.query.partial +
        '</code>';
    }

    template += this.html.foot;
    const patternlabHead = Feplet.render(this.immutableHeader, this.conf.ui);
    const patternlabFoot = Feplet.render(
      this.immutableFooter,
      {
        portReloader: this.conf.livereload_port,
        portServer: this.conf.express_port
      }
    );
    const output = Feplet.render(
      template,
      {
        title: 'Fepper Mustache Browser',
        patternlabHead,
        main_id: 'no-result',
        main_class: 'mustache-browser no-result',
        patternlabFoot
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
   * @param {string} data - HTML/Mustache.
   * @returns {string} Viewable and linkable code.
   */
  toHtmlEntitiesAndLinks(data) {
    let entitiesAndLinks = data.replace(/"/g, '&quot;');
    entitiesAndLinks = entitiesAndLinks.replace(/</g, '&lt;');
    entitiesAndLinks = entitiesAndLinks.replace(/>/g, '&gt;');
    // Link.
    entitiesAndLinks =
      entitiesAndLinks.replace(/\{\{&gt;[\S\s]*?\}\}/g, '<a href="?partial=$&" class="fp-express">$&</a>');
    // Strip parameters.
    // eslint-disable-next-line no-useless-escape
    entitiesAndLinks = entitiesAndLinks.replace(/(<a href="\?partial=[^\(]*)\([^"]*\)([^"]*\}\})/g, '$1$2');
    // Strip styleModifiers.
    entitiesAndLinks = entitiesAndLinks.replace(/(<a href="\?partial=[^"]*):[^"]*(\}\})/g, '$1$2');
    // Render indentation whitespace as HTML entities.
    entitiesAndLinks = entitiesAndLinks.replace(/^ /gm, '&nbsp;');
    entitiesAndLinks = entitiesAndLinks.replace(/^\t/gm, '&nbsp;&nbsp;&nbsp;&nbsp;');

    while (/^(&nbsp;)+ /m.test(entitiesAndLinks) || /^(&nbsp;)+\t/m.test(entitiesAndLinks)) {
      entitiesAndLinks = entitiesAndLinks.replace(/^((?:&nbsp;)+) /gm, '$1&nbsp;');
      entitiesAndLinks = entitiesAndLinks.replace(/^((?:&nbsp;)+)\t/gm, '$1&nbsp;&nbsp;&nbsp;&nbsp;');
    }

    entitiesAndLinks = entitiesAndLinks.replace(/\n/g, '<br>');

    return entitiesAndLinks;
  }

  main() {
    return (req, res) => {
      if (typeof req.query.partial !== 'string') {
        this.noResult(req, res);
      }

      try {
        // Can be verbose or shorthand partial syntax. Use patternlab.getPattern() to query.
        const queryPartial = this.stripPartialTag(req.query.partial.trim());
        let pattern = this.ui.patternlab.getPattern(queryPartial);

        if (!pattern) {
          this.noResult(req, res);

          return;
        }

        // In the case of pseudo-patterns, title and link to the pseudo-pattern while showing the code to its main.
        const patternLink = pattern.patternLink;
        const patternPartial = pattern.patternPartial;

        if (pattern.pseudoPatternPartial) {
          pattern = this.ui.patternlab.getPattern(pattern.pseudoPatternPartial);
        }

        const fullPath = `${this.conf.ui.paths.source.patterns}/${pattern.relPath}`;
        // Check if query string correlates to actual Mustache file.
        const stat = fs.statSync(fullPath);

        if (stat.isFile()) {
          const mustacheCode = fs.readFileSync(fullPath, this.conf.enc);

          // Render the Mustache code if it does correlate.
          // First, link the Mustache tags.
          let entitiesAndLinks = this.toHtmlEntitiesAndLinks(mustacheCode);

          // Render the output with HTML head and foot.
          let template = this.html.head;
          template += backButton;
          template += `<h2><a
            href="../${this.conf.ui.pathsPublic.patterns}/${patternLink}"
            class="fp-express mustache-browser__pattern-link">${patternPartial}</a></h2>`;
          template += '{{{ entitiesAndLinks }}}';
          template += this.html.foot;
          const patternlabHead = Feplet.render(this.immutableHeader, this.conf.ui);
          const patternlabFoot = Feplet.render(
            this.immutableFooter,
            {
              portReloader: this.conf.livereload_port,
              portServer: this.conf.express_port
            }
          );
          const output = Feplet.render(
            template,
            {
              title: 'Fepper Mustache Browser',
              patternlabHead,
              main_id: 'mustache-browser',
              main_class: 'mustache-browser',
              entitiesAndLinks,
              patternlabFoot
            }
          );

          res.send(output);
        }
        else {
          this.noResult(req, res);
        }
      }
      catch (err) {
        this.utils.error(err);
        this.noResult(req, res);
      }
    };
  }
};
