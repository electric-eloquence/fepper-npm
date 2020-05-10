'use strict';

const {expect} = require('chai');

const {
  fepper,
  responseFactory
} = require('../init')();
const errorResponse = fepper.tcpIp.fpExpress.errorResponse;

describe('Error Response', function () {
  it('responds with a 404 if no README.md present', function (done) {
    new Promise((resolve) => {
      errorResponse.notFound()(
        {},
        responseFactory(resolve)
      );
    })
    .then((output) => {
      expect(output).to.equal(`
<!DOCTYPE html>
<html>
  <head>
    <title id="title">ERROR</title>
    <meta charset="UTF-8">
    <script src="../../node_modules/mousetrap/mousetrap.min.js"></script>
  </head>
  <body>
    <main>
      <pre>Cannot GET undefined</pre>
    </main>

    <!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->
<script type="text/json" id="sg-pattern-data-footer" class="sg-pattern-data">
  
</script>

<script>
  // LiveReload.
  const {protocol, hostname} = window.location;

  if (protocol !== 'file:') {
    const reloader = document.createElement('script');

    reloader.setAttribute('src', protocol + '//' + hostname + ':35729/livereload.js');
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
