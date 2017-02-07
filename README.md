## Fepper

# A frontend prototyper for the rapid prototyping of websites

### This is the NPM that powers these Fepper prototyper variants:
* [Fepper Main](https://github.com/electric-eloquence/fepper) - main project.
* [Fepper Base](https://github.com/electric-eloquence/fepper-base) - no unnecessary assets, styles, or Pattern Lab demo.
* [Fepper for Drupal](https://github.com/electric-eloquence/fepper-drupal) - templates configured for Drupal 8, along with a Drupal theme built to accommodate those templates.
* [Fepper for Windows](https://github.com/electric-eloquence/fepper-windows) - scripted to run on Windows.
* [Fepper for Wordpress](https://github.com/electric-eloquence/fepper-wordpress) - templates configured for WordPress, along with a WordPress theme built to accommodate those templates.

Please consult any of the above links for documentation on getting started and 
on power usage of Fepper.

To just run a Node.js variant of Pattern Lab, instantiate the `patternlab` 
object as follows:

```
const fs = require('fs');
const path = require('path');

const config = require('./patternlab-config.json');
const cwd = process.cwd();
const patternlab = new require('fepper/ui/core/lib/patternlab)(config, cwd);
```

The Fepper variant of the `patternlab` constructor recognizes a second parameter 
(a working directory parameter) for instantiating the `patternlab` object. This 
allows it to be instantiated from any directory within any task runner or 
third-party framework.

Fepper exposes these methods on the `patternlab` object:

* version: function ()
* build: function (callback, deletePatternDir)
* help: function ()
* patternsonly: function (callback, deletePatternDir)

Fepper is 100% compatible with Pattern Lab PHP Mustache code. It aims to 
maintain parity with the PHP project with respect to performance and core 
features.

Please report any bugs and submit contributions at 
https://github.com/electric-eloquence/fepper-npm
