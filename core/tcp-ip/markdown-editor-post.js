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
    this.relPath = this.utils.deepGet(this, 'req.body.rel_path');
  }

  main() {
    if (!this.gatekeeper.gatekeep(this.req)) {
      this.gatekeeper.render('Markdown Editor')(this.req, this.res);

      return;
    }

    try {
      const testEditedMarkdown = 'typeof this.markdownEdited !== \'string\'';
      const testRelPath = 'typeof this.relPath !== \'string\'';

      // eslint-disable-next-line no-eval
      if (eval(testEditedMarkdown)) {
        throw new Error(testEditedMarkdown);
      }

      // eslint-disable-next-line no-eval
      if (eval(testRelPath)) {
        throw new Error(testRelPath);
      }

      const mdFile = this.conf.ui.paths.source.patterns + '/' +
        this.relPath.slice(0, -(this.conf.ui.patternExtension.length)) + this.conf.ui.frontMatterExtension;

      fs.statSync(mdFile); // Will throw if the file doesn't exist.
      fs.writeFileSync(mdFile, this.markdownEdited);
      this.res.writeHead(200).end();
    }
    catch (err) {
      this.res.writeHead(500).send(JSON.stringify(err, Object.getOwnPropertyNames(err)));
    }
  }
};
