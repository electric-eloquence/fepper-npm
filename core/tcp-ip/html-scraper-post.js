'use strict';

const path = require('path');

const beautify = require('js-beautify').html;
const Feplet = require('feplet');
const fs = require('fs-extra');
const he = require('he');
const html2json = require('html2json').html2json;
const json2html = require('html2json').json2html;
const utils = require('fepper-utils');

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
  constructor(req, res, conf, gatekeeper, html) {
    this.req = req;
    this.res = res;
    this.conf = conf;
    this.gatekeeper = gatekeeper;
    this.html = html;

    // Set some defaults for possibly non-existent nested request properties.
    this.filename = (this.req && this.req.body && this.req.body.filename) || '';
    this.html2json = (this.req && this.req.body && this.req.body.html2json) || '';
    this.json = (this.req && this.req.body && this.req.body.json) || '';
    this.mustache = (this.req && this.req.body && this.req.body.mustache) || '';
    this.selector = (this.req && this.req.body && this.req.body.selector) || '';
    this.url = (this.req && this.req.body && this.req.body.url) || '';
  }

  /**
   * @param {string} selectorRaw - CSS selector plus optional array index.
   * @returns {object} An object storing properties of the selector.
   */
  elementParse(selectorRaw) {
    const selectorObj = this.selectorValidate(selectorRaw);
    const index = selectorObj.index;
    let name;
    let type;

    switch (selectorObj.name[0]) {
      case '#':
        name = selectorObj.name.slice(1);
        type = 'id';
        break;
      case '.':
        name = selectorObj.name.slice(1);
        type = 'class';
        break;
      default:
        name = selectorObj.name;
        type = 'tag';
    }

    return {name, index, type};
  }

  /**
   * Recurse through the object returned by html2json to find the selected element(s).
   *
   * @param {string|object} selector_ - At level 0, a CSS selector. At deeper levels, the selector object.
   * @param {object} html2jsonObj - The object returned by html2json.
   * @param {object|null} persistentObj_ - A mutating object persisting to return results. Not submitted at level 0.
   * @param {number} level - The level of recursion. Not submitted at level 0.
   * @returns {object} An html2json object containing the matched elements. Only returns at level 0.
   */
  elementSelect(selector_, html2jsonObj, persistentObj_ = null, level = 0) {
    // Validate 1st param.
    // Validate 2nd param.
    if (!html2jsonObj || html2jsonObj.constructor !== Object || !Array.isArray(html2jsonObj.child)) {
      return null;
    }

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
   * @param {string} scrapeDir - Write destination directory.
   * @param {string} filename - Filename.
   * @param {string} fileMustache - Mustache file's content.
   * @param {string} fileJson - JSON file's content.
   */
  filesWrite(scrapeDir, filename, fileMustache, fileJson) {
    try {
      fs.outputFileSync(scrapeDir + '/' + filename + '.mustache', fileMustache);
      fs.outputFileSync(scrapeDir + '/' + filename + '.json', fileJson);

      let msg = 'Go back to the "Fepper - scrape-html-scraper" tab and refresh the browser to check that your ' +
        'template appears under the "Scrape" menu.';

      this.redirectWithMsg('success', msg, '', '');
    }
    catch (err) {
      utils.error(err);
    }
  }

  /**
   * @param {object} jsonForData - JSON for data ingestion by Mustache. To be stringified for submission to file write.
   * @param {object} targetHtml_ - targeted HTML to be displayed to end-user.
   * @param {string} mustache - Mustache code for submission to file write.
   * @param {string} msgClass - e.g. success, error.
   * @param {string} message - Message to end-user.
   * @returns {string} HTML.
   */
  htmlOutput(jsonForData, targetHtml_, mustache, msgClass = '', message = '') {
    const dataStr = JSON.stringify(jsonForData, null, 2);
    const targetHtml = he.encode(targetHtml_).replace(/\n/g, '<br>');
    const url = this.url;
    const selector = this.selector;

    let msgPrefix = '';

    if (msgClass) {
      msgPrefix = msgClass[0].toUpperCase() + msgClass.slice(1) + '! ';
    }

    let outputFpt = this.html.headWithMsg;
    outputFpt += this.html.scraperTitle;
    outputFpt += this.html.reviewerPrefix;
    outputFpt += '<div>' + targetHtml + '</div>';
    outputFpt += this.html.reviewerSuffix;
    outputFpt += this.html.importerPrefix;
    outputFpt += '{{{ mustache }}}';
    outputFpt += this.html.json;

    // Escape double-quotes.
    outputFpt += dataStr.replace(/&quot;/g, '&bsol;&quot;');
    outputFpt += this.html.importerSuffix;
    outputFpt += '<script src="/node_modules/fepper-ui/scripts/html-scraper-ajax.js"></script>';
    outputFpt += this.html.foot;

    const output = Feplet.render(
      outputFpt,
      {
        title: 'Fepper HTML Scraper',
        main_id: 'scraper',
        main_class: 'scraper',
        msg_class: msgClass,
        message: msgPrefix + message,
        url,
        selector,
        mustache
      }
    );

    return output;
  }

  /**
   * Sanitize scraped HTML.
   *
   * @param {string} html_ - raw HTML.
   * @returns {string} Sanitized HTML.
   */
  htmlSanitize(html_) {
    let html = html_.replace(/<script(.*?)>/g, '<code$1>');
    html = html.replace(/<\/script(.*?)>/g, '</code$1>');
    html = html.replace(/<textarea(.*?)>/g, '<figure$1>');
    html = html.replace(/<\/textarea(.*?)>/g, '</figure$1>');

    return html;
  }

  /**
   * Parse JSON from targeted HTML.
   *
   * @param {string} targetHtml - sanitized HTML.
   * @returns {object} jsonForMustache and jsonForData.
   */
  htmlToJsons(targetHtml) {
    const jsonForData = {scrape: [{}]};
    const dataKeys = [[]];
    let jsonForMustache = null;

    try {
      jsonForMustache = html2json('<body>' + targetHtml + '</body>');
    }
    catch (err) {
      // Can work with null jsonForMustache.
      utils.warn(err);
    }

    if (jsonForMustache) {
      this.jsonRecurse(jsonForMustache, jsonForData, dataKeys, 0);
    }

    return {jsonForMustache, jsonForData};
  }

  /**
   * @param {string} filename - Filename.
   * @returns {boolean} True or false.
   */
  filenameValidate(filename) {
    if (filename === this.conf.scrape.scraper_file) {
      return false;
    }

    return /^[0-9a-z][\w\-\.]*$/i.test(filename);
  }

  /**
   * Recurse through jsonForMustache. Mutate jsonForMustache and jsonForData along the way.
   *
   * @param {object} jsonForMustache - JSON for conversion to Mustache syntax.
   * @param {object} jsonForData - JSON for data ingestion by Mustache.
   * @param {string} dataKeys - keys to jsonForData.
   * @param {array} inc_ - array index.
   */
  jsonRecurse(jsonForMustache, jsonForData, dataKeys, inc_) {
    let inc = inc_;

    if (Array.isArray(jsonForMustache.child)) {
      for (let i = 0; i < jsonForMustache.child.length; i++) {
        if (
          jsonForMustache.child[i].node === 'text' &&
          typeof jsonForMustache.child[i].text === 'string' &&
          jsonForMustache.child[i].text.trim()
        ) {
          let underscored = '';

          if (jsonForMustache.attr) {
            if (typeof jsonForMustache.attr.id === 'string') {
              underscored = jsonForMustache.attr.id;
            }
            else if (typeof jsonForMustache.attr.class === 'string') {
              underscored = jsonForMustache.attr.class;
            }
          }

          if (!underscored && typeof jsonForMustache.tag === 'string') {
            underscored = jsonForMustache.tag;
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
            tmpObj[underscored] = jsonForMustache.child[i].text.trim();
            dataKeys[inc].push(underscored);
            jsonForData.scrape[inc][underscored] = tmpObj[underscored].replace(/"/g, '\\"');
            jsonForMustache.child[i].text = '{{ ' + underscored + ' }}';
          }
        }
        else if (
          jsonForMustache.child[i].node === 'comment' &&
          jsonForMustache.child[i].text.indexOf(' BEGIN ARRAY ELEMENT ') === 0
        ) {
          inc++;
          jsonForData.scrape[inc] = {};
          dataKeys.push([]);
        }
        else {
          this.jsonRecurse(jsonForMustache.child[i], jsonForData, dataKeys, inc);
        }
      }
    }
  }

  /**
   * @param {object} jsonForMustache - JSON for conversion to Mustache syntax.
   * @param {object} jsonForData - JSON for data ingestion by Mustache.
   * @returns {string} Mustache code.
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

  /**
   * @param {string} str_ - The text requiring sane newlines.
   * @returns {string} Text stripped of carriage returns, with just a line feed at the end (no additional whitespace).
   */
  newlineFormat(str_) {
    let str = str_.replace(/\r/g, '');

    str = str.trim() + '\n';

    return str;
  }

  /**
   * Redirect away from this POST to a GET landing.
   *
   * @param {string} msgClass - e.g. success, error.
   * @param {string} message - Message to end-user.
   * @param {string} url_ - URL to be scraped.
   * @param {string} selector_ - CSS selector plus optional array index.
   */
  redirectWithMsg(msgClass, message, url_, selector_) {
    if (this.res) {
      let msgPrefix = '';

      if (msgClass) {
        msgPrefix = msgClass[0].toUpperCase() + msgClass.slice(1) + '! ';
      }

      const url = url_ || this.url;
      const selector = selector_ || this.selector;

      this.res.writeHead(
        303,
        {
          Location:
            '/html-scraper?msg_class=' + encodeURIComponent(msgClass) +
            '&message=' + encodeURIComponent(msgPrefix) + encodeURIComponent(message) +
            '&url=' + encodeURIComponent(url) +
            '&selector=' + encodeURIComponent(selector)
        }
      );
      this.res.end();
    }
  }

  scrapeAndRender(selector, html2jsonObj) {
    let msgClass;
    let message;

    try {
      const elementSelection = this.elementSelect(selector, html2jsonObj);
      let jsonForData = new JsonForData();
      let jsonForMustache;
      let mustache = '';
      let targetSingle;
      let targetHtml = '';
      let targetHtmlObj = this.targetHtmlGet(elementSelection);

      // Sanitize scraped HTML.
      targetHtml = this.htmlSanitize(targetHtmlObj.all);
      targetSingle = this.htmlSanitize(targetHtmlObj.single);

      // Convert HTML to JSON object for data ingestion by Mustache.
      jsonForData = this.htmlToJsons(targetHtml).jsonForData;

      // Adjust jsonForData if not selecting multiple instances of a CSS class
      if (jsonForData.scrape.length === 1) {
        jsonForData = jsonForData.scrape[0];
      }

      // Convert HTML to JSON object for conversion to Mustache.
      jsonForMustache = this.htmlToJsons(targetSingle).jsonForMustache;

      // Finish conversion to Mustache.
      if (jsonForMustache) {
        mustache = this.jsonToMustache(jsonForMustache, jsonForData);
      }
      else {
        message = 'The HTML at that URL and selector contains code (probably SVG or XML) defined outside the HTML ' +
          'spec. This will prevent Fepper from writing its data into a JSON file.';
        msgClass = 'warning';
        mustache = targetSingle;
      }

      const output = this.htmlOutput(jsonForData, targetHtml, mustache, msgClass, message);

      this.res.send(output);
    }
    catch (err) {
      utils.error(err);
    }
  }

  /**
   * Validate syntax of Target Selector input.
   *
   * @param {string} selectorRaw_ - CSS selector plus optional array index.
   * @returns {array} CSS selector and its index if it comprises more than one element.
   */
  selectorValidate(selectorRaw_) {
    const selectorRaw = selectorRaw_.trim();
    const bracketOpenPos = selectorRaw.indexOf('[');
    const bracketClosePos = selectorRaw.indexOf(']');

    let index = -1;
    let indexStr;
    let name = selectorRaw;

    // Slice selectorRaw to extract name and indexStr if submitted.
    if (bracketOpenPos > -1) {
      if (bracketClosePos === selectorRaw.length - 1) {
        indexStr = selectorRaw.slice(bracketOpenPos + 1, bracketClosePos);
        name = selectorRaw.slice(0, bracketOpenPos);
      }
      else {
        if (this.req) {
          this.redirectWithMsg('error', 'Please enter correctly syntaxed selector.');
        }

        name = '';
      }
    }

    // Validate that name is a css selector.
    if (!/^(#|\.)?[a-z][\w#\-\.]*$/i.test(name)) {
      if (this.req) {
        this.redirectWithMsg('error', 'Please enter correctly syntaxed selector.');
      }

      name = '';
    }

    // If indexStr if submitted, validate it is an integer.
    if (indexStr) {
      if (/^\d+$/.test(indexStr)) {
        index = parseInt(indexStr, 10);
      }
      else {
        if (this.req) {
          this.redirectWithMsg('error', 'Please enter correctly syntaxed selector.');
        }

        name = '';
      }
    }

    return {name, index};
  }

  /**
   * Iterate through collection of selected elements. If an index is specified, skip until that index is iterated upon.
   *
   * @param {string} html2jsonObj - An html2json object.
   * @param {string} targetIndex - Optional user submitted index from which the node in html2jsonObj is selected.
   * @returns {object} An object containing an html2json object containing all nodes, and another containg only one.
   */
  targetHtmlGet(html2jsonObj) {
    const allObj = new HtmlObj();
    const children = html2jsonObj.child;
    const singleObj = new HtmlObj();
    let elIndex = 0;

    for (let i = 0, l = children.length; i < l; i++) {
      let elObj = children[i];

      if (elObj.node === 'element') {
        if (html2jsonObj.index === -1 || html2jsonObj.index === elIndex) {
          let childIndexLast = allObj.child.length - 1;

          if (childIndexLast > -1) {
            allObj.child[childIndexLast].text = `\n<!-- BEGIN ARRAY ELEMENT ${elIndex} -->\n`;
          }

          allObj.child.push(elObj);
          // Not worth storing obj to var because they'll be references of the same obj.
          allObj.child.push({node: 'text', text: '\n'});

          if ((html2jsonObj.index === -1 && elIndex === 0) || html2jsonObj.index === elIndex) {
            singleObj.child.push(elObj);
            singleObj.child.push({node: 'text', text: '\n'});
          }
        }

        elIndex++;
      }
    }

    return {all: json2html(allObj), single: json2html(singleObj)};
  }

  /**
   * Main.
   */
  main() {
    if (!this.gatekeeper.gatekeep(this.req)) {
      this.gatekeeper.render(this.req, this.res);

      return;
    }

    // HTML importer action on submission of filename.
    // Put this conditional block single to enable resetting of form.
    if (this.filename !== '') {

      // Limit filename characters.
      let filename;

      if (!this.filenameValidate(this.filename)) {
        this.redirectWithMsg('error', 'Please enter a valid filename.');

        return;
      }
      else {
        filename = this.filename;
      }

      const fileMustache = this.newlineFormat(this.mustache);
      const fileJson = this.newlineFormat(this.json);

      try {
        const scrapeDir = this.conf.ui.paths.source.scrape;
        const scrapeFiles = fs.readdirSync(scrapeDir);
        const timeNow = Date.now();

        // To limit possible attack, limit posts to 2 per minute.
        // Check this by getting stat for last written file.
        for (let i = 0, l = scrapeFiles.length; i < l; i++) {
          const scrapeFile = scrapeFiles[i];
          const scrapeFileName = path.basename(scrapeFile);

          if (scrapeFileName === this.conf.scrape.scraper_file) {
            continue;
          }

          let scrapeFileStat;

          try {
            scrapeFileStat = fs.statSync(scrapeFile);
          }
          catch (err) {
            continue;
          }

          const scrapeFileBirthtime = scrapeFileStat.birthtimeMs;
          const scrapeFileAge = timeNow - scrapeFileBirthtime;

          if (scrapeFileAge < this.conf.scrape.limit_time) {
            this.redirectWithMsg('error', this.conf.scrape.limit_error_msg);

            return;
          }
        }

        this.filesWrite(scrapeDir, filename, fileMustache, fileJson);
      }
      catch (err) {
        this.redirectWithMsg('error', err.toString());

        return;
      }
    }

    // HTML scraper action on submission of URL.
    else if (
      this.url.trim() &&
      this.selector.trim() &&
      this.html2json.trim()
    ) {
      let html2jsonObj;
      let message;

      try {
        html2jsonObj = JSON.parse(this.html2json);
      }
      catch (err) {
        utils.error(err);

        message = 'The HTML at that URL and selector could not be parsed. Make sure it is well formed and ' +
          'syntactically correct.';

        this.redirectWithMsg('error', message);

        return;
      }

      if (!html2jsonObj || !html2jsonObj.child || !html2jsonObj.child.length) {
        message = 'The HTML at that URL and selector could not be parsed. Make sure that they are reachable and ' +
          'syntactically correct.';

        this.redirectWithMsg('error', message);

        return;
      }

      this.scrapeAndRender(this.selector.trim(), html2jsonObj);

      return;
    }

    // If no form variables sent, redirect back with GET.
    else {
      try {
        this.redirectWithMsg('error', 'Incorrect submission.');

        return;
      }
      catch (err) {
        utils.error(err);
      }
    }
  }
};
