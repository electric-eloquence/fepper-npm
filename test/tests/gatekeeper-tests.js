'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

const {
  fepper,
  responseFactory
} = require('../init')();
const gatekeeper = fepper.tcpIp.fpExpress.gatekeeper;
const opener = fepper.tasks.opener;

const timestampFile = `${global.rootDir}/.timestamp`;
const timestampLockFile = `${global.rootDir}/.timestamp.lock`;

describe('Gatekeeper', function () {
  let timestampFromFile;

  before(function () {
    fs.removeSync(timestampFile);

    timestampFromFile = opener.timestamp();
  });

  after(function () {
    fs.removeSync(timestampFile);
  });

  describe('.gatekeep()', function () {
    beforeEach(function () {
      fs.removeSync(timestampLockFile);
    });

    it('returns the timestamp when cookie matches timestamp file', function () {
      const timestampFromCookie = gatekeeper.gatekeep({
        cookies: {
          fepper_ts: timestampFromFile
        }
      });

      expect(timestampFromCookie).to.equal(timestampFromFile);
    });

    it('returns empty string when cookie does match timestamp file', function () {
      const timestampFromCookie = gatekeeper.gatekeep({
        cookies: {
          fepper_ts: '1234567890'
        }
      });

      expect(timestampFromCookie).to.be.undefined;
    });

    it('returns empty string when no cookie', function () {
      const timestampFromCookie = gatekeeper.gatekeep({
        cookies: {
        }
      });

      expect(timestampFromCookie).to.be.undefined;
    });

    it('returns empty string when no timestamp file', function () {
      fs.removeSync(timestampFile);

      const timestampFromCookie = gatekeeper.gatekeep({
        cookies: {
        }
      });

      expect(timestampFromCookie).to.be.undefined;

      fs.writeFileSync(timestampFile, timestampFromFile);
    });
  });

  describe('.render()', function () {
    it('responds with "forbidden" page', function (done) {
      new Promise(
        (resolve) => {
          gatekeeper.render('the HTML Scraper')(
            {},
            responseFactory(resolve)
          );
        })
        .then((response) => {
          /* eslint-disable max-len */
          expect(response.responseText).to.equal(`
<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"></head>
  <body>

    <section id="forbidden" class="error forbidden gatekept">
      <p>ERROR! You can only use the HTML Scraper on the machine that is running this Fepper instance!</p>
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
  });

  describe('.respond()', function () {
    it('responds with a 403 if no timestamp cookie submitted', function (done) {
      new Promise(
        (resolve) => {
          gatekeeper.respond()(
            {
              query: {
                tool: 'the HTML Scraper'
              }
            },
            responseFactory(resolve)
          );
        })
        .then((response) => {
          expect(response.status).to.equal(403);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('responds with a 403 if incorrect timestamp cookie submitted', function (done) {
      new Promise(
        (resolve) => {
          gatekeeper.respond()(
            {
              cookies: {
                fepper_ts: 42
              },
              query: {
                tool: 'the HTML Scraper'
              }
            },
            responseFactory(resolve)
          );
        })
        .then((response) => {
          expect(response.status).to.equal(403);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('responds with a 403 if correct timestamp cookie submitted too soon after incorrect cookie', function (done) {
      new Promise(
        (resolve) => {
          gatekeeper.respond()(
            {
              cookies: {
                fepper_ts: timestampFromFile
              },
              query: {
                tool: 'the HTML Scraper'
              }
            },
            responseFactory(resolve)
          );
        })
        .then((response) => {
          expect(response.status).to.equal(403);

          fs.removeSync(`${fepper.options.rootDir}/.timestamp.lock`);

          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('responds with timestamp if correct timestamp cookie submitted', function (done) {
      new Promise(
        (resolve) => {
          gatekeeper.respond()(
            {
              cookies: {
                fepper_ts: timestampFromFile
              },
              query: {
                tool: 'the HTML Scraper'
              }
            },
            responseFactory(resolve)
          );
        })
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.responseText).to.equal(timestampFromFile);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
