'use strict';

const Feplet = require('feplet');

module.exports = class {
  constructor(fpExpress) {
    this.options = fpExpress.options;
    this.conf = this.options.conf;
    this.html = fpExpress.html;
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

      let outputFpt = this.html.headBoilerplate;
      /* eslint-disable quotes */
      outputFpt = outputFpt.replace('{{ title }}', t("ERROR"));
      outputFpt += `\n      <pre>${t("Cannot GET %s")}</pre>`;
      /* eslint-enable quotes */
      outputFpt = outputFpt.replace('%s', req.url);
      outputFpt += this.html.foot;
      const output = Feplet.render(outputFpt, {patternlabFoot});

      res.writeHead(404).end(output);
    };
  }
};
