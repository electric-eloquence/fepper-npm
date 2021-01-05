'use strict';

const conf = global.conf;
const gulp = global.gulp;
const tcpIp = global.fepper.tcpIp;
const tasks = global.fepper.tasks;

gulp.task('tcp-ip-load:listen', function () {
  // All Express routes should have been declared by now.
  // If the request has fallen through this far, respond with a 404.
  tcpIp.fpExpress.app.use(tcpIp.errorResponse.notFound());

  tcpIp.fpExpress.app.listen(conf.express_port);
});

gulp.task('tcp-ip-load:open', function (cb) {
  tasks.open();
  cb();
});
