<p align="center">
  <img
    src="https://raw.githubusercontent.com/electric-eloquence/fepper-npm/master/excludes/fepper-branding.png"
    alt="Fepper"
  >
</p>

<h2 align="center">A frontend prototyper tool for rapid prototyping of websites</h2>

[![Known Vulnerabilities](https://snyk.io/test/github/electric-eloquence/fepper-npm/badge.svg)](https://snyk.io/test/github/electric-eloquence/fepper-npm)
[![Mac/Linux Build Status](https://img.shields.io/travis/electric-eloquence/fepper-npm.svg)](https://travis-ci.org/electric-eloquence/fepper-npm)
[![Windows Build Status](https://img.shields.io/appveyor/ci/e2tha-e/fepper-npm.svg?label=windows)](https://ci.appveyor.com/project/e2tha-e/fepper-npm)
![Node Version](https://img.shields.io/node/v/fepper.svg)
[![License](https://img.shields.io/github/license/electric-eloquence/fepper-npm.svg)](https://raw.githubusercontent.com/electric-eloquence/fepper-npm/release/LICENSE)

### This is the NPM that powers these Fepper prototypers:

* [Fepper Main](https://github.com/electric-eloquence/fepper) - main distribution.
* [Fepper Base](https://github.com/electric-eloquence/fepper-base) - no 
  unnecessary assets, styles, Pattern Lab demo, or `fp-stylus` extension.
* [Fepper for Drupal](https://github.com/electric-eloquence/fepper-drupal) - 
  templates configured for Drupal, along with a Drupal theme built to 
  accommodate those templates.
* [Fepper for Wordpress](https://github.com/electric-eloquence/fepper-wordpress) - 
  templates configured for WordPress, along with a WordPress theme built to 
  accommodate those templates.

Please consult any of the above links for documentation on getting started and 
on power-usage of Fepper.

### <a id="under-the-hood"></a>Under the Hood

#### Minimum supported Node.js version 8.10.0

To just run a Node.js implementation of Pattern Lab, instantiate a `patternlab` 
object as follows:

```javascript
const config = require('./patternlab-config.json');
const cwd = process.cwd();
const Patternlab = require('fepper/ui/core/lib/patternlab');
const patternlab = new Patternlab(config, cwd);
```

Fepper's `Patternlab` constructor recognizes a second argument (a working 
directory argument) for instantiating a `patternlab` object. This allows it to 
be instantiated from any directory within any task runner or custom application.

Fepper exposes these methods on the `patternlab` object:

* build: function (options)
* compile: function (options)
* resetConfig: function (config)

The `options` argument is optional. If submitted, it must be an object whose 
properties are intended to override one or more properties in the `config` 
object consumed by the `Patternlab` constructor.

Keep in mind that configs overridden by an `options` argument will persist 
through all future operations on that `Patternlab` instance. In order to revert 
the configs back to the original configs, call `resetConfig` with the original 
configs.

Fepper is 100% compatible with Pattern Lab PHP Mustache code. It aims to 
maintain parity with the PHP distribution with respect to 
<a href="https://github.com/electric-eloquence/feplet-vs-patternlab-php" target="_blank">
performance and core features</a>.

### <a id="upfront-and-onscreen"></a>Upfront and Onscreen

Using this NPM decoupled from a full Fepper project requires compiling the UI by 
running this line of Node.js:

```javascript
patternlab.compile();
```

The word "compile" takes on a special meaning in Fepper, referring to assembling 
"components" into a whole. "Build" refers to outputting patterns to be displayed 
by the UI.

All aspects of the UI are available for customization. For example, the toolbar 
can accept additions, modifications, and deletions per the needs of end-users. 
The UI markup is compiled by recursive, functional React calls. The recursion 
tree is reflected by the directory structure containing the modules which 
compose the UI. To override any given module, copy the directory structure 
leading to the module from 
<a href="https://github.com/electric-eloquence/fepper-npm/tree/dev/ui/core/styleguide/index/html" target="_blank">
https&colon;//github.com/electric-eloquence/fepper-npm/tree/dev/ui/core/styleguide/index/html</a> 
to `source/_ui/index/html`, respective to your implementation. Modifications to 
modules in that directory will override the corresponding modules in core. 
Additions (so long as they are correctly nested) will also be recognized.

A working example of UI customization can be found at 
<a href="https://github.com/electric-eloquence/fepper-drupal/blob/dev/source/_ui/index/html/00-head/head.component.js" target="_blank">
https&colon;//github.com/electric-eloquence/fepper-drupal/blob/dev/source/_ui/index/html/00-head/head.component.js</a>. 
The Fepper for Drupal project overrides its HTML title to read "Fepper D8" 
instead of "Fepper". In order to do so, it has the `head.component.js` module 
nested in directories that correspond to the tags that nest the `head` HTML 
element. Both `head.component.js` and its nesting directories must be named 
similarly to their corresponding elements. `.component.js` indicates that the 
file is a module to be rendered by React. 
<a href="https://reactjs.org/docs/dom-elements.html" target="_blank">
It must export properties that `React.createElement()` understands</a>. 
The numeric prefix to `00-head` orders it to precede `01-body`, even though 
"body" precedes "head" alphabetically.

In this example, by allowing customizations in the `00-head` directory separate 
from the core components, core updates will be respected for all components 
except for the HTML head.

Browser JavaScript and CSS customizations can (and should) be componentized 
this way as well. While a head element is unlikely to have associated scripts or 
styles, the UI's main element does have its scripts and styles componentized as 
<a href="https://github.com/electric-eloquence/fepper-npm/tree/dev/ui/core/styleguide/index/html/01-body/40-main" target="_blank">
`main.js` and `main.css` in `index/html/01-body/40-main`</a>. A big advantage 
for this type of componentization comes when elements are renamed or deleted. 
When you rename or delete an element, are you _absolutely_ sure you'll rename 
or delete accordingly in some far-flung, monolithic script or style file?

Alas, no one should be _forced_ to componentize this way. Generic modifications 
to UI scripts can be added to `source/_scripts/ui-extender.js`.

Similarly, generic modifications to UI CSS can be added to 
`source/_styles/pattern-scaffolding.css`. (The file is named this way to adhere 
to <a href="https://patternlab.io/docs/pattern-states.html" target="_blank"> 
the Pattern Lab documentation on pattern states</a>. It should not be relied on 
for pattern scaffolding.)

View All markup can also be overridden by copying the `.mustache` files in 
<a href="https://github.com/electric-eloquence/fepper-npm/tree/dev/ui/core/styleguide/viewall" target="_blank">
https&colon;//github.com/electric-eloquence/fepper-npm/tree/dev/ui/core/styleguide/viewall</a> 
and pasting them to `source/_ui/viewall` (nested correctly). Modifications will 
then be recognized and displayed in the UI. (No additions are allowed.) Custom 
View All styles can be added to `source/_styles/pattern-scaffolding.css`.

You will need to compile the UI in order for the browser to pick up custom 
changes to the UI. Within a full Fepper project, this can be accomplished with 
the following command:

```shell
fp ui:compile
```

New UI customizations will not be picked up simply by restarting Fepper.

###  <a id="just-the-fepper-instance"></a>Just the Fepper Instance

While it is recommended that you use Fepper with the 
<a href="https://www.npmjs.com/package/fepper-cli" target="_blank">Fepper CLI</a>, 
and its `fp` command, you can alternatively instantiate a barebones Fepper 
instance:

```javascript
const cwd = process.cwd();
const Fepper = require('fepper');
const fepper = new Fepper(cwd);
```

`cwd` must contain `conf.yml`, `patternlab-config.json`, `pref.yml`, and the 
`source` and `public` directories.

There is currently no public API for object-oriented Fepper. To express demand 
for one, 
<a href="https://github.com/electric-eloquence/fepper/issues" target="_blank">
please open an issue</a>.
