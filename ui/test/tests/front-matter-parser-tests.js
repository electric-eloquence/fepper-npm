'use strict';

const expect = require('chai').expect;
const fs = require('fs-extra');

const {
  patternlab,
  patternsDir
} = require('../test-harness')();
const frontMatterParser = require('../../core/lib/front-matter-parser');

// Preprocess the patternlab object.
patternlab.preprocessAllPatterns(patternsDir);
patternlab.preprocessDataAndParams();

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
    expect(annotationsArr[0].comment).to.equal('<p>Navigation for responsive web experiences can be tricky.</p>\n');
  });

  it('should parse .md files with Pattern Lab standard annotation delimiters', function () {
    const annotationFile = `${patternlab.config.paths.source.annotations}/multiple.md`;
    const annotationsStr = fs.readFileSync(annotationFile, patternlab.enc);
    const annotationsArr = frontMatterParser.main(annotationsStr);

    expect(annotationsArr[0].el).to.equal('.zero');
    expect(annotationsArr[0].title).to.equal('Zero');
    expect(annotationsArr[0].comment).to.equal('<p>Zee ee are oh.</p>\n');

    expect(annotationsArr[1].el).to.equal('.one');
    expect(annotationsArr[1].title).to.equal('One');
    expect(annotationsArr[1].comment).to.equal('<p>Oh en ee.</p>\n');

    expect(annotationsArr[2].el).to.equal('.two');
    expect(annotationsArr[2].title).to.equal('Two');
    expect(annotationsArr[2].comment).to.equal('<p>Tee double-you oh.</p>\n');
  });

  describe('patternAssembler.setState', function () {
    it('should apply patternState when the .md file matches its pattern and it contains a "state" key', function () {
      expect(statePattern.patternState).to.equal('complete');
    });

    it('should apply patternState when the .md file has additional keys besides "state"', function () {
      expect(frontMatterPattern.patternState).to.equal('inprogress');
    });
  });

  describe('uiBuilder', function () {
    const annotationsJs = `${patternlab.config.paths.public.annotations}/annotations.js`;

    if (fs.existsSync(annotationsJs)) {
      fs.unlinkSync(annotationsJs);
    }

    const annotationsJsExistsBefore = fs.existsSync(annotationsJs);

    function compileui() {
      return patternlab.compileui()
        .then(() => {
          patternlab.uiBuilder.main();
        });
    }

    let comments;

    before(async function () {
      await compileui();
      require(annotationsJs);

      comments = global.comments;
    });

    it('should write annotations.js', function () {
      const annotationsJsExistsAfter = fs.existsSync(annotationsJs);

      expect(annotationsJsExistsBefore).to.equal(false);
      expect(annotationsJsExistsAfter).to.equal(true);
    });

    it('should parse the Front Matter files in the source annotations directory', function () {
      expect(comments[0].el).to.equal('#nav');
      expect(comments[0].title).to.equal('Navigation');
      expect(comments[0].comment).to.equal('<p>Navigation for responsive web experiences can be tricky.</p>\n');

      expect(comments[1].el).to.equal('.zero');
      expect(comments[1].title).to.equal('Zero');
      expect(comments[1].comment).to.equal('<p>Zee ee are oh.</p>\n');

      expect(comments[2].el).to.equal('.one');
      expect(comments[2].title).to.equal('One');
      expect(comments[2].comment).to.equal('<p>Oh en ee.</p>\n');

      expect(comments[3].el).to.equal('.two');
      expect(comments[3].title).to.equal('Two');
      expect(comments[3].comment).to.equal('<p>Tee double-you oh.</p>\n');
    });

    it('should parse the Front Matter files in the source patterns directory', function () {
      expect(comments[4].state).to.equal('complete');

      const expectation5 = `<h2 id="front-matter-with-annotations">Front Matter with annotations</h2>
<p>Foo cannot get simpler than Bar, amiright?</p>
`;

      expect(comments[5].el).to.equal('#bar');
      expect(comments[5].title).to.equal('Bar');
      expect(comments[5].comment).to.equal(expectation5);

      const expectation6 = `<h2 id="state-and-multiple-annotations">State and multiple annotations</h2>
<p>This pattern&#39;s .md file has both annotations and state.</p>
`;

      expect(comments[6].el).to.equal('#title');
      expect(comments[6].state).to.equal('inprogress');
      expect(comments[6].title).to.equal('Title');
      expect(comments[6].comment).to.equal(expectation6);

      expect(comments[7].el).to.equal('#message');
      expect(comments[7].title).to.equal('Message');
      expect(comments[7].comment).to.equal('<p>This pattern has a message.</p>\n');
    });
  });
});
