'use strict';

const Feplet = require('feplet');
const fs = require('fs-extra');
const he = require('he');
const html2json = require('html2json').html2json;
const json2html = require('html2json').json2html;

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
  constructor(req, res, conf, gatekeeper, html, options) {
    this.req = req;
    this.res = res;
    this.conf = conf;
    this.gatekeeper = gatekeeper;
    this.html = html;
    this.options = options;
    this.appDir = options.appDir;
    this.rootDir = options.rootDir;
    this.utils = options.utils;

    // Set some defaults for possibly non-existent nested request properties.
    this.filename = this.utils.deepGet(this, 'req.body.filename') || '';
    this.html2json = this.utils.deepGet(this, 'req.body.html2json') || '';
    this.json = this.utils.deepGet(this, 'req.body.json') || '';
    this.mustache = this.utils.deepGet(this, 'req.body.mustache') || '';
    this.selector = this.utils.deepGet(this, 'req.body.selector') || '';
    this.selectorIdx = this.utils.deepGet(this, 'req.body.index') || ''; // Leave as string, parseInt later.
    this.selectorRaw = this.utils.deepGet(this, 'req.body.selector_raw') || '';
    this.url = this.utils.deepGet(this, 'req.body.url') || '';
  }

  /**
   * Recurse through the object returned by html2json to find the selected element(s).
   *
   * @param {object} selectorObj - An object describing selection criteria.
   * @param {object} html2jsonObj - The object returned by html2json.
   * @param {object|null} persistentObj_ - A mutating object persisting to return results. Not submitted at level 0.
   * @param {number} level - The level of recursion. Not submitted at level 0.
   * @returns {object} An html2json object containing the matched elements. Only returns at level 0.
   */
  elementSelect(selectorObj, html2jsonObj, persistentObj_ = null, level = 0) {
    // Validate 1st param.
    // Validate 2nd param.
    /* istanbul ignore if */
    if (!html2jsonObj || html2jsonObj.constructor !== Object || !Array.isArray(html2jsonObj.child)) {
      return null;
    }

    const persistentObj = persistentObj_ || new HtmlObj();
    const selector = selectorObj.selector;
    const selectorType = selectorObj.type;
    persistentObj.index = selectorObj.index;

    for (let i = 0; i < html2jsonObj.child.length; i++) {
      let child = html2jsonObj.child[i];

      /* istanbul ignore if */
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
          if (child.tag && child.tag === selector) {
            persistentObj.child.push(child);
            matched = true;
          }
          break;
        case 'id':
          if (child.attr && child.attr.id && child.attr.id === selector) {
            persistentObj.child.push(child);
            matched = true;
          }
          break;
        case 'class':
          if (child.attr && child.attr.class && child.attr.class.indexOf(selector) > -1) {
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

    if (level === 0) {
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
    const scrapeFiles = fs.readdirSync(scrapeDir);
    const timeNow = Date.now();

    // To limit possible attack, limit posts to 1 per 30 seconds.
    // Check this by getting stat for last written file.
    for (let i = 0, l = scrapeFiles.length; i < l; i++) {
      const scrapeFile = `${scrapeDir}/${scrapeFiles[i]}`;

      if (scrapeFiles[i] === this.conf.scrape.scraper_file) {
        continue;
      }

      let scrapeFileStat;

      try {
        scrapeFileStat = fs.statSync(scrapeFile);
      }
      catch /* istanbul ignore next */ {
        continue;
      }

      const scrapeFileBirthtime = scrapeFileStat.birthtimeMs;
      const scrapeFileAge = timeNow - scrapeFileBirthtime;

      // this.conf.scrape.limit_time set in fepper-utils.
      if (scrapeFileAge < this.conf.scrape.limit_time) {
        this.redirectWithMsg('error', `${t('ERROR')}! ${this.conf.scrape.limit_error_msg}`);

        return;
      }
    }

    try {
      fs.outputFileSync(scrapeDir + '/' + filename + '.mustache', fileMustache);
      fs.outputFileSync(scrapeDir + '/' + filename + '.json', fileJson);

      let message = `${t('SUCCESS')}! `;
      message += `${t('Refresh the browser to check that your template appears under the &quot;Scrape&quot; menu.')}`;

      this.redirectWithMsg('success', message);
    }
    catch (err) /* istanbul ignore next */ {
      this.utils.error(err);
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
    const url = this.url
    const selectorRaw = this.selectorRaw;

    let outputFpt = this.html.headScraper;
    outputFpt += this.html.loadingAnimation;
    outputFpt += this.html.scraperHeading;
    outputFpt += this.html.reviewerPrefix;
    outputFpt += targetHtml;
    outputFpt += this.html.reviewerSuffix;
    outputFpt += this.html.importerPrefix;
    outputFpt += '{{{ mustache }}}';
    outputFpt += this.html.json;
    outputFpt += dataStr.replace(/&quot;/g, '&bsol;&quot;'); // Escape double-quotes.
    outputFpt += this.html.importerSuffix;
    outputFpt += this.html.landingBody;
    outputFpt += this.html.helpText;
    outputFpt += this.html.scraperStage;
    outputFpt += '\n      <script src ="/node_modules/fepper-ui/scripts/pattern/html-scraper-dhtml.js"></script>';
    outputFpt += this.html.foot;

    const patternlabFoot = Feplet.render(
      this.html.getImmutableFooter(this.conf),
      {
        portReloader: this.conf.livereload_port,
        portServer: this.conf.express_port
      }
    );

    const output = Feplet.render(
      outputFpt,
      {
        title: t('Fepper HTML Scraper'),
        main_id: 'fepper-html-scraper',
        msg_class: msgClass,
        message,
        mustache,
        url,
        selector_raw: selectorRaw,
        help_buttons: this.html.helpButtons,
        help_text: this.html.scraperHelpText,
        patternlabFoot
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
    catch (err) /* istanbul ignore next */ {
      // Can work with null jsonForMustache.
      this.utils.warn(err);
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
    // Invalidate filename starting with "00-html-scraper" as defined in fepper-utils.
    if (filename.indexOf(this.conf.scrape.scraper_file.slice(0, -(this.conf.ui.patternExtension.length))) === 0) {
      return false;
    }

    // eslint-disable-next-line no-useless-escape
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
      for (let jsonForMustacheChild of jsonForMustache.child) {
        if (
          jsonForMustacheChild.node === 'text' &&
          typeof jsonForMustacheChild.text === 'string' &&
          jsonForMustacheChild.text.trim()
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
            let i = dataKeys[inc].length;

            while (i--) {
              const dataKey = dataKeys[inc][i];

              // Check dataKeys for similarly named items.
              if (dataKey.indexOf(underscored) === 0) {

                // Slice off the suffix of the last match.
                let suffix = dataKey.slice(underscored.length);
                let suffixInt = 0;

                if (suffix) {
                  // Increment that suffix and append to the new key.
                  let suffixSlice = suffix.slice(1);

                  if (/^\d+$/.test(suffixSlice)) {
                    suffixInt = parseInt(suffixSlice);
                    ++suffixInt;
                  }
                }
                else {
                  // underscored exactly matches dataKeys[inc][i]
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
            tmpObj[underscored] = jsonForMustacheChild.text.trim();
            dataKeys[inc].push(underscored);
            jsonForData.scrape[inc][underscored] = tmpObj[underscored].replace(/"/g, '\\"');
            jsonForMustacheChild.text = '{{ ' + underscored + ' }}';
          }
        }
        else if (
          jsonForMustacheChild.node === 'comment' &&
          jsonForMustacheChild.text.indexOf(' SCRAPER SELECTION ') === 0
        ) {
          inc++;
          jsonForData.scrape[inc] = {};
          dataKeys.push([]);
        }
        else {
          this.jsonRecurse(jsonForMustacheChild, jsonForData, dataKeys, inc);
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
    catch (err) /* istanbul ignore next */ {
      this.utils.error(err);
    }

    if (jsonForData.scrape) {
      mustache = mustache.replace(/^\s*<body>/, '{{# scrape }}');
      mustache = mustache.replace(/<\/body>\s*$/, '{{/ scrape }}\n');
    }
    else {
      mustache = mustache.replace(/^\s*<body>/, '');
      mustache = mustache.replace(/<\/body>\s*$/, '\n');
    }

    mustache = this.utils.beautifyTemplate(mustache);

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
   */
  redirectWithMsg(msgClass, message) {
    if (this.res) {
      this.res.writeHead(
        303,
        {
          Location:
            '/html-scraper?msg_class=' + encodeURIComponent(msgClass) +
            '&message=' + encodeURIComponent(message) +
            '&url=' + encodeURIComponent(this.url) +
            '&selector_raw=' + encodeURIComponent(this.selectorRaw)
        }
      );
      this.res.end();
    }
  }

  scrapeAndRender(selectorObj, html2jsonObj) {
    let msgClass;
    let message;

    try {
      const elementSelection = this.elementSelect(selectorObj, html2jsonObj);
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
      /* istanbul ignore else */
      if (jsonForMustache) {
        mustache = this.jsonToMustache(jsonForMustache, jsonForData);
      }
      else {
        // eslint-disable-next-line max-len
        message = `${t('WARNING')}! ${t('The HTML at that URL and selector contains code (probably SVG or XML) defined outside the HTML spec. This will prevent Fepper from writing its data into a JSON file.')}`;
        msgClass = 'warning';
        mustache = targetSingle;
      }

      const output = this.htmlOutput(jsonForData, targetHtml, mustache, msgClass, message);

      this.res.send(output);
    }
    catch (err) /* istanbul ignore next */ {
      this.utils.error(err);
    }
  }

  /**
   * Objectify raw selector string.
   *
   * @param {string} selectorRaw - CSS selector plus optional array index.
   * @param {string} selectorIdx - The index at which to select from an array of CSS selections.
   * @returns {object} CSS selector, its index, and type.
   */
  selectorObjectify(selectorRaw, selectorIdx) {
    // DEPRECATED: The parsing of the raw selector into selector name and index should have occurred on the client-side.
    // It is extraneous in newer Fepper versions and will be removed.
    const selectorSplit = selectorRaw.trim().split('[');
    let index;
    let selector;
    let type;

    if (selectorSplit[1]) {
      // DEPRECATED
      if (/^\d+\]$/.test(selectorSplit[1])) {
        index = selectorSplit[1].slice(0, -1);
      }
    }
    else {
      index = selectorIdx;
    }

    if (index === '') {
      index = -1;
    }
    else {
      index = parseInt(index);
    }

    switch (selectorSplit[0][0]) {
      case '#':
        selector = selectorSplit[0].slice(1);
        type = 'id';
        break;
      case '.':
        selector = selectorSplit[0].slice(1);
        type = 'class';
        break;
      default:
        selector = selectorSplit[0];
        type = 'tag';
    }

    return {selector, index, type};
  }

  /**
   * Iterate through collection of selected elements. If an index is specified, skip until that index is iterated upon.
   *
   * @param {string} html2jsonObj - An html2json object.
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
            // DO NOT internationalize this.
            allObj.child[childIndexLast].text = `\n<!-- SCRAPER SELECTION ${elIndex} -->\n`;
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
    /* istanbul ignore if */
    if (!this.gatekeeper.gatekeep(this.req)) {
      this.gatekeeper.render(this.req, this.res);

      return;
    }

    // HTML importer action on submission of filename.
    // This condition needs to be first since it will be submitted with the other fields populated.
    if (this.filename) {

      // Limit filename characters.
      let filename;

      if (!this.filenameValidate(this.filename)) {
        this.redirectWithMsg('error', `${t('ERROR')}! ${t('Invalid filename!')}`);

        return;
      }
      else {
        filename = this.filename;
      }

      const fileMustache = this.newlineFormat(this.mustache);
      const fileJson = this.newlineFormat(this.json);
      const scrapeDir = this.conf.ui.paths.source.scrape;

      this.filesWrite(scrapeDir, filename, fileMustache, fileJson);
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
      catch (err) /* istanbul ignore next */ {
        this.utils.error(err);

        message = `${t('ERROR')}! `;
        // eslint-disable-next-line max-len
        message += `${t('The HTML at that URL and selector could not be parsed. Make sure it is well formed and syntactically correct.')}`;

        this.redirectWithMsg('error', message);

        return;
      }

      /* istanbul ignore if */
      if (!html2jsonObj || !html2jsonObj.child || !html2jsonObj.child.length) {
        message = `${t('ERROR')}! `;
        // eslint-disable-next-line max-len
        message += `${t('The HTML at that URL and selector could not be scraped. Make sure that they are reachable and syntactically correct.')}`;

        this.redirectWithMsg('error', message);

        return;
      }

      const selectorObj = this.selectorObjectify(this.selector, this.selectorIdx);

      this.scrapeAndRender(selectorObj, html2jsonObj);

      return;
    }

    // If no form variables sent, redirect back with GET.
    else {
      try {
        this.redirectWithMsg('error', `${t('ERROR')}! ${t('Incorrect submission!')}`);

        return;
      }
      catch (err) /* istanbul ignore next */ {
        this.utils.error(err);
      }
    }
  }
};
