/**
 * Outputs help text to the console.
 */
'use strict';

module.exports = class {
  constructor(options) {
    this.options = options;
    this.utils = options.utils;
  }

  main() {
    let out = `
${t('Use:')}
    <${t('task')}> [<${t('additional args')}>... [-d | --debug]]

${t('Tasks:')}
    fp                  ${t('Launch Fepper and open it in a browser')}
    fp data             ${t('Build data.json from underscore-prefixed .json files')}
    fp frontend-copy    ${t('Copy assets, scripts, and styles to the backend')}
    fp once             ${t('Do a one-off Fepper build to the public directory')}
    fp restart          ${t('Restart after shutdown, but without opening the browser')}
    fp static           ${t('Generate a static site from the 04-pages directory')}
    fp syncback         ${t('Combine frontend-copy and template tasks')}
    fp template         ${t('Translate templates in 03-templates for the backend and copy them there')}
    fp ui:compile       ${t('Compile the UI React components')}
    fp ui:help          ${t('Print UI tasks and descriptions')}
    fp update           ${t('Update Fepper distro, Fepper CLI, Fepper NPM, Fepper UI, and Fepper extensions')}
    fp version          ${t('Print versions of Fepper CLI, Fepper NPM, and Fepper UI')}
    fp extend:help      ${t('Print extension tasks and descriptions')}
`;

    this.utils.info(out);
  }
};
