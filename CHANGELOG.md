# Fepper Changelog

### v0.27.3
* Deprecated `compileui`, replaced with just `compile`
* Documentation updated to reflect that

### v0.27.2
* Fixed fatal watch task error in Windows 10

### v0.27.1
* Fixed watching of patterns
* Mustache browser:
  * Replaced "back" text with arrow
  * Linked pattern title to pattern page
  * Restores pattern browsing when using back buttons to exit Mustache browser
  * History works with pattern title link
* Omitting scrape directory from viewall
* Removed debug argument from patternlab.build()
* Removed ui:patternsonly task
* In windows:
  * Fixed scroll behavior of annotations and code toggles on viewall pages
  * Fixed Mustache Browser code rendering

### v0.27.0
* Mustache browser:
  * Back button
  * Browser history backward and forward functionality
  * Links enabled for shorthand pattern partial syntax
* Code and annotations panels
  * Disabled for Mustache browser
  * Enabled for each pattern in a View All
  * Opens on page load if configured to do so
* Removed gulp entirely from fepper-npm
* Can submit CLI switch to run in debug mode
* Works with file protocol
* Fepper class can be instantiated more easily

### v0.26.4
* Minor syntax improvements to code
* Fixing static-generator bug

### v0.26.3
* Stronger logic for extension tasks, particularly if they are missing

### v0.26.2
* Differentiating extend dirs for base and main profiles
  * Base profile does not install `fp-stylus`
  * Main profile does install `fp-stylus`

### v0.26.1
* Changed name of exposed Express app from global.express to global.expressApp
* Ensuring that only one instance of global.expressApp gets initialized

### v0.26.0
* Reduced number of vulnerable dependencies
* Gatekeeping HTML Scraper functionality to local machine
* More robust HTML Scraper with regard to non-standard HTML
* More es5 -> es6
* Pattern Lab Mocha tests
* Refactored UI client-side JS to be stricter, in es6, linted, and abiding by Fepper's standards
* Working UI keyboard shortcuts
* Fixed UI optional features like grow animation
* UI style updates
* Dropped support for JSON annotations
* Entire app is object-oriented
* Stylus enabled by default
* Cross-platform fonts
* Performance improvements
* Breaking out self-contained utils into fepper-utils NPM

### v0.25.5
* Providing stronger data context to Feplet when preprocessing partials
* Bumping Feplet version to accommodate this

### v0.25.4
* Bumping Feplet version
* Refined browserification of React component functions

### v0.25.3
* Ensures last pattern in iteration order for shorthand notation gets saved as partial template for that name

### v0.25.2
* Fixed menu paths in Windows

### v0.25.1
* Fixed bug on empty annotations

### v0.25.0
* Complete refactor of old Pattern Lab Node.js code
* Replaced old RegExp based templating with Feplet
* Modernized React usage to eliminate deprecation warnings
* Renamed compileUi to compileui
* Removed compileUiOnEveryBuild
* Added fp ui:compileui task

### v0.24.4
* Improved static generator
* Improved pattern configurer (currently only devoted to LiveReload)
* Improved success page

### v0.24.3
* More platform agnostic paths

### v0.24.2
* Windows installer also installs 32-bit msi

### v0.24.1
* Platform agnostic paths

### v0.24.0
* Excepting for missing readme when rendering success page
* Upping min supported node version
* Replacing marked with 8fold-marked

### v0.23.13
* Adding Fepper logo to readme
* Upping minimum recommended Node version to 8.5.0
* Linting and testing

### v0.23.12
* Allow for missing readme when rendering success page
* ESLint refactor
* Accommodating npm linked development
* child\_process.spawnSync instead of execSync
* Better installation and requiring of extensions
* cleanPublic config cleans for more of public dir
* Husky Git hooks

### v0.23.11
* Stylus refactor

### v0.23.10
* `fp up` alias for `fp update`
* Upping node version in installer

### v0.23.9
* Default params in patternlab.js

### v0.23.8
* Hiding elements in print view
* `fp update` updates fepper-cli
* Unit testing NPMs installed as devDependencies
* `.gitignore` update
* Readme updates

### v0.23.7
* Pattern refactor in main profile

### v0.23.6
* Style updates
* h1 tag on homepage

### v0.23.5
* text-decoration on anchor elements

### v0.23.4
* Fixed installer
* Restricting testing packages to specific version
* Pattern rearrangement and refactor
* Header style updates

### v0.23.3
* Image and form style updates
* Readme update

### v0.23.2
* Form style update

### v0.23.1
* Readme update

### v0.23.0
* Fixing ui header styles in very small viewports
* fepper.ps1 works on windows 7
* UI customization instructions in readme
* Annotations in .md instead of .js
* Annotations allowed locally per pattern
* Fixing xss vulnerability from marked npm
* ui:compile runs on install and update
* Stylus reorg

### v0.22.5
* Organize Stylus partials to correspond to their respective patterns
* `fp help` task
* `fp version` task

### v0.22.4
* Style updates to main profile patterns
* Style updates to UI toolbar

### v0.22.3
* Fixing console messages with string replacement
* Replacing logo.png with logo.svg

### v0.22.2
* Style improvements
* Compile and build mean distinct things
* Improvements to mustache browser
* HTML scraper writes easier to import data

### v0.22.1
* Same dir structure to syncback \_styles as \_assets and \_scripts

### v0.22.0
* UI componentized and built by React so it can be user customized

### v0.21.7
* Minor maintenance

### v0.21.6
* Working html-scraper-post.js
* HTML scraper to ES6 conventions and object-oriented
* ESLinting Mocha scripts

### v0.21.5
* Pattern Lab dependencies to get npm installed as dependencies and not devDependencies
* 2nd arg for patternlab.build
* Installer runs npm install in extend dir if extend exists but extend/node_modules doesn't
* Correct styleguide pathing
* Accommodating UI corrections

### v0.21.4
* README corrections

### v0.21.3
* Minor update to bp defaults
* New paths.public.styleguideHtml property in patternlab-config.json

### v0.21.2
* fs.appendFileSync -> fs.writeFileSync in pattern-configurer.js

### v0.21.1
* Excepting styles in frontend-copy to not write to nested bld dir

### v0.21.0
* Fepper server-side, client-side, and extensions as NPMs
