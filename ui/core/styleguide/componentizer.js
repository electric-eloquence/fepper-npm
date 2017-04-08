'use strict';

const fs = require('fs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

module.exports = class {
  constructor(patternlab) {
    this.patternlab = patternlab;
  }

  main(forceCompile) {
    const config = this.patternlab.config;
    const ComponentsOnServer = require(`${__dirname}/components-on-server`);
    const componentsOnServer = new ComponentsOnServer(this.patternlab);

    return componentsOnServer.init(forceCompile)
      .catch(err => {
        console.error(err);
      })
      .then(createRenderObj => {
        if (!createRenderObj) {
          return Promise.resolve();
        }

        return new Promise(resolve => {
          const componentizedUi = require(`${config.paths.public.styleguide}/scripts/componentized-ui`);
          const uiCreate = React.createFactory(componentizedUi(createRenderObj));
          let styleguideDir = config.paths.source.styleguide || __dirname;
          let output = `<!DOCTYPE html>${ReactDOMServer.renderToString(uiCreate())}`;
          output = output.replace(
            /\{\{\{ ?components_for_client ?\}\}\}/, `//<!--\n${global.componentsForClient}\n//-->`);

          fs.writeFileSync(`${styleguideDir}/index.mustache`, output);

          resolve();
        });
      });
  }
};
