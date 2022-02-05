'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

const {
  fepper,
  responseFactory
} = require('../init')();
const enc = fepper.conf.enc;
const opener = fepper.tasks.opener;
const patternsDir = fepper.conf.ui.paths.source.patterns;

const MarkdownEditorPost = require('../../core/tcp-ip/markdown-editor-post');

const markdownEdited = `---
content_key: content
---
[Template](../../patterns/03-templates-00-homepage/03-templates-00-homepage.html)
edited
`;
const mdFile = `${patternsDir}/04-pages/00-homepage.md`;

describe('Markdown Editor Post', function () {
  describe('.main()', function () {
    let timestampFromFile;

    before(function () {
      timestampFromFile = opener.timestamp();

      fs.removeSync(mdFile);
    });

    after(function () {
      fs.removeSync(mdFile);
    });

    it('responds with a 403 if no timestamp cookie submitted', function (done) {
      new Promise(
        (resolve) => {
          const markdownEditorPost = new MarkdownEditorPost(
            {
              body: {
              }
            },
            responseFactory(resolve),
            fepper.tcpIp.fpExpress
          );

          markdownEditorPost.main();
        })
        .then((response) => {
          expect(response.status).to.equal(403);
          /* eslint-disable max-len */
          expect(response.responseText).to.equal(`
<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"></head>
  <body>

    <section id="forbidden" class="error">
      <p>ERROR! You can only use the Markdown Editor on the machine that is running this Fepper instance!</p>
      <p>If you <em>are</em> on this machine, you may need to resync this browser with Fepper.</p>
      <p>Please go to the command line and quit this Fepper instance. Then run fp (not fp restart).</p>
    </section>
  </body>
</html>`);
          /* eslint-enable max-len */
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('responds with a 403 if incorrect timestamp cookie submitted', function (done) {
      new Promise(
        (resolve) => {
          const markdownEditorPost = new MarkdownEditorPost(
            {
              body: {
              },
              cookies: {
                fepper_ts: 42
              }
            },

            responseFactory(resolve),
            fepper.tcpIp.fpExpress
          );

          markdownEditorPost.main();
        })
        .then((response) => {
          expect(response.status).to.equal(403);
          /* eslint-disable max-len */
          expect(response.responseText).to.equal(`
<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"></head>
  <body>

    <section id="forbidden" class="error">
      <p>ERROR! You can only use the Markdown Editor on the machine that is running this Fepper instance!</p>
      <p>If you <em>are</em> on this machine, you may need to resync this browser with Fepper.</p>
      <p>Please go to the command line and quit this Fepper instance. Then run fp (not fp restart).</p>
    </section>
  </body>
</html>`);
          /* eslint-enable max-len */
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('responds with a 403 if correct timestamp cookie submitted too soon after incorrect cookie', function (done) {
      new Promise(
        (resolve) => {
          const markdownEditorPost = new MarkdownEditorPost(
            {
              body: {
              },
              cookies: {
                fepper_ts: timestampFromFile
              }
            },

            responseFactory(resolve),
            fepper.tcpIp.fpExpress
          );

          markdownEditorPost.main();
        })
        .then((response) => {
          expect(response.status).to.equal(403);
          /* eslint-disable max-len */
          expect(response.responseText).to.equal(`
<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"></head>
  <body>

    <section id="forbidden" class="error">
      <p>ERROR! You can only use the Markdown Editor on the machine that is running this Fepper instance!</p>
      <p>If you <em>are</em> on this machine, you may need to resync this browser with Fepper.</p>
      <p>Please go to the command line and quit this Fepper instance. Then run fp (not fp restart).</p>
    </section>
  </body>
</html>`);

          fs.removeSync(`${global.rootDir}/.timestamp.lock`);

          /* eslint-enable max-len */
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('responds with a 500 if no markdown_edited submitted', function (done) {
      new Promise(
        (resolve) => {
          const markdownEditorPost = new MarkdownEditorPost(
            {
              body: {
                markdown_source: '04-pages/00-homepage.md'
              },
              cookies: {
                fepper_ts: timestampFromFile
              }
            },
            responseFactory(resolve),
            fepper.tcpIp.fpExpress
          );

          markdownEditorPost.main();
        })
        .then((response) => {
          expect(response.status).to.equal(500);
          expect(JSON.parse(response.responseText).message).to.equal('typeof this.markdownEdited !== \'string\'');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('responds with a 500 if no markdown_source submitted', function (done) {
      new Promise(
        (resolve) => {
          const markdownEditorPost = new MarkdownEditorPost(
            {
              body: {
                markdown_edited: markdownEdited
              },
              cookies: {
                fepper_ts: timestampFromFile
              }
            },
            responseFactory(resolve),
            fepper.tcpIp.fpExpress
          );

          markdownEditorPost.main();
        })
        .then((response) => {
          expect(response.status).to.equal(500);
          expect(JSON.parse(response.responseText).message).to.equal('typeof this.markdownSource !== \'string\'');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('responds with a 500 if no markdown file in file system', function (done) {
      new Promise(
        (resolve) => {
          const markdownEditorPost = new MarkdownEditorPost(
            {
              body: {
                markdown_edited: markdownEdited,
                markdown_source: '04-pages/00-homepage.md'
              },
              cookies: {
                fepper_ts: timestampFromFile
              }
            },
            responseFactory(resolve),
            fepper.tcpIp.fpExpress
          );

          markdownEditorPost.main();
        })
        .then((response) => {
          expect(response.status).to.equal(500);
          expect(JSON.parse(response.responseText).message).to.include('ENOENT: no such file or directory');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('responds with a 200 if correct data were posted and markdown file exists', function (done) {
      let mdFileContentsBefore;

      new Promise(
        (resolve, reject) => {
          fs.copy(`${mdFile}-bak`, mdFile, (err) => {
            if (err) {
              reject(err);
            }

            mdFileContentsBefore = fs.readFileSync(mdFile, enc);

            resolve();
          });
        })
        .then(() => {
          return new Promise((resolve) => {
            const markdownEditorPost = new MarkdownEditorPost(
              {
                body: {
                  markdown_edited: markdownEdited,
                  markdown_source: '04-pages/00-homepage.md'
                },
                cookies: {
                  fepper_ts: timestampFromFile
                }
              },
              responseFactory(resolve),
              fepper.tcpIp.fpExpress
            );

            markdownEditorPost.main();
          });
        })
        .then((response) => {
          const mdFileContentsAfter = fs.readFileSync(mdFile, enc);

          expect(response.status).to.equal(200);
          expect(mdFileContentsBefore).to.not.include('edited');
          expect(mdFileContentsAfter).to.include('edited');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
