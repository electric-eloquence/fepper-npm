'use strict';

const Feplet = require('feplet');

module.exports = class {
  #fpExpress;

  constructor(fpExpress) {
    this.#fpExpress = fpExpress;

    this.options = fpExpress.options;
    this.conf = this.options.conf;
    this.rootDir = this.options.rootDir;
    this.utils = this.options.utils;

    this.html = fpExpress.html;
  }

  get readme() {
    return this.#fpExpress.readme;
  }

  main() {
    return (req, res) => {
      const successMsg = 'Installation success!';
      const ts = this.utils.deepGet(req, 'query.ts') ? req.query.ts : '';

      this.readme.getHtml()
        .then((htmlMd_) => {
          // Replace GitHub image with Fepper website image for analytic purposes.
          let imageSrc = 'https://fepper.io/_assets/src/fepper-branding.svg?';

          if (this.utils.deepGet(this.options, 'distro.distro')) {
            imageSrc += 'distro=' + this.options.distro.distro;
          }

          if (this.utils.deepGet(this.options, 'distro.version')) {
            if (!imageSrc.endsWith('?')) {
              imageSrc += '&';
            }

            imageSrc += 'distro_v=' + this.options.distro.version;
          }

          if (this.utils.deepGet(this.options, 'npm.version')) {
            if (!imageSrc.endsWith('?')) {
              imageSrc += '&';
            }

            imageSrc += 'npm_v=' + this.options.npm.version;
          }

          if (this.utils.deepGet(this.options, 'ui.version')) {
            if (!imageSrc.endsWith('?')) {
              imageSrc += '&';
            }

            imageSrc += 'ui_v=' + this.options.ui.version;
          }

          if (this.utils.deepGet(this.options, 'utils.version')) {
            if (!imageSrc.endsWith('?')) {
              imageSrc += '&';
            }

            imageSrc += 'utils_v=' + this.options.utils.version;
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
            res.writeHead(statusData.code).end(this.utils.httpCodes[statusData.code] + ' - ' + statusData.msg);
          }
          else {
            res.writeHead(statusData.code).end(this.utils.httpCodes[statusData.code] || '');
          }
        });
    };
  }
};
