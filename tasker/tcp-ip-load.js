'use strict';

const conf = global.conf;
const gulp = global.gulp;
const tcpIp = global.fepper.tcpIp;
const tasks = global.fepper.tasks;

gulp.task('tcp-ip-load:listen', function () {
  tcpIp.fpExpress.app.listen(conf.express_port);
});

gulp.task('tcp-ip-load:open', function (cb) {
  tasks.open();
  cb();
});
