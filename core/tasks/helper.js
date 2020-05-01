/**
 * Outputs help text to the console.
 */
'use strict';

let t;

module.exports = class {
  constructor(options) {
    this.options = options;
    this.utils = options.utils;

    t = this.utils.t;
  }

  main() {
    let out = `
${t('Use:')}
    <${t('task')}> [<${t('additional args')}>... [-d | --debug]]

${t('Tasks:')}
    fp                  ${t('Launch Fepper and open it in a browser')}
    fp data             ${t('Build data.json from underscore-prefixed .json files')}
    fp frontend-copy    ${t('Copy assets, scripts, and styles to the backend')}
    fp once             ${t('Output a new build to the public directory')}
    fp restart          ${t('Restart after shutdown, but without opening the browser')}
    fp static           ${t('Generate a static site from the 04-pages directory')}
    fp syncback         ${t('Combine frontend-copy and template tasks')}
    fp template         ${t('Translate templates in 03-templates for the backend, and output them there')}
    fp ui:compile       ${t('Compile the UI React components')}
    fp ui:help          ${t('Print UI tasks and their descriptions')}
    fp update           ${t('Update Fepper distro, Fepper CLI, Fepper NPM, Fepper UI, and Fepper extensions')}
    fp version          ${t('Print the versions of Fepper CLI, Fepper NPM, and Fepper UI')}
    fp extend:help      ${t('Print extension tasks and their descriptions')}
`;

    this.utils.info(out);
  }
};
