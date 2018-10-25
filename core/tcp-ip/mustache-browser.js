'use strict';

const Feplet = require('feplet');
const fs = require('fs-extra');

const backButton =
  '<a href="#" class="fp-express mustache-browser__back" onclick="window.history.back();">&lt; back</a>';

module.exports = class {
  constructor(options, html, ui) {
    this.conf = options.conf;
    this.html = html;
    this.immutableHeader = this.html.getImmutableHeader(this.conf);
    this.immutableFooter = this.html.getImmutableFooter(this.conf);
    this.ui = ui;
  }

  /**
   * Message indicating inability to match a partial to a Mustache file.
   *
   * @param {object} res - response object.
   * @param {string} err - error.
   */
  noResult(res, err) {
    let template = this.html.head;
    template += backButton;

    if (typeof err === 'string') {
      template += err;
    }
    else {
      template += 'There is no Mustache template there by that name. Perhaps you need to use ' +
        '<a href="http://patternlab.io/docs/pattern-including.html" target="_blank">' +
        'the more verbosely pathed syntax.</a>';
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
   * Strip Mustache tag to only the partial path.
   *
   * @param {string} partialParam - Mustache syntax.
   * @return {string} Partial path.
   */
  stripPartialTag(partialParam) {
    // Strip opening Mustache braces and control character.
    let partial = partialParam.replace(/^\{\{>\s*/, '');
    // Strip parentheses-wrapped parameter submission.
    partial = partial.replace(/\([\S\s]*?\)/, '');
    // Strip colon/pipe-delimited style modifier.
    partial = partial.replace(/\:[\w\-\|]+/, '');
    // Strip closing Mustache braces.
    partial = partial.replace(/\s*\}\}$/, '');

    return partial;
  }

  /**
   * Recursively strip token span tags output by the Pattern Lab code viewer.
   *
   * @param {string} codeParam - HTML/Mustache.
   * @return {string} Stripped code.
   */
  stripSpanTokens(codeParam) {
    let code = codeParam.replace(/<span class="token [\S\s]*?>([\S\s]*?)<\/span>/g, '$1');

    if (/<span class="token [\S\s]*?>([\S\s]*?)<\/span>/.test(code)) {
      code = this.stripSpanTokens(code);
    }

    return code;
  }

  /**
   * Make angle brackets, indentation, and newlines viewable as HTML and hotlink partials.
   *
   * @param {string} data - HTML/Mustache.
   * @return {string} Viewable and linkable code.
   */
  toHtmlEntitiesAndLinks(data) {
    let entitiesAndLinks = data.replace(/"/g, '&quot;');
    entitiesAndLinks = entitiesAndLinks.replace(/</g, '&lt;');
    entitiesAndLinks = entitiesAndLinks.replace(/>/g, '&gt;');
    entitiesAndLinks =
      entitiesAndLinks.replace(/\{\{&gt;[\S\s]*?\}\}/g, '<a href="?partial=$&" class="fp-express">$&</a>');
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
      if (typeof req.query.code === 'string') {
        try {
          let code = req.query.code;
          // Strip Pattern Lab's token span tags.
          code = this.stripSpanTokens(code);
          // HTML entities and links.
          code = this.toHtmlEntitiesAndLinks(code);

          if (typeof req.query.title === 'string') {
            const patternPartial = req.query.title;
            code = `<h2>${patternPartial}</h2>\n${code}`;
          }

          // Render the output with HTML head and foot.
          let template = this.html.head;
          template += backButton;
          template += '{{{ code }}}';
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
              code,
              patternlabFoot
            }
          );

          res.send(output);
        }
        catch (err) {
          this.noResult(res, err);
        }
      }
      else if (typeof req.query.partial === 'string') {
        try {
          // Requires verbosely pathed Mustache partial syntax.
          const queryPartial = this.stripPartialTag(req.query.partial.trim());
          const pattern = this.ui.patternlab.getPattern(queryPartial);

          let fullPath = `${this.conf.ui.paths.source.patterns}/${pattern.relPath}`;
          // Check if query string correlates to actual Mustache file.
          let stat = fs.statSync(fullPath);

          if (stat.isFile()) {
            fs.readFile(fullPath, this.conf.enc, function (err, data) {
              // Render the Mustache code if it does.
              // First, link the Mustache tags.
              let entitiesAndLinks = this.toHtmlEntitiesAndLinks(data);

              // Render the output with HTML head and foot.
              let template = this.html.head;
              template += backButton;
              template += `<h2>${pattern.patternPartial}</h2>`;
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
            }.bind(this));
          }
          else {
            this.noResult(res);
          }
        }
        catch (err) {
          this.noResult(res);
        }
      }
    };
  }
};
