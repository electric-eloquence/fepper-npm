/**
 * Handle annotations and pattern state, while keeping Front Matter capability extensible.
 *
 * Annotations will only be supported for modified Front Matter syntax in .md files.
 * Support has been completely dropped for the chaotically documented JS (JSON?) annotation standard.
 * @see {@link https://patternlab.io/docs/pattern-adding-annotations.html}
 *
 * JS annotation pain points:
 *   - Earlier versions of Pattern Lab for Node used true JavaScript code beginning with "var comments ="
 *   - Trying to parse such user-created non-strict JavaScript is asking for trouble
 *   - The documentation page shows pure JSON
 *   - The documentation page does not explain how to make multiple annotations
 */
'use strict';

const marked = require('marked');
const matter = require('gray-matter');

/**
 * Parse Front Matter from .md files.
 *
 * @param {string} fileContent - raw text.
 * @param {object} patternlab - Pattern Lab object.
 * @return {array} Array of data objects.
 */
exports.main = (fileContent) => {
  const frontMatterDataArr = [];

  // Take raw file content text and split it with Pattern Lab's custom delimiter.
  const fileContentSplit = fileContent.split('~*~');

  for (let i = 0, l = fileContentSplit.length; i < l; i++) {
    const frontMatterPrecursor = fileContentSplit[i];
    const frontMatterLines = frontMatterPrecursor.split('\n');
    const frontMatterLinesLength = frontMatterLines.length;

    let reachedDelimiter = false;

    const frontMatterLinesClone = frontMatterLines.slice(0, frontMatterLinesLength);

    // Remove comments and/or whitespace before "---" delimiter.
    for (let j = 0, le = frontMatterLinesClone.length; j < le; j++) {
      const line = frontMatterLinesClone[j];

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
    for (let j = 0; j < frontMatterLinesLength; j++) {
      const line = frontMatterLines[j];

      if (line.slice(0, 3) === 'el:') {
        frontMatterLines[j] = line.replace('#', '\\#');

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
      if (frontMatterData) {
        frontMatterData.comment = marked(frontMatterObj.content);
      }
      else {
        frontMatterData = {comment: marked(frontMatterObj.content)};
      }
    }

    if (frontMatterData) {
      frontMatterDataArr.push(frontMatterData);
    }
  }

  return frontMatterDataArr;
};
