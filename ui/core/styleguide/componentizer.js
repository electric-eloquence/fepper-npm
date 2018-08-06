'use strict';

const fs = require('fs-extra');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const slash = require('slash');

module.exports = class {
  constructor(patternlab) {
    this.patternlab = patternlab;
  }

  main(doCompile) {
    const config = this.patternlab.config;
    const ComponentsOnServer = require('./components-on-server');
    const componentsOnServer = new ComponentsOnServer(this.patternlab);

    return componentsOnServer.init(doCompile)
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error(err.message || err);
      })

      .then((res) => {
        const {
          createRenderObj,
          componentsForClient
        } = res;

        if (typeof createRenderObj !== 'function') {
          try {
            createRenderObj();
          }
          catch (err) {
            return Promise.reject(err);
          }
        }

        return new Promise((resolve) => {
          const componentizedUi = require(`${config.paths.public.styleguide}/scripts/componentized-ui`);
          const uiCreate = React.createFactory(componentizedUi(createRenderObj));

          // config.paths.source.styleguide is not publicly documented and only configurable for testing.
          let styleguideDir = config.paths.source.styleguide || slash(__dirname);
          let output = `<!DOCTYPE html>${ReactDOMServer.renderToString(uiCreate())}`;

          output = output.replace(
            /\{\{\{ ?components_for_client ?\}\}\}/, `//<!--\n${componentsForClient}\n//-->`);
          fs.writeFileSync(`${styleguideDir}/index.mustache`, output);

          resolve();
        });
      });
  }
};
