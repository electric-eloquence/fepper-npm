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

      let outputFpt = this.html.head;
      outputFpt = outputFpt.replace('{{ title }}', t('ERROR'));
      outputFpt += `\n      <pre>${t('Cannot GET %s')}</pre>`;
      outputFpt = outputFpt.replace('%s', req.url);
      outputFpt += this.html.foot;
      const output = Feplet.render(outputFpt, {patternlabFoot});

      res.status(404).send(output);
    };
  }
};
