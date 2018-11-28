'use strict';

const Feplet = require('feplet');

module.exports = class {
  constructor(options, html) {
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
    <title id="title">Error</title>
    <meta charset="UTF-8">
  </head>
  <body>
    <main>
`;
      outputFpt += `<pre>Cannot GET ${req.url}</pre>\n`;
      outputFpt += this.html.foot;
      const output = Feplet.render(outputFpt, {patternlabFoot});

      res.status(404).send(output);
    };
  }
};
