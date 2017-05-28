'use strict';

var fs = require('fs-extra');
var path = require('path');

var fepperUtils = require(global.appDir + '/core/lib/utils');

var util = {
  // http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
  shuffle: function (o) {
    // eslint-disable-next-line curly
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  },

  logGreen: function (message) {
    console.log('\x1b[32m', message, '\x1b[0m');
  },

  logRed: function (message) {
    console.log('\x1b[41m', message, '\x1b[0m');
  },

  extendButNotOverride: fepperUtils.extendButNotOverride,

  isObjectEmpty: function (obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) { return false; }
    }
    return true;
  },

  // recursively delete the contents of directory
  // adapted from https://gist.github.com/tkihira/2367067
  emptyDirectory: function (dir, cleanDir) {
    var list = fs.readdirSync(dir);
    for (var i = 0; i < list.length; i++) {
      var filename = path.join(dir, list[i]);
      var stat = fs.statSync(filename);

      if (filename === '.' || filename === '..') {
        // pass these files
      } else if (stat.isDirectory()) {
        this.emptyDirectory(filename);
      } else {
        // rm fiilename
        fs.unlinkSync(filename);
      }
    }
    if (cleanDir) {
      fs.rmdirSync(dir);
    }
  }
};

module.exports = util;
