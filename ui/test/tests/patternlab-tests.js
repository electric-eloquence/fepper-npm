'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

const {
  dataDir,
  patternlab,
  patternsDir
} = require('../init')();

// Preprocess the patternlab object.
patternlab.preProcessAllPatterns(patternsDir);

describe('Patternlab', function () {
  describe('.buildPatternData()', function () {
    it('parses the data.json file into a JavaScript object', function () {
      // Build pattern data and get data result.
      const dataResult = patternlab.buildPatternData(dataDir);

      expect(dataResult).to.be.an.instanceof(Object);
      expect(dataResult.data).to.equal('test');
      expect(dataResult.dot.notation.test).to.equal('foo');
    });
  });

  describe('.build()', function () {
    const publicAltPatterns = patternlab.config.paths.public.patterns.replace('public/patterns', 'public-alt/patterns');

    let configOrigClone;

    before(function () {
      configOrigClone = JSON.parse(JSON.stringify(patternlab.config));

      const hashesFileOrig = `${configOrigClone.paths.public.patterns}/hashes.json`;

      if (fs.existsSync(hashesFileOrig)) {
        fs.removeSync(hashesFileOrig);
      }

      patternlab.build();
    });

    after(function () {
      patternlab.resetConfig(configOrigClone);
      fs.removeSync(publicAltPatterns);
    });

    it('builds patterns with modified configuration', function () {
      // Configuration permutations are tested in .resetConfig() tests.
      patternlab.build({
        paths: {
          public: {
            patterns: publicAltPatterns
          }
        },
        pathsRelative: {
          public: {
            patterns: 'public-alt/patterns'
          }
        },
        cacheBust: true,
        cleanPublic: false
      });

      const fooOrig = `${configOrigClone.paths.public.patterns}/00-test-00-foo/00-test-00-foo.html`;
      const fooOrigContent = fs.readFileSync(fooOrig, patternlab.config.enc);
      const fooAlt = `${patternlab.config.paths.public.patterns}/00-test-00-foo/00-test-00-foo.html`;
      const fooAltContent = fs.readFileSync(fooAlt, patternlab.config.enc);
      const scriptTagStr = '<script src="../../annotations/annotations.js"></script>';
      const scriptTagRegex = /<script src="\.\.\/\.\.\/annotations\/annotations\.js\?\d+"><\/script>/;

      expect(fooOrigContent).to.have.string(scriptTagStr);
      expect(fooOrigContent).to.not.match(scriptTagRegex);
      expect(fooAltContent).to.not.have.string(scriptTagStr);
      expect(fooAltContent).to.match(scriptTagRegex);
    });

    it('replaces cacheBuster tags with empty string in viewalls', function () {
      // viewallOrig should have been written by previous test.
      const viewallOrig = `${configOrigClone.paths.public.patterns}/viewall/viewall.html`;
      const viewallOrigContent = fs.readFileSync(viewallOrig, patternlab.config.enc);
      const viewallAlt = `${patternlab.config.paths.public.patterns}/viewall/viewall.html`;
      const viewallAltContent = fs.readFileSync(viewallAlt, patternlab.config.enc);
      const scriptTagStr = '<script src="../../annotations/annotations.js"></script>';
      const scriptTagRegex = /<script src="\.\.\/\.\.\/annotations\/annotations\.js\?\d+"><\/script>/;

      expect(viewallOrigContent).to.have.string(scriptTagStr);
      expect(viewallOrigContent).to.not.match(scriptTagRegex);
      expect(viewallAltContent).to.have.string(scriptTagStr);
      expect(viewallAltContent).to.not.match(scriptTagRegex);
    });

    it('correctly renders tags written in dot.notation', function () {
      const dotNotationTest = `${patternlab.config.paths.public.patterns}/01-test1-08-dot-notation/01-test1-08-dot-notation.markup-only.html`;
      const dotNotationTestContent = fs.readFileSync(dotNotationTest, patternlab.config.enc);

      expect(dotNotationTestContent).to.equal('  foo    foo   foo  foo ');
    });
  });

  describe('.compile()', function () {
    let configOrigClone;

    before(function () {
      configOrigClone = JSON.parse(JSON.stringify(patternlab.config));
    });

    after(function () {
      patternlab.resetConfig(configOrigClone);
    });

    it('compiles the UI with modified configuration', function () {
      // Configuration permutations are tested in .resetConfig() tests.
      patternlab.compile({
        paths: {
          source: {
            ui: patternlab.config.paths.source.ui + '-alt'
          },
          public: {
            root: patternlab.config.paths.public.root + '-alt'
          }
        },
        pathsRelative: {
          source: {
            ui: patternlab.config.pathsRelative.source.ui + '-alt'
          },
          public: {
            root: patternlab.config.pathsRelative.public.root + '-alt'
          }
        }
      });

      // uiIndexOrig should have been written by previous test.
      const uiIndexOrig = `${configOrigClone.paths.public.root}/index.html`;
      const uiIndexOrigContent = fs.readFileSync(uiIndexOrig, patternlab.config.enc);
      const uiIndexAlt = `${patternlab.config.paths.public.root}/index.html`;
      const uiIndexAltContent = fs.readFileSync(uiIndexAlt, patternlab.config.enc);
      const testString = `<head id="patternlab-head">
<title id="title">Fepper</title>
<meta charset="UTF-8">
</head>`;

      expect(uiIndexOrigContent).to.not.have.string(testString);
      expect(uiIndexAltContent).to.have.string(testString);
    });
  });

  describe('.getPattern()', function () {
    it('matches by type-pattern shorthand syntax', function () {
      const result = patternlab.getPattern('test-nav');

      expect(result.patternPartial).to.equal('test-nav');
    });

    it('matches by full relative path', function () {
      const result = patternlab.getPattern('00-test/00-foo.mustache');

      expect(result.relPath).to.equal('00-test/00-foo.mustache');
    });

    it('matches by relative path minus extension', function () {
      const result = patternlab.getPattern('00-test/00-foo');

      expect(result.relPathTrunc).to.equal('00-test/00-foo');
    });
  });

  describe('.help()', function () {
    it('should output task descriptions', function () {
      patternlab.help();
    });
  });

  describe('.resetConfig()', function () {
    let configOrigClone;
    let rootOrig;

    before(function () {
      configOrigClone = JSON.parse(JSON.stringify(patternlab.config));
      rootOrig = patternlab.config.paths.source.root;
    });

    after(function () {
      patternlab.resetConfig(configOrigClone);
    });

    it('resets multiple configuration values', function () {
      const cacheBustBefore = patternlab.config.cacheBust;
      const rootBefore = patternlab.config.paths.source.root;

      patternlab.resetConfig({
        paths: {
          source: {
            root: 'test/root'
          }
        },
        cacheBust: true
      });

      const cacheBustAfter = patternlab.config.cacheBust;
      const rootAfter = patternlab.config.paths.source.root;

      expect(cacheBustBefore).to.not.equal(cacheBustAfter);
      expect(rootBefore).to.not.equal(rootAfter);

      expect(cacheBustAfter).to.be.true;
      expect(rootAfter).to.equal('test/root');
    });

    it('resets a single non-nested configuration value', function () {
      const cacheBustBefore = patternlab.config.cacheBust;

      patternlab.resetConfig({cacheBust: false});

      const cacheBustAfter = patternlab.config.cacheBust;

      expect(cacheBustBefore).to.not.equal(cacheBustAfter);

      expect(cacheBustAfter).to.be.false;
    });

    it('resets a single nested configuration value', function () {
      const rootBefore = patternlab.config.paths.source.root;

      patternlab.resetConfig({
        paths: {
          source: {
            root: rootOrig
          }
        }
      });

      const rootAfter = patternlab.config.paths.source.root;

      expect(rootBefore).to.not.equal(rootAfter);

      expect(rootAfter).to.equal(rootOrig);
    });

    it('adds multiple configuration values', function () {
      const fooBefore = patternlab.config.foo;
      const barBefore = patternlab.config.paths.source.bar;

      patternlab.resetConfig({
        foo: 'foo',
        paths: {
          source: {
            bar: 'test/bar'
          }
        }
      });

      const fooAfter = patternlab.config.foo;
      const barAfter = patternlab.config.paths.source.bar;

      expect(fooBefore).to.be.undefined;
      expect(barBefore).to.be.undefined;

      expect(fooAfter).to.equal('foo');
      expect(barAfter).to.equal('test/bar');
    });

    it('adds a single non-nested configuration value', function () {
      const bazBefore = patternlab.config.baz;

      patternlab.resetConfig({baz: 'baz'});

      const bazAfter = patternlab.config.baz;

      expect(bazBefore).to.be.undefined;

      expect(bazAfter).to.equal('baz');
    });

    it('adds a single nested configuration value', function () {
      const bezBefore = patternlab.config.paths.source.bez;

      patternlab.resetConfig({
        paths: {
          source: {
            bez: 'test/bez'
          }
        }
      });

      const bezAfter = patternlab.config.paths.source.bez;

      expect(bezBefore).to.be.undefined;

      expect(bezAfter).to.equal('test/bez');
    });

    it('leaves other configuration values alone', function () {
      delete patternlab.config.foo;
      delete patternlab.config.paths.source.bar;
      delete patternlab.config.baz;
      delete patternlab.config.paths.source.bez;

      const configResetClone = JSON.parse(JSON.stringify(patternlab.config));
      const pathsOrigClone = JSON.parse(JSON.stringify(configOrigClone.paths));
      const pathsResetClone = JSON.parse(JSON.stringify(patternlab.config.paths));

      delete configOrigClone.paths;
      delete configResetClone.paths;

      expect(JSON.stringify(configOrigClone)).to.equal(JSON.stringify(configResetClone));
      expect(JSON.stringify(pathsOrigClone)).to.equal(JSON.stringify(pathsResetClone));
    });
  });
});
