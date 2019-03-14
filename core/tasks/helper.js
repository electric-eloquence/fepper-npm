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
Use:
    fp <task> [<additional args>... [-d | --debug]]

Tasks:
    fp                  Launch Fepper and open it in a browser.
    fp data             Build data.json from underscore-prefixed .json files.
    fp frontend-copy    Copy assets, scripts, and styles to the backend.
    fp once             Do a one-off Fepper build to the public directory.
    fp restart          Restart after shutdown, but without opening the browser.
    fp static           Generate a static site from the 04-pages directory.
    fp syncback         Combine frontend-copy and template tasks.
    fp template         Translate templates in 03-templates for the backend and copy them there.
    fp ui:compile       Compile the UI React components.
    fp ui:help          Display UI tasks and descriptions.
    fp update           Update Fepper distro, Fepper CLI, Fepper NPM, Fepper UI, and Fepper extensions.
    fp version          Print versions of Fepper CLI, Fepper NPM, and Fepper UI.
`;

    this.utils.info(out);
  }
};
