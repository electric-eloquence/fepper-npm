'use strict';

process.chdir(__dirname);

const diveSync = require('diveSync');
const fs = require('fs-extra');
const utils = require('fepper-utils');

const i18nFileBase = 'excludes/profiles/base/source/_ui/i18n/en.json';
const i18n = fs.readJsonSync('../' + i18nFileBase);
const i18nKeyCount = {};

Object.keys(i18n).forEach((key) => {
  i18nKeyCount[key] = 0;
});

function verifyI18n(err, file) {
  if (err) {
    utils.error(err);

    return;
  }

  if (file.endsWith('.js')) {
    const fileContent = fs.readFileSync(file, 'utf8');
    const contentSplit = fileContent.split('t("');
    let strIndex = 0;

    contentSplit.forEach((part, i) => {
      if (i === 0) {
        strIndex += 3 + part.length;
      }
      else if (!/\w/.test(fileContent[strIndex - 1])) {
        const partSplit = part.split('"');
        let subPart = '';
        let subPartOut = '';
        strIndex += 3 + part.length;

        for (let i = 0; i < partSplit.length; i++) {
          const val = partSplit[i];

          if (val.slice(-1) === '\\') {
            subPart += val.slice(0, -1) + '"';
            subPartOut += val + '"';

            continue;
          }
          else {
            subPart += val;
            subPartOut = subPart;

            break;
          }
        }

        if (typeof i18nKeyCount[subPart] === 'undefined') {
          utils.warn(file.slice(3));
          utils.warn('CONTAINS STRING');
          utils.log(subPart);
          utils.warn('WHICH IS NOT INTERNATIONALIZED IN');
          utils.warn(i18nFileBase);
          utils.log();
        }
        else {
          i18nKeyCount[subPart]++;
        }
      }
      else {
        strIndex += 3 + part.length;
      }
    });
  }
}

verifyI18n(null, '../tasker.js');
diveSync('../core', verifyI18n);
diveSync('../ui', verifyI18n);

let hasUnusedKey = false;

Object.keys(i18nKeyCount).forEach((key) => {
  if (i18nKeyCount[key] < 1) {
    if (!hasUnusedKey) {
      hasUnusedKey = true;

      utils.warn('UNUSED KEYS IN ' + i18nFileBase + ':');
    }

    utils.log(key);
    utils.log();
  }
});
