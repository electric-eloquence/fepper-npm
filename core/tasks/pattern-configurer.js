/**
 * Writes browser JavaScript files pertinent to both Fepper and Pattern Lab.
 *
 * In order to run browser JavaScripts dependent on variables defined in conf.yml or pref.yml, we need to write out the
 * pattern-configurer.js file with those variables dynamically inserted.
 */
'use strict';

const fs = require('fs-extra');

const utils = require('../lib/utils');

const conf = global.conf;

exports.main = function () {
  var dest = utils.pathResolve(`${conf.ui.paths.public.styleguide}/scripts/pattern-configurer.js`);

  // Backticked multi-line string.
  var output = `// LiveReload.
if (window.location.port === '${conf.express_port}') {
  //<![CDATA[
    document.write('<script type="text/javascript" src="http://HOST:${conf.livereload_port}/livereload.js"><\\/script>'.replace('HOST', location.hostname));
  //]]>
}
`;
  // Write out the LiveReloader.
  fs.appendFileSync(dest, output);
};
