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
      outputFpt = outputFpt.replace('{{ title }}', t('ERROR'));
      outputFpt += `\n      <pre>${t('Cannot GET %s')}</pre>`;
      outputFpt = outputFpt.replace('%s', req.url);
      outputFpt += this.html.foot;
      const output = Feplet.render(outputFpt, {patternlabFoot});

      // Need to set .statusCode, and not invoke .writeHead(), because the routing would have passed through
      // express.static at this point and have already written to the header. We're trying to avoid invoking Express'
      // res.status() because of its ambiguity with the res.status property on the client.
      res.statusCode = 404;
      res.send(output);
    };
  }
};
