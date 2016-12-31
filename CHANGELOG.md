# Fepper Changelog

### v0.19.6
* Installers out of npm

### v0.19.5
* Consulting conf to install extend, public and source dirs

### v0.19.4
* Including patternlab mustache engine

### v0.19.3
* Including patternlab engines

### v0.19.2
* Installation scripts refactored for fepper-npm
* fepper-npm refactored to work with refactored fepper-cli

### v0.19.1
* Correct node_module name

### v0.19.0
* Fepper core installed and updated via NPM

### v0.18.7
* Full Windows support

### v0.18.6
* Configurable backend, extend, and static dir locations
* Pattern Lab can be invoked from any working dir
* Style updates

### v0.18.5
* Fixing empty param syntax for document.querySelectorAll

### v0.18.4
* Reverted updated json annotations
* annotations.js for base profile

### v0.18.3
* Updated json annotations
* Resolving patternlab paths

### v0.18.2
* Using absolute paths for Fepper tasks for portability
* Using absolute paths for Pattern Lab tasks for portability
* Using promises in installer scripts for more linear listing of execution steps

### v0.18.1
* Extensible appDir location
* Beautifying static output
* Working hamburger menu in Pattern Lab demo

### v0.18.0
* Fewer large NPMs
* Moved non-essential core tasks to extensions
* Better gulp.watch

### v0.17.4
* JS Beautifier minimum version bump

### v0.17.3
* Retaining Mustache false conditions so their vars don't need to be explicitly defined as false

### v0.17.2
* Working unit tests and linting for forked Pattern Lab codebase

### v0.17.1
* Using json-eval npm

### v0.17.0
* Massive performance enhancements

### v0.16.8
* Fixed prism-typeahead.css and styleguide.css

### v0.16.7
* Fixed pseudopatterns
* Stronger static generator
* cacheBuster in footer

### v0.16.6
* Deleted unused js
* Deleted minified js and css
* Hard-coded title
* defaultPattern navigable
* Working viewall heading links

### v0.16.5
* Fixed links
* Fixed scraper
* Nav refreshes without restart
* Fixed unit tests

### v0.16.4
* Pointing patternlab-config.json defaultPattern to pages-homepage
* Checks partial names in both pattern lab php and node syntax

### v0.16.3
* Working templater

### v0.16.2
* Hidden patterns can have shown pseudopatterns
* JSON compiler bug fix
* Reverting to old minified patternlab-viewer.min.js
* HTTP caching controlled by user
* Working viewall

### v0.16.1
* Toolbar reverted to Pattern Lab v1
* Working Mustache Browser

### v0.16.0
* Upgrade to Pattern Lab v2

### v0.15.2
* 01-compounds/06-components -> 01-compounds/06-widgets

### v0.15.1
* Updated travis test
* Updated npm test

### v0.15.0
* source/_scripts/README update
* fp-ui -> ui
* Deleting legacy file
* source/_scripts/README update
* gulp -> tasker

### v0.14.1
* Readme update
* patternlab-node -> ui

### v0.14.0
* patternlab-node -> ui

### v0.13.0
* Removing excludes/extend/node_modules from version control
* Removing public/data/annotations.js from version control
* Working npm run install-base
* core/lib/webserved/style.css -> core/webserved/style.css

### v0.12.4
* Readme update
* Deleting favicon

### v0.12.3
* patternlab-config.json update
* Params more json-like
* Footer copyright update
* Stylus syntax update

### v0.12.2
* User-controlled no-cache meta tags

### v0.12.1
* camelCase -> snake_case
* Fixing "undefined" in title
* Specific gulp version

### v0.12.0
* New indexing convention for page variants
* Title says Fepper
* Reinstating no-cache meta tags
* Replace tildes with hyphens in patternlab paths

### v0.11.2
* fp once before publishing to GitHub Pages
* No-cache meta tags in pattern header
* Readme updates

### v0.11.1
* Better error prevention

### v0.11.0
* Working fp publish

### v0.10.6
* HTML Scraper to only open in new tab in Pattern Lab UI

### v0.10.5
* Fixing static links

### v0.10.4
* Templater more flexible

### v0.10.3
* Templater exposes method to export single files

### v0.10.2
* Deleting fp-import

### v0.10.1
* Working data watcher and fp restart tasks

### v0.10.0
* Namespacing frontend directories from backend directories

### v0.9.1
* fp-multisite update

### v0.9.0
* YAML and extension convention updates

### v0.8.9
* fp-import update

### v0.8.8
* Adding fp-import extension

### v0.8.7
* fp arguments can contain spaces

### v0.8.6
* package.json update

### v0.8.5
* Correcting multisite directory

### v0.8.4
* Renaming multisite to fp-multisite

### v0.8.3
* Templater strips leading newline from multiline yaml strings

### v0.8.2
* Templater does not maintain directory nesting for exceptional targets
* Frontend-copier does not maintain directory nesting for exceptional targets

### v0.8.1
* .gitignore update

### v0.8.0
* Using tilde in extend filenames as a namespace

### v0.7.2
* Extend updates

### v0.7.1
* Adding missing extend files

### v0.7.0
* Contributed extensions managed by NPM

### v0.6.4
* Adding missing multisite files

### v0.6.3
* Linting excludes/extend

### v0.6.2
* Fixing frontend-copier for minified js

### v0.6.1
* Updating ESLint configs

### v0.6.0
* Configurable frontend-copy

### v0.5.0
* New nomenclature

### v0.4.1
* HTML scraper excepts for malformed HTML

### v0.4.0
* Using minimal multisite subsite
* Replacing xml2js and xmldom with html2json and js-beautify
* Updating to gulp-eslint ^2.0.0

### v0.3.0
* Replacing abandoned gulp-livereload with supported gulp-refresh
* Scraper refinements
* Better scraper success msg
* templates_dir override and unit tests

### v0.2.4
* Updating multisite Pattern Lab

### v0.2.3
* Fixing multisite install

### v0.2.2
* Updating extend dir to use pref.yml

### v0.2.1
* Pattern lab update fixing inclusion of local listitem files

### v0.2.0
* Split conf.yml into conf.yml and pref.yml

### v0.1.1
* README update

### v0.1.0
* Task files in `/extend` renamed from `*_gulp.js` to `*_extend.js`
* Stronger regex parsing in Templater for partials submitted with params

### v0.0.1
* Initial release
