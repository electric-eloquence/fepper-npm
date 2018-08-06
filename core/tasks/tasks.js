'use strict';

const Appendixer = require('./appendixer');
const FrontendCopier = require('./frontend-copier');
const JsonCompiler = require('./json-compiler');
const Opener = require('./opener');
const StaticGenerator = require('./static-generator');
const Templater = require('./templater');

module.exports = class {
  constructor(options) {
    this.appendixer = new Appendixer(options);
    this.frontendCopier = new FrontendCopier(options);
    this.jsonCompiler = new JsonCompiler(options);
    this.opener = new Opener(options);
    this.staticGenerator = new StaticGenerator(options);
    this.templater = new Templater(options);
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
};
