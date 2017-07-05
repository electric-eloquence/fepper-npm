# Fepper Changelog

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
