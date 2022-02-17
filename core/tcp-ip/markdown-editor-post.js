'use strict';

const fs = require('fs-extra');

// Exporting module.exports as a class so req and res can be responsibly scoped to the "this" keyword.
module.exports = class {
  constructor(req, res, fpExpress) {
    this.req = req;
    this.res = res;
    this.gatekeeper = fpExpress.gatekeeper;
    this.options = fpExpress.options;
    this.conf = this.options.conf;
    this.utils = this.options.utils;

    this.markdownEdited = this.utils.deepGet(this, 'req.body.markdown_edited');
    this.markdownSource = this.utils.deepGet(this, 'req.body.markdown_source');
  }

  main() {
    if (!this.gatekeeper.gatekeep(this.req)) {
      this.gatekeeper.render('the Markdown Editor')(this.req, this.res);

      return;
    }

    try {
      const testMarkdownEdited = 'typeof this.markdownEdited !== \'string\'';
      const testMarkdownSource = 'typeof this.markdownSource !== \'string\'';

      // eslint-disable-next-line no-eval
      if (eval(testMarkdownEdited)) {
        throw new Error(testMarkdownEdited);
      }

      // eslint-disable-next-line no-eval
      if (eval(testMarkdownSource)) {
        throw new Error(testMarkdownSource);
      }

      const markdownFile = this.conf.ui.paths.source.patterns + '/' + this.markdownSource;
      const markdownCurrent = fs.readFileSync(markdownFile, this.conf.enc); // Will throw if the file doesn't exist.

      if (markdownCurrent !== this.markdownEdited) {
        fs.writeFileSync(markdownFile, this.markdownEdited);
        this.res.sendStatus(200); // OK.
      }
      else {
        this.res.sendStatus(304); // Not modified.
      }
    }
    catch (err) {
      this.res.writeHead(500).end(JSON.stringify(err, Object.getOwnPropertyNames(err)));
    }
  }
};
