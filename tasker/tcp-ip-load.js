'use strict';

const gulp = require('gulp');

const Tasks = require('../core/tasks/tasks');
const TcpIp = require('../core/tcp-ip/tcp-ip');

const conf = global.conf;

const tasks = new Tasks();

gulp.task('tcp-ip-load:init', cb => {
  global.express = TcpIp.express();
  cb();
});

gulp.task('tcp-ip-load:listen', () => {
  global.express.listen(conf.express_port);
});

gulp.task('tcp-ip-load:open', cb => {
  tasks.open();
  cb();
});
