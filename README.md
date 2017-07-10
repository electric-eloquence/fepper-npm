## Fepper

# A frontend prototyper tool for rapid prototyping of web sites

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

##### Recommended minimum Node.js version 7.6.0

To just run a Node.js implementation of Pattern Lab, instantiate a `patternlab` 
object as follows:

```
const config = require('./patternlab-config.json');
const cwd = process.cwd();
const Patternlab = require('fepper/ui/core/lib/patternlab');
const patternlab = new Patternlab(config, cwd);
```

Fepper's `Patternlab` constructor recognizes a second parameter (a working 
directory parameter) for instantiating a `patternlab` object. This allows it to 
be instantiated from any directory within any task runner or third-party 
framework.

Fepper exposes these methods on the `patternlab` object:

* build: function (callback, deletePatternDir = false)
* compileUi: function ()
* help: function ()
* patternsonly: function (callback, deletePatternDir = false)

Fepper is 100% compatible with Pattern Lab PHP Mustache code. It aims to 
maintain parity with the PHP project with respect to performance and core 
features.

### <a id="upfront-and-onscreen"></a>Upfront and Onscreen
Using this NPM decoupled from a full Fepper project requires manually compiling 
the UI. Use the following code as a template for manual compilation:

```
patternlab.compileUi()
.catch(err => {
  console.error(err);
})
.then(() => {
  return patternlab.build();
});
```

All aspects of the UI are available for customization. For example, the toolbar 
can accept additions, modifications, and deletions per the needs of end users. 
The UI is built by recursive, functional React calls. The recursion tree is 
reflected by the directory structure containing the modules which compose the 
UI. To override any given module, copy the directory structure leading to the 
module from https://github.com/electric-eloquence/fepper-npm/tree/dev/ui/core/styleguide/index/html 
to `source/_ui/index/html`, respective to your implementation. Modifications to 
modules in that directory will override the corresponding modules in core. 
Additions (so long as they are correctly nested) will also be recognized.

It is mandatory to componentize style modifications to the UI this way. While it 
is a good practice to componentize scripts this way, generic modifications to UI 
JavaScript can also be added to `source/_scripts/ui-extender.js`.

View All markup can also be overridden by copying the `.mustache` files in 
https://github.com/electric-eloquence/fepper-npm/tree/dev/ui/core/styleguide/viewall 
and pasting them to `source/_ui/viewall` (nested correctly). Modifications will 
then be recognized and displayed in the UI. (No additions are allowed.) Custom 
View All styles can be added to regular pattern styles in `source/_styles`.

You will need to compile the UI in order for the browser to pick up custom 
changes to the UI. Within a full Fepper project, this can be accomplished with 
the following command:

```
fp ui:compile
```

New UI customizations will not be picked up simply by restarting Fepper.

You can compile the UI on every build by setting `compileUiOnEveryBuild` to 
`true` in `patternlab-config.json`. However, this is not recommended since it 
would be a drain on performance and simply isn't necessary on every build.

### Contribute
Please report any bugs and submit contributions at 
https://github.com/electric-eloquence/fepper-npm
