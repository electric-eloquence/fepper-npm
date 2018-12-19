'use strict';

module.exports = (markdownString, marked) => {
  // Replace curly braces with their HTML entities.
  let markdownStringEscaped = markdownString.replace(/\{/g, '&lbrace;');
  markdownStringEscaped = markdownStringEscaped.replace(/\}/g, '&rbrace;');

  let html = marked(markdownStringEscaped);
  html = html.replace(/&amp;lbrace;/g, '{');
  html = html.replace(/&amp;rbrace;/g, '}');

  return html;
}
