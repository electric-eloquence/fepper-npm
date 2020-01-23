/**
 * Handle annotations and pattern state, while keeping Front Matter capability extensible.
 *
 * Annotations will only be supported for modified Front Matter syntax in .md files.
 * Support has been completely dropped for the chaotically documented JS (JSON?) annotation standard.
 * @see {@link https://patternlab.io/docs/pattern-adding-annotations.html}
 *
 * JS annotation pain points:
 *   - Earlier versions of Pattern Lab for Node used true JavaScript code beginning with "var comments =".
 *   - Trying to parse such user-created non-strict JavaScript is asking for trouble.
 *   - The documentation page shows pure JSON.
 *   - The documentation page does not explain how to make multiple annotations.
 */
'use strict';

const marked = require('marked');
const matter = require('gray-matter');

/**
 * Parse Front Matter from .md files.
 *
 * @param {string} fileContent - raw text.
 * @param {object} patternlab - Pattern Lab object.
 * @returns {array} Array of data objects.
 */
exports.main = (fileContent) => {
  const frontMatterDataArr = [];

  // Take raw file content text and split it with Pattern Lab's custom delimiter.
  const fileContentSplit = fileContent.split('~*~');

  // 0 FOR-LOOP LEVELS IN.
  for (let in0 = 0, le0 = fileContentSplit.length; in0 < le0; in0++) {
    const frontMatterPrecursor = fileContentSplit[in0];
    const frontMatterLines = frontMatterPrecursor.split('\n');
    const frontMatterLinesLength = frontMatterLines.length;

    let reachedDelimiter = false;

    const frontMatterLinesClone = frontMatterLines.slice(0, frontMatterLinesLength);

    // Remove comments and/or whitespace before "---" delimiter.
    // 1 FOR-LOOP LEVELS IN.
    for (let in1 = 0, le1 = frontMatterLinesClone.length; in1 < le1; in1++) {
      const line = frontMatterLinesClone[in1];

      if (!reachedDelimiter) {
        if (line.trim() === '---') {
          reachedDelimiter = true;
        }
        else {
          frontMatterLines.shift();
        }
      }
      else {
        break;
      }
    }

    // Escape "#" in the data for el.
    // 1 FOR-LOOP LEVELS IN.
    for (let in1 = 0, le1 = frontMatterLinesLength; in1 < le1; in1++) {
      const line = frontMatterLines[in1];

      // Might be undefined if there was no ending "---" delimiter.
      if (typeof line !== 'string') {
        continue;
      }

      if (line.slice(0, 3) === 'el:') {
        frontMatterLines[in1] = line.replace('#', '\\#');

        break;
      }
    }

    const frontMatterStr = frontMatterLines.join('\n').trim();
    const frontMatterObj = matter(frontMatterStr);
    let frontMatterData;

    if (frontMatterObj.data) {
      frontMatterData = frontMatterObj.data;

      // Unescape "#" in data.el
      if (typeof frontMatterData.el === 'string') {
        frontMatterData.el = frontMatterData.el.replace('\\#', '#');
      }
    }

    if (frontMatterObj.content) {
      // Usually, an absence of Front Matter data will result in frontMatterObj.data being an empty object.
      // Keeping the else clause just in case.
      /* istanbul ignore else */
      if (frontMatterData) {
        frontMatterData.annotation = marked(frontMatterObj.content);
      }
      else {
        frontMatterData = {annotation: marked(frontMatterObj.content)};
      }
    }

    if (frontMatterData) {
      frontMatterDataArr.push(frontMatterData);
    }
  }

  return frontMatterDataArr;
};
