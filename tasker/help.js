'use strict';

const gulp = require('gulp');

const utils = require('../core/lib/utils');

gulp.task('help', cb => {
  const out = `
Usage:
    fp <task> [<additional args>...]

Tasks:
    fp                  Launch Fepper and open it in a browser.
    fp data             Force-compile data.json from underscore-prefixed .json files.
    fp frontend-copy    Copy assets, scripts, and styles to the backend.
    fp once             Clean the public folder and do a one-off Fepper build.
    fp restart          Restart after shutdown, but without opening the browser.
    fp static           Generate a static site from the 04-pages directory.
    fp syncback         Combines frontend-copy and template tasks.
    fp template         Translate templates in 03-templates for the backend and copy them there.
    fp ui:compile       Compile the React components composing the UI. 
    fp update           Update Fepper NPM, Fepper UI, and Fepper extensions.
    fp version          Print versions of Fepper CLI, Fepper NPM, and Fepper UI.

Note: Windows users will need to recognize \`fp\` as an alias for \`cscript .\\fepper.vbs\` or \`.\\fepper.ps1\`
`;
  utils.info(out);
  cb();
});
