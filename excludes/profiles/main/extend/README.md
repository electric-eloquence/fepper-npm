# Extensions

Fepper comes configured with a Stylus CSS preprocessing extension. You are by no 
means required to keep it. You may remove it with `npm rm --save fp-stylus`. 
Then, delete the `stylus` tasks from `contrib.js`.

### Contributed extensions

* Install and update contributed extensions with NPM.
* Add the tasks to `contrib.js` (and `auxiliary/auxiliary_contrib.js` if 
  necessary) in order for Fepper to run them.
* Contributed Fepper extensions can be found at https://www.npmjs.com/ by 
  searching for "Fepper extension".

### Custom extensions

* Write custom extensions in the `custom` directory.
* Extensions require a file ending in "~extend.js" in order for Fepper to 
  recognize their tasks.
* The "\*~extend.js" file can be directly under `custom`, or nested one 
  directory deep, but no deeper.
* Add the tasks to `custom.js` (and `auxiliary/auxiliary_custom.js` if 
  necessary) in order for Fepper to run them.
* Fepper runs a self-contained instance of gulp to manage tasks. This gulp 
  instance will be independent of any other gulp instance on your system.
* The `fp` command is an alias for `gulp` (among other things). Any `fp` task 
  can be included in a custom task.
* Fepper only supports gulp 3 syntax.

### Confs and prefs

You might need to access the values in `conf.yml` and `pref.yml` in order to 
write custom tasks. They are exposed through `global.conf` and `global.pref` 
respectively.

The values in `patternlab-config.json` are exposed through `global.conf.ui`. One 
thing to note is that all path values in `patternlab-config.json` will be 
converted to absolute paths in `global.conf.ui`.

`gulp.watch` will not work correctly with absolute paths. There are two 
workarounds for this:

* Hard-code a relative path as the first parameter. Pass an absolute path (from 
  `global.conf.ui.paths` or otherwise) as the `options.cwd` value for the second 
  parameter.
* Pass a value from `global.conf.ui.pathsRelative` as the first parameter.
  * `global.conf.ui.pathsRelative` stores relative versions of the values in 
    `global.conf.ui.paths`.
  * This will still probably require `options.cwd` in the second parameter.
