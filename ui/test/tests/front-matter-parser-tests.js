'use strict';

const expect = require('chai').expect;
const fs = require('fs-extra');

const {
  patternlab,
  patternsDir
} = require('../init')();
const frontMatterParser = require('../../core/lib/front-matter-parser');

// Preprocess the patternlab object.
patternlab.preProcessAllPatterns(patternsDir);
patternlab.preProcessDataAndParams();

// Get test patterns.
const statePattern = patternlab.getPattern('test-foo');
const frontMatterPattern = patternlab.getPattern('test1-simple');

describe('Front Matter Parser', function () {
  it('should convert standard Front Matter into an array of objects', function () {
    const annotationFile = `${patternlab.config.paths.source.annotations}/annotation.md`;
    const annotationStr = fs.readFileSync(annotationFile, patternlab.enc);
    const annotationsArr = frontMatterParser.main(annotationStr);

    expect(annotationsArr[0].el).to.equal('#nav');
    expect(annotationsArr[0].title).to.equal('Navigation');
    expect(annotationsArr[0].annotation).to.equal('<p>Navigation for responsive web experiences can be tricky.</p>\n');
  });

  it('should parse .md files with Pattern Lab standard annotation delimiters', function () {
    const annotationFile = `${patternlab.config.paths.source.annotations}/multiple.md`;
    const annotationsStr = fs.readFileSync(annotationFile, patternlab.enc);
    const annotationsArr = frontMatterParser.main(annotationsStr);

    expect(annotationsArr[0].el).to.equal('.zero');
    expect(annotationsArr[0].title).to.equal('Zero');
    expect(annotationsArr[0].annotation).to.equal('<p>Zee ee are oh.</p>\n');

    expect(annotationsArr[1].el).to.equal('.one');
    expect(annotationsArr[1].title).to.equal('One');
    expect(annotationsArr[1].annotation).to.equal('<p>Oh en ee.</p>\n');

    expect(annotationsArr[2].el).to.equal('.two');
    expect(annotationsArr[2].title).to.equal('Two');
    expect(annotationsArr[2].annotation).to.equal('<p>Tee double-you oh.</p>\n');
  });

  describe('patternBuilder.setState', function () {
    it('should apply patternState when the .md file matches its pattern and it contains a "state" key', function () {
      expect(statePattern.patternState).to.equal('complete');
    });

    it('should apply patternState when the .md file has additional keys besides "state"', function () {
      expect(frontMatterPattern.patternState).to.equal('inprogress');
    });
  });

  describe('patternlab.preProcessDataAndParams', function () {
    const annotationsJs = `${patternlab.config.paths.public.annotations}/annotations.js`;
    let annotationsJsExistsBefore;
    let annotations;

    before(function () {
      if (fs.existsSync(annotationsJs)) {
        fs.removeSync(annotationsJs);
      }

      annotationsJsExistsBefore = fs.existsSync(annotationsJs);

      patternlab.preProcessDataAndParams();
      require(annotationsJs);

      annotations = global.annotations;
    });

    it('should write annotations.js', function () {
      const annotationsJsExistsAfter = fs.existsSync(annotationsJs);

      expect(annotationsJsExistsBefore).to.equal(false);
      expect(annotationsJsExistsAfter).to.equal(true);
    });

    it('should parse the Front Matter files in the source/_annotations directory', function () {
      expect(annotations[0].el).to.equal('#nav');
      expect(annotations[0].title).to.equal('Navigation');
      expect(annotations[0].annotation).to.equal('<p>Navigation for responsive web experiences can be tricky.</p>\n');

      expect(annotations[1].el).to.equal('.zero');
      expect(annotations[1].title).to.equal('Zero');
      expect(annotations[1].annotation).to.equal('<p>Zee ee are oh.</p>\n');

      expect(annotations[2].el).to.equal('.one');
      expect(annotations[2].title).to.equal('One');
      expect(annotations[2].annotation).to.equal('<p>Oh en ee.</p>\n');

      expect(annotations[3].el).to.equal('.two');
      expect(annotations[3].title).to.equal('Two');
      expect(annotations[3].annotation).to.equal('<p>Tee double-you oh.</p>\n');
    });

    it('should parse the Front Matter files in the source patterns directory', function () {
      expect(annotations[4].state).to.equal('complete');

      const expectation5 = `<h2 id="front-matter-with-annotations">Front Matter with annotations</h2>
<p>Foo cannot get simpler than Bar, amiright?</p>
`;

      expect(annotations[5].el).to.equal('#bar');
      expect(annotations[5].title).to.equal('Bar');
      expect(annotations[5].annotation).to.equal(expectation5);

      const expectation6 = `<h2 id="state-and-multiple-annotations">State and multiple annotations</h2>
<p>This pattern&#39;s .md file has both annotations and state.</p>
`;

      expect(annotations[6].el).to.equal('#title');
      expect(annotations[6].state).to.equal('inprogress');
      expect(annotations[6].title).to.equal('Title');
      expect(annotations[6].annotation).to.equal(expectation6);

      expect(annotations[7].el).to.equal('#message');
      expect(annotations[7].title).to.equal('Message');
      expect(annotations[7].annotation).to.equal('<p>This pattern has a message.</p>\n');
    });
  });
});
