'use strict';

const {expect} = require('chai');
const fs = require('fs-extra');

const {
  fepper,
  responseFactory
} = require('../init')();
const readme = fepper.tcpIp.fpExpress.readme;

describe('Readme', function () {
  after(function () {
    fs.unlinkSync(`${global.rootDir}/README.md`);
  });

  it('responds with a 404 if no README.md present', function (done) {
    new Promise(
      (resolve) => {
        readme.main()(
          {},
          responseFactory(resolve)
        );
      })
      .then((response) => {
        expect(response.responseText).to.equal('HTTP 404: Not Found');
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('responds with README.md rendered as HTML if README.md present', function (done) {
    new Promise(
      (resolve) => {
        fs.writeFileSync(
          `${global.rootDir}/README.md`,
          '# Fepper\n\n## A frontend prototyper tool for rapid prototyping of websites'
        );

        readme.main()(
          {},
          responseFactory(resolve)
        );
      })
      .then((response) => {
        /* eslint-disable max-len */
        expect(response.responseText).to.equal(`
<!DOCTYPE html>
<html class="">
  <head>
    <title id="title">Fepper</title>
    <meta charset="utf-8">

    <!-- Disable cache -->
    <meta http-equiv="cache-control" content="max-age=0">
    <meta http-equiv="cache-control" content="no-cache">
    <meta http-equiv="expires" content="0">
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT">
    <meta http-equiv="pragma" content="no-cache">

    
    <link rel="stylesheet" href="/webserved/fonts-offline.css">
    <link rel="stylesheet" href="/webserved/core.css">
    
  </head>

  <body class="text">
    <main id="readme" class="readme">
      <div id="message" class="message "></div><h1 id="fepper">Fepper</h1>
<h2 id="a-frontend-prototyper-tool-for-rapid-prototyping-of-websites">A frontend prototyper tool for rapid prototyping of websites</h2>


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
