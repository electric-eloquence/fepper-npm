'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

const {
  patternlab
} = require('../init')();


describe('Annotations Builder', function () {
  const annotationsJs = `${patternlab.config.paths.public.annotations}/annotations.js`;
  let annotations;
  let annotationsJsExistsBefore;

  before(function () {
    if (fs.existsSync(annotationsJs)) {
      fs.removeSync(annotationsJs);
    }

    annotationsJsExistsBefore = fs.existsSync(annotationsJs);

    patternlab.build();
    require(annotationsJs);

    annotations = global.annotations;
  });

  after(function () {
    // Trigger annotations build to cover an if condition checking for existing annotationsJs. Completes code coverage.
    patternlab.annotationsBuilder.main();
  });

  it('writes annotations.js', function () {
    const annotationsJsExistsAfter = fs.existsSync(annotationsJs);

    expect(annotationsJsExistsBefore).to.be.false;

    expect(annotationsJsExistsAfter).to.be.true;
  });

  it('parses the Front Matter files in the source/_annotations directory', function () {
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

  it('parses the Front Matter files for annotations in the source patterns directory', function () {
    const expectation4 = `<h2 id="front-matter-with-annotations">Front Matter with annotations</h2>
<p>Foo cannot get simpler than Bar, amiright?</p>
`;

    expect(annotations[4].el).to.equal('#bar');
    expect(annotations[4].title).to.equal('Bar');
    expect(annotations[4].annotation).to.equal(expectation4);

    const expectation5 = `<h2 id="state-and-multiple-annotations">State and multiple annotations</h2>
<p>This pattern&#39;s .md file has both annotations and state.</p>
`;

    expect(annotations[5].el).to.equal('#title');
    expect(annotations[5].state).to.equal('inprogress');
    expect(annotations[5].title).to.equal('Title');
    expect(annotations[5].annotation).to.equal(expectation5);

    const expectation6 = '<p>This pattern has a message.</p>\n';

    expect(annotations[6].el).to.equal('#message');
    expect(annotations[6].title).to.equal('Message');
    expect(annotations[6].annotation).to.equal(expectation6);

    const expectation7 = '<p>Main content</p>\n';

    expect(annotations[7].el).to.equal('#main');
    expect(annotations[7].title).to.equal('Main');
    expect(annotations[7].annotation).to.equal(expectation7);
  });
});
