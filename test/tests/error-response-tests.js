'use strict';

const {expect} = require('chai');

const {
  fepper,
  responseFactory
} = require('../init')();
const errorResponse = fepper.tcpIp.fpExpress.errorResponse;

describe('Error Response', function () {
  it('responds with a 404 if file is missing', function (done) {
    new Promise(
      (resolve) => {
        errorResponse.notFound()(
          {url: 'missing.html'},
          responseFactory(resolve)
        );
      })
      .then((output) => {
        expect(output).to.equal(`
<!DOCTYPE html>
<html class="">
  <head>
    <title id="title">ERROR</title>
    <meta charset="utf-8">

    <!-- Disable cache -->
    <meta http-equiv="cache-control" content="max-age=0">
    <meta http-equiv="cache-control" content="no-cache">
    <meta http-equiv="expires" content="0">
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT">
    <meta http-equiv="pragma" content="no-cache">

    
    <link rel="stylesheet" href="/fepper-core/style.css">
    
  </head>

  <body class="">
    <main id="" class="">
      <div id="message" class="message "></div>
      <pre>Cannot GET missing.html</pre>
    </main>
    <!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->
<script type="text/json" id="sg-pattern-data-footer" class="sg-pattern-data">
  
</script>

<script>
  // LiveReload.
  if (location.protocol !== 'file:') {
    const reloader = document.createElement('script');

    reloader.setAttribute('src', location.protocol + '//' + location.hostname + ':35729/livereload.js');
    document.body.appendChild(reloader);
  }
</script>

<script src="../../node_modules/fepper-ui/scripts/pattern/index.js" type="module"></script>
<!-- End Pattern Lab -->

  </body>
</html>`);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
