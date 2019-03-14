'use strict';

const gulp = require('gulp');

const conf = global.conf;
const tcpIp = global.fepper.tcpIp;
const tasks = global.fepper.tasks;

gulp.task('tcp-ip-load:listen', () => {
  tcpIp.fpExpress.app.listen(conf.express_port);
});

gulp.task('tcp-ip-load:open', cb => {
  tasks.open();
  cb();
});
