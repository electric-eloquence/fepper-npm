'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

const {
  fepper,
  responseFactory
} = require('../init')();
const success = fepper.tcpIp.fpExpress.success;

describe('Success', function () {
  after(function () {
    fs.unlinkSync(`${global.rootDir}/README.md`);
  });

  it('responds with a simple Success page HTML if no README.md present', function (done) {
    new Promise((resolve) => {
      success.main()(
        {
          headers: {
            host: 'localhost:3000'
          }
        },
        responseFactory(resolve)
      );
    })
    .then((output) => {
      expect(output).to.equal(`<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body>Installation success!<br><a href="/">Open Fepper UI</a></body></html>`);
      done();
    })
    .catch((err) => {
      done(err);
    });
  });

  it('responds with a full Success page HTML if README.md present', function (done) {
    new Promise((resolve) => {
      fs.writeFileSync(
        `${global.rootDir}/README.md`,
        '# Fepper\n\n## A frontend prototyper tool for rapid prototyping of websites'
      );

      success.main()(
        {
          headers: {
            host: 'localhost:3000'
          }
        },
        responseFactory(resolve)
      );
    })
    .then((output) => {
      /* eslint-disable max-len */
      expect(output).to.equal(`
<!DOCTYPE html>
<html class="">
  <head>
    <title id="title">Installation success!</title>
    <meta charset="UTF-8">

    <!-- Disable cache -->
    <meta http-equiv="cache-control" content="max-age=0">
    <meta http-equiv="cache-control" content="no-cache">
    <meta http-equiv="expires" content="0">
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT">
    <meta http-equiv="pragma" content="no-cache">

    

    <link rel="stylesheet" href="/fepper-core/style.css" media="all">
  </head>

  <body class="text ">
    <main id="success-page" class="success-page">
      <div id="message" class="message success"><h1>Installation success!</h1></div>
      <p>To open the UI, click here: <a href="http://localhost:3000" target="_blank">http://localhost:3000</a></p>
      <p>To halt Fepper, go to the command prompt where Fepper is running and press ctrl+c.</p>
      <p>The following documentation is also available in Fepper&apos;s README.md:</p><h1 id="fepper">Fepper</h1>
<h2 id="a-frontend-prototyper-tool-for-rapid-prototyping-of-websites">A frontend prototyper tool for rapid prototyping of websites</h2>

<p>&nbsp;</p>
<p>&nbsp;</p>

    </main>

    

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
