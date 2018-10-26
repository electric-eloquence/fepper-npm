'use strict';

const path = require('path');

const fs = require('fs-extra');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

function findSupportedStyleExtensions(dir, styleExtSupported) {
  if (!fs.existsSync(dir)) {
    return;
  }

  let items = fs.readdirSync(dir);

  for (let i = 0, l = items.length; i < l; i++) {
    const item = items[i];

    let itemFull = `${dir}/${item}`;
    let stat = fs.statSync(itemFull);

    if (stat.isFile()) {
      const ext = path.extname(itemFull);

      if (ext && styleExtSupported.indexOf(ext) === -1 && item[0] !== '.') {
        styleExtSupported.push(ext);
      }
    }
    else if (stat.isDirectory()) {
      findSupportedStyleExtensions(itemFull, styleExtSupported);
    }
  }
}

module.exports = class {
  constructor(patternlab) {
    this.patternlab = patternlab;
    this.config = patternlab.config;
    this.componentsDirCoreRoot = `${this.config.paths.core}/styleguide`;
    this.componentsArr = [];
    this.pathsPublic = patternlab.config.pathsPublic;
    this.styleExtSupported = ['.css'];
    this.utils = patternlab.utils;
    this.componentsDirCustomRoot = this.utils.deepGet(this, 'config.paths.source.ui');
    this.styleguidePath = this.config.paths.public.styleguide;

    findSupportedStyleExtensions(this.config.paths.source.css, this.styleExtSupported);
  }

  readDirectoriesFirst(dir) {
    const items = fs.readdirSync(dir);
    const itemsTmp = items.map(item => `${dir}/${item}`);
    const itemsNew = itemsTmp.filter(item => fs.statSync(item).isDirectory());

    for (let i = 0, l = itemsTmp.length; i < l; i++) {
      const item = itemsTmp[i];

      let stat = fs.statSync(item);

      if (stat.isFile()) {
        itemsNew.push(item);
      }
    }

    return itemsNew.map(item => path.basename(item));
  }

  mergeArrays(arrCore, arrCustom) {
    return arrCore
      .concat(
        arrCustom.filter(item => {
          if (arrCore.indexOf(item) === -1) {
            return true;
          }
          else {
            return false;
          }
        })
      )
      .sort();
  }

  stripComments(str_) {
    // Allow comments in component code, HTML or Mustache syntax. However, they won't appear in the final markup.
    let str = str_;
    str = str.replace(/<!\-\-[\S\s]*?\-\->/g, '');
    str = str.replace(/\{\{![\S\s]*?\}\}/g, '');

    return str;
  }

  recurseComponentsArr(componentsArr) {
    const tmpArr = [null];

    let renderObj;

    for (let i = 0, l = componentsArr.length; i < l; i++) {
      const item = componentsArr[i];

      if (Array.isArray(item)) {
        renderObj = this.recurseComponentsArr(item);
        tmpArr.push(renderObj);
      }
      else if (typeof item === 'string') {
        if (item.slice(-13) === '.component.js') {
          const el = path.basename(item, '.component.js');
          const data = require(item);

          // Strip comments.
          if (data && data.dangerouslySetInnerHTML && data.dangerouslySetInnerHTML.__html) {
            data.dangerouslySetInnerHTML.__html = this.stripComments(data.dangerouslySetInnerHTML.__html);
          }

          tmpArr.unshift(data);
          tmpArr.unshift(el);
          renderObj = React.createElement.apply(null, tmpArr);
        }
      }
    }

    return renderObj;
  }

  recurseComponentsDirs(dir, tmpArr) {
    let dirCore;
    let dirCustom;

    if (dir.indexOf(this.componentsDirCoreRoot) === 0) {
      dirCore = dir;

      if (this.componentsDirCustomRoot) {
        dirCustom = dir.replace(this.componentsDirCoreRoot, this.componentsDirCustomRoot);
      }

    }
    else if (dir.indexOf(this.componentsDirCustomRoot) === 0) {
      dirCore = dir.replace(this.componentsDirCustomRoot, this.componentsDirCoreRoot);

      if (this.componentsDirCustomRoot) {
        dirCustom = dir;
      }
    }

    const dirCoreExists = fs.existsSync(dirCore);
    const dirCustomExists = fs.existsSync(dirCustom);

    // First, compile style and client-side script files.
    const itemsCore = dirCoreExists ? fs.readdirSync(dirCore) : [];
    const itemsCustom = dirCustomExists ? fs.readdirSync(dirCustom) : [];
    const items = this.mergeArrays(itemsCore, itemsCustom);

    for (let i = 0, l = items.length; i < l; i++) {
      const item = items[i];
      const ext = path.extname(item);

      if (
        this.styleExtSupported.indexOf(ext) > -1 ||
        ext === '.js' && item.slice(-13) !== '.component.js'
      ) {
        let pathFull;

        if (itemsCustom.indexOf(item) > -1) {
          pathFull = `${dirCustom}/${item}`;
        }
        else if (itemsCore.indexOf(item) > -1) {
          pathFull = `${dirCore}/${item}`;
        }

        const content = fs.readFileSync(pathFull, 'utf8');

        if (this.styleExtSupported.indexOf(ext) > -1) {
          fs.appendFileSync(`${this.styleguidePath}/styles/ui${ext}`, content);
        }
        else if (ext === '.js' && item.slice(-13) !== '.component.js') {
          let contentScoped = content.replace(/\n$/, '');
          contentScoped = contentScoped.replace(/^/gm, '      ');
          contentScoped = '    (() => {\n' + contentScoped + '\n    })();\n';

          fs.appendFileSync(`${this.styleguidePath}/scripts/ui${ext}`, contentScoped);
        }
      }
    }

    // Then, take steps to recursively compile renderObj.
    const componentsCore = dirCoreExists ? this.readDirectoriesFirst(dirCore) : [];
    const componentsCustom = dirCustomExists ? this.readDirectoriesFirst(dirCustom) : [];
    const components = this.mergeArrays(componentsCore, componentsCustom);

    for (let i = 0, l = components.length; i < l; i++) {
      const item = components[i];
      const itemCustom = `${dirCustom}/${path.basename(item)}`;
      const itemCore = `${dirCore}/${path.basename(item)}`;

      let statCustom;

      if (fs.existsSync(itemCustom)) {
        statCustom = fs.statSync(itemCustom);
      }

      let statCore;

      if (fs.existsSync(itemCore)) {
        statCore = fs.statSync(itemCore);
      }

      if (statCustom && statCustom.isFile()) {
        if (itemCustom.slice(-13) === '.component.js') {
          tmpArr.push(itemCustom);
        }
      }
      else if (statCore && statCore.isFile()) {
        if (itemCore.slice(-13) === '.component.js') {
          tmpArr.push(itemCore);
        }
      }
      // Need to recurse into core directories by default.
      else if (statCore && statCore.isDirectory()) {
        tmpArr.push([]);
        this.recurseComponentsDirs(itemCore, tmpArr[tmpArr.length - 1]);
      }
      // Only recurse into custom directories if an equivalent core directory does not exist.
      else if (statCustom && statCustom.isDirectory()) {
        tmpArr.push([]);
        this.recurseComponentsDirs(itemCustom, tmpArr[tmpArr.length - 1]);
      }
    }
  }

  main() {
    // Delete old compiled styles.
    for (let i = 0, l = this.styleExtSupported.length; i < l; i++) {
      const ext = this.styleExtSupported[i];
      const fileStyles = `${this.styleguidePath}/styles/ui${ext}`;

      if (fs.existsSync(fileStyles)) {
        fs.removeSync(fileStyles);
      }
    }

    // Delete old compiled client-side scripts.
    const fileScripts = `${this.styleguidePath}/scripts/ui.js`;

    if (fs.existsSync(fileScripts)) {
      fs.removeSync(fileScripts);
    }

    // Write ui.js so that its scripts fire after DOMContentLoaded.
    const uiJsPrefix =
`document.addEventListener(
  'DOMContentLoaded',
  function () {
    'use strict';
`;

    fs.outputFileSync(`${this.styleguidePath}/scripts/ui.js`, uiJsPrefix);
    this.recurseComponentsDirs(`${this.componentsDirCoreRoot}/index/html`, this.componentsArr);

    // Finish ui.js.
    const uiJsSuffix = '  },\n  false\n);\n';

    fs.appendFileSync(`${this.styleguidePath}/scripts/ui.js`, uiJsSuffix);

    let renderObj;

    try {
      renderObj = this.recurseComponentsArr(this.componentsArr);
    }
    catch (err) {
      this.utils.error(err);

      return;
    }

    const uiCreate = React.createFactory(
      class extends React.Component {
        constructor(props) {
          super(props);
        }

        render() {
          return renderObj;
        }
      }
    );

    let output = `<!DOCTYPE html>${ReactDOMServer.renderToString(uiCreate())}`;
    output = output.replace(/\{\{\{?\s*pathsPublic.css\s*\}?\}\}/g, this.pathsPublic.css);
    output = output.replace(/\{\{\{?\s*pathsPublic.js\s*\}?\}\}/g, this.pathsPublic.js);

    fs.outputFileSync(`${this.config.paths.public.root}/index.html`, output);
  }
};