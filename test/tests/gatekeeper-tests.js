'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

require('../init');

const gatekeeper = global.fepper.tcpIp.fpExpress.gatekeeper;
const opener = global.fepper.tasks.opener;

const timestampFile = `${global.rootDir}/.timestamp`;

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

      expect(timestampFromCookie).to.equal('');
    });

    it('returns empty string when no cookie', function () {
      const timestampFromCookie = gatekeeper.gatekeep({
        cookies: {
        }
      });

      expect(timestampFromCookie).to.equal('');
    });

    it('returns empty string when no timestamp file', function () {
      fs.removeSync(timestampFile);

      const timestampFromCookie = gatekeeper.gatekeep({
        cookies: {
        }
      });

      expect(timestampFromCookie).to.equal('');

      fs.writeFileSync(timestampFile, timestampFromFile);
    });
  });

  describe('.render()', function () {
    it('responds with "forbidden" page', function (done) {
      new Promise((resolve) => {
        gatekeeper.render()(
          {},
          global.responseFactory(resolve)
        );
      })
      .then((output) => {
        /* eslint-disable max-len */
        expect(output).to.equal(`
<!DOCTYPE html>
<html>
  <body>

    <section id="forbidden" class="error">
      <p>Error! You can only use the HTML Scraper on the machine that is running this Fepper instance!</p>
      <p>If you <em>are</em> on this machine, you may need to resync this browser with Fepper.</p>
      <p>Please go to the command line and quit this Fepper instance. Then run <code>fp</code> (not <code>fp restart</code>).</p>
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
    it('responds with timestamp', function (done) {
      new Promise((resolve) => {
        gatekeeper.respond()(
          {
            cookies: {
              fepper_ts: timestampFromFile
            }
          },
          global.responseFactory(resolve)
        );
      })
      .then((output) => {
        expect(output).to.equal(timestampFromFile);
        done();
      })
      .catch((err) => {
        done(err);
      });
    });
  });
});
