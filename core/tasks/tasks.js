'use strict';

const Appendixer = require('./appendixer');
const FrontendCopier = require('./frontend-copier');
const Helper = require('./helper');
const Installer = require('./installer');
const JsonCompiler = require('./json-compiler');
const Opener = require('./opener');
const StaticGenerator = require('./static-generator');
const Templater = require('./templater');
const Updater = require('./updater');
const Versioner = require('./versioner');

module.exports = class {
  constructor(options) {
    this.options = options;
    this.appendixer = new Appendixer(options);
    this.frontendCopier = new FrontendCopier(options);
    this.helper = new Helper(options);
    this.installer = new Installer(options);
    this.jsonCompiler = new JsonCompiler(options);
    this.opener = new Opener(options);
    this.staticGenerator = new StaticGenerator(options);
    this.templater = new Templater(options);
    this.updater = new Updater(options);
    this.versioner = new Versioner(options);
  }

  appendix() {
    this.appendixer.main();
  }

  frontendCopy(frontendType) {
    this.frontendCopier.main(frontendType);
  }

  jsonCompile() {
    this.jsonCompiler.main();
  }

  open() {
    this.opener.main();
  }

  staticGenerate() {
    this.staticGenerator.main();
  }

  template() {
    this.templater.main();
  }

  update() {
    this.updater.main();
  }

  version() {
    this.versioner.main();
  }
};
