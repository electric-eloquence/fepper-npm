<p align="center">
  <img
    src="https://raw.githubusercontent.com/electric-eloquence/fepper-npm/master/excludes/fepper-branding.png"
    alt="Fepper"
  >
</p>

<h2 align="center">A frontend prototyper tool for rapid prototyping of websites</h2>

### This is the NPM that powers these Fepper prototypers:

* [Fepper Main](https://github.com/electric-eloquence/fepper) - main project.
* [Fepper Base](https://github.com/electric-eloquence/fepper-base) - no 
  unnecessary assets, styles, or Pattern Lab demo.
* [Fepper for Drupal](https://github.com/electric-eloquence/fepper-drupal) - 
  templates configured for Drupal 8, along with a Drupal theme built to 
  accommodate those templates.
* [Fepper for Windows](https://github.com/electric-eloquence/fepper-windows) - 
  scripted to run on Windows.
* [Fepper for Wordpress](https://github.com/electric-eloquence/fepper-wordpress) - 
  templates configured for WordPress, along with a WordPress theme built to 
  accommodate those templates.

Please consult any of the above links for documentation on getting started and 
on power usage of Fepper.

### <a id="under-the-hood"></a>Under the Hood

#### Minimum supported Node.js version 8.5.0

To just run a Node.js implementation of Pattern Lab, instantiate a `patternlab` 
object as follows:

```javascript
const config = require('./patternlab-config.json');
const cwd = process.cwd();
const Patternlab = require('fepper/ui/core/lib/patternlab');
const patternlab = new Patternlab(config, cwd);
```

Fepper's `Patternlab` constructor recognizes a second parameter (a working 
directory parameter) for instantiating a `patternlab` object. This allows it to 
be instantiated from any directory within any task runner or custom application.

Fepper exposes these methods on the `patternlab` object:

* build: function (options)
* compileui: function (options)
* patternsonly: function (options)
* resetConfig: function (config)

The `options` parameter is optional. If submitted, it must be an object whose 
properties are intended to override one or more properties in the `config` 
object consumed by the `Patternlab` constructor.

Keep in mind that configs passed with an `options` parameter will persist 
through all future operations on that `Patternlab` instance. In order to revert 
the configs back to the original configs, call `resetConfig` with the original 
configs.

Fepper is 100% compatible with Pattern Lab PHP Mustache code. It aims to 
maintain parity with the PHP project with respect to performance and core 
features.

### <a id="upfront-and-onscreen"></a>Upfront and Onscreen

Using this NPM decoupled from a full Fepper project requires manually compiling 
the UI. Use the following code as a template for manual compilation:

```javascript
patternlab.compileui()
.catch((err) => {
  console.error(err);
})
.then(() => {
  patternlab.build();
});
```

All aspects of the UI are available for customization. For example, the toolbar 
can accept additions, modifications, and deletions per the needs of end users. 
The UI is built by recursive, functional React calls. The recursion tree is 
reflected by the directory structure containing the modules which compose the 
UI. To override any given module, copy the directory structure leading to the 
module from 
<a href="https://github.com/electric-eloquence/fepper-npm/tree/dev/ui/core/styleguide/index/html" target="_blank">
https&colon;//github.com/electric-eloquence/fepper-npm/tree/dev/ui/core/styleguide/index/html</a> 
to `source/_ui/index/html`, respective to your implementation. Modifications to 
modules in that directory will override the corresponding modules in core. 
Additions (so long as they are correctly nested) will also be recognized.

It is mandatory to componentize style modifications to the UI this way. While it 
is a good practice to componentize scripts this way, generic modifications to UI 
JavaScript can also be added to `source/_scripts/ui-extender.js`.

View All markup can also be overridden by copying the `.mustache` files in 
<a href="https://github.com/electric-eloquence/fepper-npm/tree/dev/ui/core/styleguide/viewall" target="_blank">
https&colon;//github.com/electric-eloquence/fepper-npm/tree/dev/ui/core/styleguide/viewall</a> 
and pasting them to `source/_ui/viewall` (nested correctly). Modifications will 
then be recognized and displayed in the UI. (No additions are allowed.) Custom 
View All styles can be added to regular pattern styles in `source/_styles`.

You will need to compile the UI in order for the browser to pick up custom 
changes to the UI. Within a full Fepper project, this can be accomplished with 
the following command:

```shell
fp ui:compile
```

New UI customizations will not be picked up simply by restarting Fepper.
