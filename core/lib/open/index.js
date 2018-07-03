/* eslint-disable */

var execFile = require('child_process').execFile
  , path = require('path')
  ;


/**
 * open a file or uri using the default application for the file type.
 *
 * @return {ChildProcess} - the child process object.
 * @param {string} target - the file/uri to open.
 * @param {string} appName - (optional) the application to be used to open the
 *      file (for example, "chrome", "firefox")
 * @param {function(Error)} callback - called with null on success, or
 *      an error object that contains a property 'code' with the exit
 *      code of the process.
 */

module.exports = open;

function open(target, appName, callback) {
  var opener;
  var args = [];

  if (typeof appName === 'string') {
    appName = escape(appName);
  } else if (typeof appName === 'function') {
    callback = appName;
  }

  if (typeof appName !== 'string') {
    appName = null;
  }

  switch (process.platform) {
  case 'darwin':
    opener = 'open';
    if (appName) {
      args.push('-a');
      args.push(appName);
    }
    break;
  case 'win32':
    // if the first parameter to start is quoted, it uses that as the title
    // so we pass a blank title so we can quote the file we are opening
    opener = 'start';
    args.push('');
    if (appName) {
      args.push(appName);
    }
    break;
  default:
    if (appName) {
      opener = appName;
    } else {
      // use Portlands xdg-open everywhere else
      opener = path.join(__dirname, './vendor/xdg-open');
    }
    break;
  }

  args.push(escape(target));

  return execFile(opener, args, callback);
}

function escape(s) {
  return s.replace(/"/g, '\\\"');
}
