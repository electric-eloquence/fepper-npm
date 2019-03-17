'use strict';

const expect = require('chai').expect;
const fs = require('fs-extra');

const {
  patternlab
} = require('../init')();

const annotationsJs = `${patternlab.config.paths.public.annotations}/annotations.js`;

if (fs.existsSync(annotationsJs)) {
  fs.removeSync(annotationsJs);
}

const annotationsJsExistsBefore = fs.existsSync(annotationsJs);

describe('Annotations Builder', function () {
  let annotations;

  before(function () {
    patternlab.build();
    require(annotationsJs);

    annotations = global.annotations;
  });

  it('should write annotations.js', function () {
    const annotationsJsExistsAfter = fs.existsSync(annotationsJs);

    expect(annotationsJsExistsBefore).to.be.false;
    expect(annotationsJsExistsAfter).to.be.true;
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
