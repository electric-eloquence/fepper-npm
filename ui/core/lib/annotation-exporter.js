'use strict';

const path = require('path');

const glob = require('glob');
const fs = require('fs-extra');
const JSON5 = require('json5');
const matter = require('gray-matter');

/*
 * Returns the array of comments that used to be wrapped in raw JS.
 */
exports.gatherJs = function (patternlab) {
  const paths = patternlab.config.paths;
  const oldAnnotationsFile = path.resolve(paths.source.annotations, 'annotations.js');

  let oldAnnotations;

  if (fs.existsSync(oldAnnotationsFile)) {
    oldAnnotations = fs.readFileSync(oldAnnotationsFile, patternlab.enc);
  }
  else {
    return [];
  }

  // parse as JSON by removing the old wrapping js syntax. comments and the trailing semi-colon
  oldAnnotations = oldAnnotations.replace('var comments = ', '');
  oldAnnotations = oldAnnotations.replace('};', '}');

  let oldAnnotationsJson;

  try {
    oldAnnotationsJson = JSON5.parse(oldAnnotations);
  }
  catch (err) {
    console.log('There was an error parsing JSON for ' + paths.source.annotations + 'annotations.js');
    console.log(err.message || err);

    return [];
  }

  const retVal = oldAnnotationsJson.comments || [];

  return retVal;
};

/*
 * Converts the *.md file into Front Matter and then into an array of annotations
 */
exports.gatherMd = function (patternlab) {
  const annotations = [];
  const paths = patternlab.config.paths;

  let mdFiles = glob.sync(paths.source.patterns + '/**/*.md');
  mdFiles = mdFiles.concat(glob.sync(paths.source.annotations + '/*.md'));

  for (let i = 0, l = mdFiles.length; i < l; i++) {
    const mdFile = mdFiles[i];
    const annotationsMd = fs.readFileSync(path.resolve(mdFile), patternlab.enc);

    // take the annotation snippets and split them on our custom delimiter
    const annotationsMdSplit = annotationsMd.split('~*~');

    for (let j = 0, le = annotationsMdSplit.length; j < le; j++) {
      const frontMatterPrecursor = annotationsMdSplit[j];
      const frontMatterLines = frontMatterPrecursor.split('\n');

      let reachedDelimiter = false;

      const frontMatterLinesClone = frontMatterLines.slice(0, frontMatterLines.length);

      // remove comments and/or whitespace before "---" delimiter
      for (let k = 0, len = frontMatterLinesClone.length; k < len; k++) {
        const line = frontMatterLinesClone[k];

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

      // escape "#" in the data for el:
      for (let k = 0, len = frontMatterLines.length; k < len; k++) {
        const line = frontMatterLines[k];

        if (line.slice(0, 3) === 'el:') {
          frontMatterLines[k] = line.replace('#', '\\#');

          break;
        }
      }

      const frontMatterStr = frontMatterLines.join('\n').trim();
      const frontMatterObj = matter(frontMatterStr);

      // unescape "#" in data.el
      frontMatterObj.data.el = frontMatterObj.data.el.replace('\\#', '#');

      const annotation = frontMatterObj.data;

      annotation.comment = frontMatterObj.content;
      annotations.push(annotation);
    }
  }

  return annotations;
};

exports.gather = function (patternlab) {
  const annotationsJs = exports.gatherJs(patternlab);
  const annotationsMd = exports.gatherMd(patternlab);
  const paths = patternlab.config.paths;

  // first, get all elements unique to annotationsJs
  const annotationsUnique = annotationsJs.filter(function (annotationJsObj) {
    let unique = true;

    for (let i = 0, l = annotationsMd.length; i < l; i++) {
      const annotationMdObj = annotationsMd[i];

      if (annotationJsObj.el === annotationMdObj.el) {
        unique = false;

        continue;
      }
    }

    return unique;
  });

  // then, concat all elements in annotationsMd and return
  return annotationsUnique.concat(annotationsMd);
};
