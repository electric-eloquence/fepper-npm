'use strict';

const Feplet = require('feplet');

module.exports = class {
  constructor(options, html) {
    this.options = options;
    this.conf = options.conf;
    this.html = html;
    this.immutableFooter = this.html.getImmutableFooter(this.conf);
  }

  notFound() {
    return (req, res) => {
      const patternlabFoot = Feplet.render(
        this.immutableFooter,
        {
          portReloader: this.conf.livereload_port,
          portServer: this.conf.express_port
        }
      );

      let outputFpt = `
<!DOCTYPE html>
<html>
  <head>
    <title id="title">${t('ERROR')}</title>
    <meta charset="utf-8">
    <script src="../../node_modules/mousetrap/mousetrap.min.js"></script>
  </head>
  <body>
    <main>
      <pre>${t('Cannot GET %s')}</pre>`;

      outputFpt = outputFpt.replace('%s', req.url);
      outputFpt += this.html.foot;
      const output = Feplet.render(outputFpt, {patternlabFoot});

      res.status(404).send(output);
    };
  }
};
