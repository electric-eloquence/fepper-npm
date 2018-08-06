'use strict';

const gulp = require('gulp');

const conf = global.conf;
const tcpIp = global.fepper.tcpIp;
const tasks = global.fepper.tasks;

gulp.task('tcp-ip-load:init', cb => {
  global.express = tcpIp.express();
  cb();
});

gulp.task('tcp-ip-load:listen', () => {
  global.express.listen(conf.express_port);
});

gulp.task('tcp-ip-load:open', cb => {
  tasks.open();
  cb();
});
