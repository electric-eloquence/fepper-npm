'use strict';

const Feplet = require('feplet');

module.exports = class {
  constructor(options, html, readme) {
    this.options = options;
    this.conf = options.conf;
    this.rootDir = options.rootDir;
    this.utils = options.utils;

    this.html = html;
    this.readme = readme;
  }

  main() {
    return (req, res) => {
      const successMsg = 'Installation success!';
      const ts = this.utils.deepGet(req, 'query.ts') ? req.query.ts : '';

      this.readme.getHtml()
        .then((htmlMd_) => {
          // Replace GitHub image with Fepper website image for analytic purposes.
          let imageSrc = 'https://fepper.io/_assets/src/fepper-branding.svg?';

          if (this.options.distro.name) {
            imageSrc += 'distro=' + this.options.distro.name;
          }

          if (this.options.distro.version) {
            if (!imageSrc.endsWith('?')) {
              imageSrc += '&';
            }

            imageSrc += 'distro_v=' + this.options.distro.version;
          }

          if (this.options.npm.version) {
            if (!imageSrc.endsWith('?')) {
              imageSrc += '&';
            }

            imageSrc += 'npm_v=' + this.options.npm.version;
          }

          if (this.options.ui.version) {
            if (!imageSrc.endsWith('?')) {
              imageSrc += '&';
            }

            imageSrc += 'ui_v=' + this.options.ui.version;
          }

          const htmlMd = htmlMd_.replace(
            'https://raw.githubusercontent.com/electric-eloquence/fepper-npm/master/excludes/fepper-branding.png',
            imageSrc
          );

          let outputFpt = this.html.head;
          outputFpt += this.html.success;
          outputFpt += htmlMd + '\n';
          outputFpt += this.html.foot;

          const output = Feplet.render(
            outputFpt,
            {
              title: successMsg,
              body_class: 'text',
              main_id: 'success-page',
              main_class: 'success-page',
              msg_class: 'success',
              message: `<h1>${successMsg}</h1>`,
              origin: req.headers.host,
              search: ts ? `?ts=${ts}` : ''
            }
          );

          res.send(output);
        })
        .catch((statusData) => {
          /* istanbul ignore else */
          if (statusData.code === 404) {
            let outputFpt = this.html.head;
            outputFpt += `<a href="/?ts=${ts}">Open Fepper UI</a>`;
            outputFpt += this.html.foot;

            const output = Feplet.render(
              outputFpt,
              {
                title: successMsg,
                body_class: 'text',
                main_id: 'success-page',
                main_class: 'success-page',
                msg_class: 'success',
                message: `<h1>${successMsg}</h1>`
              }
            );

            res.send(output);
          }
          else if (statusData.code === 500) {
            res.status(statusData.code).send(this.utils.httpCodes[statusData.code] + ' - ' + statusData.msg);
          }
          else {
            res.status(statusData.code).send(this.utils.httpCodes[statusData.code]);
          }
        });
    };
  }
};
