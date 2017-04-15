'use strict';

const beautify = require('js-beautify').html;
const fs = require('fs');
const he = require('he');
const html2json = require('html2json').html2json;
const json2html = require('html2json').json2html;
const request = require('request');

const utils = require('../lib/utils');

const conf = global.conf;

class HtmlObj {
  constructor() {
    this.node = 'root';
    this.child = [];
  }
}

class JsonForData {
  constructor() {
    this.scrape = [{}];
  }
}

// Exporting module.exports as a class so req and res can be responsibly scoped to the "this" keyword.
module.exports = class {
  constructor(req, res) {
    this._req = req;
    this._res = res;
  }

  set req(req) {
    this._req = req;
  }

  set res(res) {
    this._res = res;
  }

  /**
   * @param {string} str_ - The text requiring sane newlines.
   * @return {string} A line feed at the end and stripped of carriage returns.
   */
  newlineFormat(str_) {
    const str = str_.replace(/\r/g, '') + '\n';

    return str;
  }

  /**
   * @param {array} dataArr - Data array.
   * @return {string} Sanitized HTML.
   */
  dataArrayToJson(dataArr) {
    const jsonForData = new JsonForData();

    for (let i = 0; i < dataArr.length; i++) {
      for (let j in dataArr[i]) {
        if (dataArr[i].hasOwnProperty(j)) {
          jsonForData.scrape[0][j] = dataArr[i][j];
        }
      }
    }

    return jsonForData;
  }

  /**
   * @param {string} target - CSS selector plus optional array index.
   * @return {object} An object storing properties of the selector.
   */
  elementParse(target) {
    const targetSplit = this.targetValidate(target);
    let selectorName;
    let selectorType;

    switch (targetSplit[0][0]) {
      case '#':
        selectorName = targetSplit[0].slice(1);
        selectorType = 'id';
        break;
      case '.':
        selectorName = targetSplit[0].slice(1);
        selectorType = 'class';
        break;
      default:
        selectorName = targetSplit[0];
        selectorType = 'tag';
    }

    return {name: selectorName, type: selectorType, index: targetSplit[1]};
  }

  /**
   * Recurse through the object returned by html2json to find the selected element(s).
   *
   * @param {string|object} selector_ - At level 0, a CSS selector. At deeper levels, the selector object.
   * @param {string} html2jsonObj - The object returned by html2json.
   * @param {string} persistentObj_ - A mutating object persisting to return results. Not submitted at level 0.
   * @param {string} level_ - The level of recursion. Not submitted at level 0.
   * @return {object} An html2json object containing the matched elements. Only returns at level 0.
   */
  elementSelect(selector_, html2jsonObj, persistentObj_, level_) {
    // Validate 1st param.
    // Validate 2nd param.
    if (!html2jsonObj || html2jsonObj.constructor !== Object || !Array.isArray(html2jsonObj.child)) {
      return null;
    }

    const level = level_ || 0;
    const persistentObj = persistentObj_ || new HtmlObj();
    let selectorObj;

    if (typeof selector_ === 'string') {
      selectorObj = this.elementParse(selector_);
    }
    else if (selector_ && selector_.constructor === Object) {
      selectorObj = selector_;
    }
    else {
      return null;
    }

    const selectorName = selectorObj.name;
    const selectorType = selectorObj.type;
    persistentObj.index = selectorObj.index;

    for (let i = 0; i < html2jsonObj.child.length; i++) {
      let child = html2jsonObj.child[i];

      if (!child || child.constructor !== Object) {
        continue;
      }

      if (child.node !== 'element') {
        continue;
      }

      // If the element matches selector, push that node onto persistentObj.child.
      let matched = false;
      switch (selectorType) {
        case 'tag':
          if (child.tag && child.tag === selectorName) {
            persistentObj.child.push(child);
            matched = true;
          }
          break;
        case 'id':
          if (child.attr && child.attr.id && child.attr.id === selectorName) {
            persistentObj.child.push(child);
            matched = true;
          }
          break;
        case 'class':
          if (child.attr && child.attr.class && child.attr.class.indexOf(selectorName) > -1) {
            persistentObj.child.push(child);
            matched = true;
          }
          break;
      }

      if (matched) {
        persistentObj.child.push({node: 'text', text: '\n'});
      }

      // Else if recursable, recurse.
      else if (Array.isArray(child.child) && child.child.length) {
        this.elementSelect(selectorObj, child, persistentObj, level + 1);
      }
    }

    if (!level) {
      return persistentObj;
    }
  }

  /**
   * Iterate through collection of selected elements. If an index is specified, skip until that index is iterated upon.
   *
   * @param {string} html2jsonObj - An html2json object.
   * @param {string} targetIndex - Optional user submitted index from which the node in html2jsonObj is selected.
   * @return {object} An object containing an html2json object containing all nodes, and another containg only one.
   */
  targetHtmlGet(html2jsonObj) {
    const allObj = new HtmlObj();
    const children = html2jsonObj.child;
    const firstObj = new HtmlObj();
    let elIndex = 0;

    for (let i = 0; i < children.length; i++) {
      let elObj = children[i];

      if (elObj.node === 'element') {
        if (html2jsonObj.index === -1 || html2jsonObj.index === elIndex) {
          let flag = `\n<!-- BEGIN ARRAY ELEMENT ${elIndex} -->\n`;
          let curr = allObj.child.length - 1;

          if (!elIndex || elIndex === html2jsonObj.index) {
            firstObj.child.push(elObj);
            // TODO: maybe use a factory for this
            firstObj.child.push({node: 'text', text: '\n'});
          }
          else if (curr > -1) {
            allObj.child[curr].text = flag;
          }

          allObj.child.push(elObj);
          allObj.child.push({node: 'text', text: '\n'});
        }
        elIndex++;
      }
    }

    return {all: json2html(allObj), first: json2html(firstObj)};
  }

  /**
   * @param {string} templateDir - Write destination directory.
   * @param {string} fileName - Filename.
   * @param {string} fileMustache - Mustache file's content.
   * @param {string} fileJson - JSON file's content.
   */
  filesWrite(templateDir, fileName, fileMustache, fileJson) {
    try {
      fs.writeFileSync(templateDir + '/' + fileName + '.mustache', fileMustache);
      fs.writeFileSync(templateDir + '/' + fileName + '.json', fileJson);
      let msg = 'Go+back+to+the+Pattern+Lab+tab+and+refresh+the+browser+to+check+that+your+template+appears+under+the+';
      msg += 'Scrape+menu.';
      this.redirectWithMsg('success', msg);

      return;
    }
    catch (err) {
      utils.error(err);
    }
  }

  /**
   * Sanitize scraped HTML.
   *
   * @param {string} html_ - raw HTML.
   * @return {string} Sanitized HTML.
   */
  htmlSanitize(html_) {
    let html = html_.replace(/<script(.*?)>/g, '<code$1>');
    html = html.replace(/<\/script(.*?)>/g, '</code$1>');
    html = html.replace(/<textarea(.*?)>/g, '<figure$1>');
    html = html.replace(/<\/textarea(.*?)>/g, '</figure$1>');

    return html;
  }

  htmlToJsons(targetHtml) {
    const dataObj = {scrape: [{}]};
    const dataKeys = [[]];
    let jsonForMustache = null;

    try {
      jsonForMustache = html2json('<body>' + targetHtml + '</body>');
    }
    catch (err) {
      utils.error(err);
    }

    if (jsonForMustache) {
      this.jsonRecurse(jsonForMustache, dataObj, dataKeys, 0);
    }

    return {jsonForMustache: jsonForMustache, jsonForData: dataObj};
  }

  /**
   * @param {string} fileName - Filename.
   * @return {boolean} True or false.
   */
  isFilenameValid(fileName) {
    return /^[A-Za-z0-9][\w\-\.]*$/.test(fileName);
  }

  jsonRecurse(jsonObj, dataObj, dataKeys, inc_) {
    let inc = inc_;

    if (Array.isArray(jsonObj.child)) {
      for (let i = 0; i < jsonObj.child.length; i++) {
        if (
          jsonObj.child[i].node === 'text' &&
          typeof jsonObj.child[i].text === 'string' &&
          jsonObj.child[i].text.trim()
        ) {
          let underscored = '';

          if (jsonObj.attr) {
            if (typeof jsonObj.attr.id === 'string') {
              underscored = jsonObj.attr.id;
            }
            else if (typeof jsonObj.attr.class === 'string') {
              underscored = jsonObj.attr.class;
            }
          }

          if (!underscored && typeof jsonObj.tag === 'string') {
            underscored = jsonObj.tag;
          }

          if (underscored) {
            underscored = underscored.replace(/-/g, '_').replace(/ /g, '_').replace(/[^\w]/g, '');
            // Add incrementing suffix to dedupe items of the same class or tag.
            for (let j = dataKeys[inc].length - 1; j >= 0; j--) {
              // Check dataKeys for similarly named items.
              if (dataKeys[inc][j].indexOf(underscored) === 0) {
                let suffixInt = 0;
                // Slice off the suffix of the last match.
                let suffix = dataKeys[inc][j].slice(underscored.length);
                if (suffix) {
                  // Increment that suffix and append to the new key.
                  let suffixSlice = suffix.slice(1);
                  if (/^\d+$/.test(suffixSlice)) {
                    suffixInt = parseInt(suffixSlice, 10);
                    ++suffixInt;
                  }
                }
                else {
                  // underscored exactly matches dataKeys[inc][j]
                  ++suffixInt;
                }

                // If the one of the last 2 conditions gave us a positive suffixInt.
                if (suffixInt) {
                  underscored += `_${suffixInt}`;
                  break;
                }
              }
            }
            let tmpObj = {};
            tmpObj[underscored] = jsonObj.child[i].text.trim();
            dataKeys[inc].push(underscored);
            dataObj.scrape[inc][underscored] = tmpObj[underscored].replace(/"/g, '\\"');
            jsonObj.child[i].text = '{{ ' + underscored + ' }}';
          }
        }
        else if (jsonObj.child[i].node === 'comment' && jsonObj.child[i].text.indexOf(' BEGIN ARRAY ELEMENT ') === 0) {
          inc++;
          dataObj.scrape[inc] = {};
          dataKeys.push([]);
        }
        else {
          this.jsonRecurse(jsonObj.child[i], dataObj, dataKeys, inc);
        }
      }
    }
  }

  /**
   * @param {object} jsonForMustache - JSON for conversion to Mustache syntax.
   * @param {object} jsonForData - JSON for data ingestion by Mustache.
   * @return {string} XHTML.
   */
  jsonToMustache(jsonForMustache, jsonForData) {
    let mustache = '<body></body>';

    try {
      mustache = json2html(jsonForMustache);
    }
    catch (err) {
      utils.error(err);
    }

    if (jsonForData.scrape) {
      mustache = mustache.replace(/^\s*<body>/, '{{# scrape }}');
      mustache = mustache.replace(/<\/body>\s*$/, '{{/ scrape }}\n');
    }
    else {
      mustache = mustache.replace(/^\s*<body>/, '');
      mustache = mustache.replace(/<\/body>\s*$/, '\n');
    }

    mustache = beautify(mustache, {indent_size: 2});

    return mustache;
  }

  outputHtml(jsonForData, targetHtml_, mustache) {
    const dataStr = JSON.stringify(jsonForData, null, 2);
    const htmlObj = require('../lib/html');
    const targetHtml = he.encode(targetHtml_).replace(/\n/g, '<br>');

    let output = '';
    output += htmlObj.headWithMsg;
    output += '<section>\n';
    output += htmlObj.scraperTitle;
    output += htmlObj.reviewerPrefix;
    output += '<div>' + targetHtml + '</div>';
    output += htmlObj.reviewerSuffix;
    output += htmlObj.importerPrefix;
    output += mustache;
    output += htmlObj.json;
    // Escape double-quotes.
    output += dataStr.replace(/&quot;/g, '&bsol;&quot;');
    output += htmlObj.importerSuffix;
    output += htmlObj.landingBody;
    output += '</section>';
    output += htmlObj.foot;
    output = output.replace('{{ title }}', 'Fepper HTML Scraper');
    output = output.replace('{{ msg_class }}', '');
    output = output.replace('{{ message }}', '');
    output = output.replace('{{ attributes }}', '');
    output = output.replace('{{ url }}', this._req.body.url);
    output = output.replace('{{ target }}', this._req.body.target);
    this._res.end(output);
  }

  redirectWithMsg(type, msg, target_, url_) {
    if (this._res) {
      const msgType = type[0].toUpperCase() + type.slice(1);
      const target = typeof target_ === 'string' ? target_ : '';
      const url = typeof url_ === 'string' ? url_ : '';
      this._res.writeHead(
        303,
        {
          Location:
            'html-scraper?msg_class=' + type + '&message=' + msgType + '! ' + msg + '&target=' + target + '&url=' + url
        }
      );
      this._res.end();
    }
  }

  targetValidate(target_) {
    const target = target_.trim();
    const bracketOpenPos = target.indexOf('[');
    const bracketClosePos = target.indexOf(']');
    let targetIndex = -1;
    let targetIndexStr;
    let targetName = target;

    // Slice target param to extract targetName and targetIndexStr if submitted.
    if (bracketOpenPos > -1) {
      if (bracketClosePos === target.length - 1) {
        targetIndexStr = target.slice(bracketOpenPos + 1, bracketClosePos);
        targetName = target.slice(0, bracketOpenPos);
      }
      else {
        if (this._req) {
          this.redirectWithMsg('error', 'Incorrect+submission.', this._req.body.target, this._req.body.url);
        }
        return [];
      }
    }

    // Validate that targetName is a css selector.
    if (!/^(#|\.)?[a-z][\w#\-\.]*$/i.test(targetName)) {
      if (this._req) {
        this.redirectWithMsg('error', 'Incorrect+submission.', this._req.body.target, this._req.body.url);
      }
      return [];
    }

    // If targetIndexStr if submitted, validate it is an integer.
    if (targetIndexStr) {
      if (/^\d+$/.test(targetIndexStr)) {
        targetIndex = parseInt(targetIndexStr, 10);
      }
      else {
        if (this._req) {
          this.redirectWithMsg('error', 'Incorrect+submission.', this._req.body.target, this._req.body.url);
        }
        return [];
      }
    }

    return [targetName, targetIndex];
  }

  main() {
    const req = this._req;

    // HTML scraper action on submission of URL.
    if (typeof req.body.url === 'string' && req.body.url.trim() && typeof req.body.target === 'string') {
      try {
        // Need to reference this class's "this" with a var within the callback passed to request().
        const htmlScraperPost = this;
        request(req.body.url, (error, response, body_) => {
          if (error || response.statusCode !== 200) {
            htmlScraperPost
              .redirectWithMsg('error', 'Not+getting+a+valid+response+from+that+URL.', req.body.target, req.body.url);
            return;
          }

          // Strip body of everything before opening html tag (including doctype).
          let body = body_.replace(/[\S\s]*<html/, '<html');
          // Strip body of everything after closing html tag.
          body = body.replace(/<\/html>[\S\s]*/, '</html>');

          const jsonFromHtml = html2json(body);
          const target = req.body.target;
          const html2jsonObj = htmlScraperPost.elementSelect(target, jsonFromHtml);
          let jsonForData = new JsonForData();
          let jsonForMustache;
          let mustache = '';
          let targetFirst;
          let targetHtml = '';
          let targetHtmlObj;

          if (!html2jsonObj) {
            htmlScraperPost.redirectWithMsg('error', 'Incorrect+submission.', req.body.target, req.body.url);
            return;
          }
          else if (html2jsonObj.child.length) {
            targetHtmlObj = htmlScraperPost.targetHtmlGet(html2jsonObj);

            // Sanitize scraped HTML.
            targetHtml = htmlScraperPost.htmlSanitize(targetHtmlObj.all);
            targetFirst = htmlScraperPost.htmlSanitize(targetHtmlObj.first);

            // Convert HTML to JSON object for data ingestion by Mustache.
            jsonForData = htmlScraperPost.htmlToJsons(targetHtml).jsonForData;
            // Adjust jsonForData if not selecting multiple instances of a CSS class
            if (jsonForData.scrape.length === 1) {
              jsonForData = jsonForData.scrape[0];
            }

            // Convert HTML to JSON object for conversion to Mustache.
            jsonForMustache = htmlScraperPost.htmlToJsons(targetFirst).jsonForMustache;

            // Finish conversion to Mustache.
            if (jsonForMustache) {
              mustache = htmlScraperPost.jsonToMustache(jsonForMustache, jsonForData);
            }
            else {
              mustache = targetFirst;
            }
          }

          // Output Mustache.
          htmlScraperPost.outputHtml(jsonForData, targetHtml, mustache);
        });
      }
      catch (err) {
        utils.error(err);
      }
    }

    // HTML importer action on submission of filename.
    else if (typeof req.body.filename === 'string' && req.body.filename !== '') {
      // Limit filename characters.
      let fileName;
      if (!this.isFilenameValid(req.body.filename)) {
        this.redirectWithMsg('error', 'Please+enter+a+valid+filename!.', req.body.target, req.body.url);
        return;
      }
      else {
        fileName = req.body.filename;
      }

      const templateDir = utils.pathResolve(conf.ui.paths.source.scrape);
      const fileMustache = this.newlineFormat(req.body.mustache);
      const fileJson = this.newlineFormat(req.body.json);
      this.filesWrite(templateDir, fileName, fileMustache, fileJson);
    }

    // If no form variables sent, redirect back with GET.
    else {
      try {
        this.redirectWithMsg('error', 'Incorrect+submission.', req.body.target, req.body.url);
        return;
      }
      catch (err) {
        utils.error(err);
      }
    }
  }
};
