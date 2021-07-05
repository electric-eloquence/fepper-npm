'use strict';

const conf = global.conf;
const gulp = global.gulp;
const fpExpress = global.fepper.tcpIp.fpExpress;
const tasks = global.fepper.tasks;

gulp.task('tcp-ip-load:listen', function () {
  // All Express routes should have been declared by now.
  // If the request has fallen through this far, respond with a 404.
  fpExpress.app.use(fpExpress.errorResponse.notFound());

  fpExpress.app.listen(conf.express_port);
});

gulp.task('tcp-ip-load:open', function (cb) {
  tasks.open();
  cb();
});
