# Extensions

Fepper comes preconfigured with the 
<a href="https://www.npmjs.com/package/fp-stylus" target="_blank">fp-stylus</a> 
CSS preprocessing extension. You are by no means required to keep it. You may 
remove it with `npm rm --save-dev fp-stylus`. Then, delete the `extend/stylus` tasks 
from `extend/contrib.js`.

### Contributed extensions

* Install and update contributed extensions with NPM.
* Add the tasks to `extend/contrib.js` (and `extend/auxiliary/auxiliary_contrib.js`
  if necessary) in order for Fepper to run them.
* Contributed Fepper extensions can be found at https://www.npmjs.com/ by 
  searching for "Fepper extension".

### Custom extensions

* Write custom extensions in the `extend/custom` directory.
* Extensions require a file ending in "~extend.js" in order for Fepper to 
  recognize their tasks.
* The "\*~extend.js" file can be directly under `extend/custom`, or nested one 
  directory deep, but no deeper.
* Add the tasks to `extend/custom.js` (and `extend/auxiliary/auxiliary_custom.js`
  if necessary) in order for Fepper to run them.
* Fepper runs a self-contained instance of gulp to manage tasks. This gulp 
  instance will be independent of any other gulp instance on your system.
* The `fp` command is an alias for `gulp` (among other things). Any `fp` task 
  can be included in a custom task.
* Fepper only supports gulp 3 syntax.

### Confs and prefs

You might need to access the values in the `conf.yml` and `pref.yml` files in 
order to write custom tasks. They are exposed through `global.conf` and 
`global.pref` (on the `global` Node object).

The values in `patternlab-config.json` are exposed through `global.conf.ui`. 
Please note that all paths in `patternlab-config.json` will be converted to 
absolute paths in `global.conf.ui`.

`gulp.watch` will not work correctly with absolute paths. There are two 
workarounds for this:
 
* Hard-code a relative path as the first `gulp.watch` parameter. Pass an 
  absolute path (from `global.conf.ui.paths` or otherwise) as the `options.cwd` 
  value for the second parameter.
* Pass a value from `global.conf.ui.pathsRelative` as the first parameter.
  * `global.conf.ui.pathsRelative` stores relative versions of the values in 
    `global.conf.ui.paths`.
  * This will still probably require `options.cwd` in the second parameter.

### Fepper Utils

Common utilty functions for custom extensions are available from the 
<a href="https://www.npmjs.com/package/fepper-utils" target="_blank">Fepper Utils</a> 
NPM. Its API documentation can be viewed by following the link.
