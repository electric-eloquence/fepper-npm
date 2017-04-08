'use strict';

const browserify = require('browserify');
const fs = require('fs');
const path = require('path');
const React = require('react');
const stream = require('stream');

const DOM = React.DOM;
const Readable = stream.Readable;
const Writable = stream.Writable;

function readDirectoriesFirst(dir) {
  const items = fs.readdirSync(dir);

  const itemsTmp = items.map(item => {
    return path.resolve(dir, item);
  });

  const itemsNew = itemsTmp.filter(item => {
    let stat = fs.statSync(item);
    return stat.isDirectory();
  });

  itemsTmp.forEach(item => {
    let stat = fs.statSync(item);
    if (stat.isFile()) {
      itemsNew.push(item);
    }
  });

  return itemsNew.map(item => path.basename(item));
}

function findSupportedStyleExtensions(dir, extSupported) {
  let items = fs.readdirSync(dir);

  items.forEach(item => {
    let itemFull = `${dir}/${item}`;
    let stat = fs.statSync(itemFull);

    if (stat.isFile()) {
      const ext = path.extname(itemFull);
      if (ext && extSupported.indexOf(ext) === -1 && item[0] !== '.') {
        extSupported.push(ext);
      }
    } else if (stat.isDirectory()) {
      findSupportedStyleExtensions(itemFull, extSupported);
    }
  });
}

function stripComments(str_) {
  // Allow comments in component code, HTML or Mustache syntax. However, they won't appear in the final markup.
  let str = str_;
  str = str.replace(/<!\-\-[\S\s]*?\-\->/g, '');
  str = str.replace(/\{\{![\S\s]*?\}\}/g, '');
  return str;
}

function recurseComponentsArr(componentsArr) {
  let renderObj;
  const tmpArr = [null];

  componentsArr.forEach(item => {
    if (Array.isArray(item)) {
      renderObj = recurseComponentsArr(item);
      tmpArr.push(renderObj);

    } else if (typeof item === 'string') {
      const ext = path.extname(item);

      if (ext === '.js') {
        const el = path.basename(item, '.js');
        const data = require(item);

        // Strip comments.
        if (data && data.dangerouslySetInnerHTML && data.dangerouslySetInnerHTML.__html) {
          data.dangerouslySetInnerHTML.__html = stripComments(data.dangerouslySetInnerHTML.__html);
        }
        tmpArr[0] = data;
        renderObj = DOM[el].apply(null, tmpArr);
      }
    }
  });

  return renderObj;
}

function createRenderObj() {
  return recurseComponentsArr(this.componentsArr);
}

function mergeArrays(arrCore, arrCustom) {
  return arrCore
    .concat(
      arrCustom.filter(item => {
        if (arrCore.indexOf(item) === -1) {
          return true;
        } else {
          return false;
        }
      })
    )
    .sort();
}

function recurseComponentsDirs(dir, tmpArr) {
  let dirCore;
  let dirCustom;

  if (dir.indexOf(this.componentsDirCoreRoot) === 0) {
    dirCore = dir;

    if (this.componentsDirCustomRoot) {
      dirCustom = dir.replace(this.componentsDirCoreRoot, this.componentsDirCustomRoot);
    }

  } else if (dir.indexOf(this.componentsDirCustomRoot) === 0) {
    dirCore = dir.replace(this.componentsDirCustomRoot, this.componentsDirCoreRoot);

    if (this.componentsDirCustomRoot) {
      dirCustom = dir;
    }
  }

  const dirCoreExists = fs.existsSync(dirCore);
  const dirCustomExists = fs.existsSync(dirCustom);

  // First, compile style file.
  const forStylesCore = dirCoreExists ? fs.readdirSync(dirCore) : [];
  const forStylesCustom = dirCustomExists ? fs.readdirSync(dirCustom) : [];
  const forStyles = mergeArrays(forStylesCore, forStylesCustom);

  forStyles.forEach(item => {
    // For non-js files, assume they are css or style-related. Concatenate them.
    const ext = path.extname(item);
    let pathFull;

    if (this.extSupported.indexOf(ext) > -1) {
      if (forStylesCustom.indexOf(item) > -1) {
        pathFull = path.resolve(dirCustom, item);

      } else if (forStylesCore.indexOf(item) > -1) {
        pathFull = path.resolve(dirCore, item);
      }

      const content = fs.readFileSync(pathFull, 'utf8');
      fs.appendFileSync(`${this.styleguidePath}/styles/ui${ext}`, content);
    }
  });

  // Then, take steps to recursively compile renderObj.
  const forScriptsCore = dirCoreExists ? readDirectoriesFirst(dirCore) : [];
  const forScriptsCustom = dirCustomExists ? readDirectoriesFirst(dirCustom) : [];
  const forScripts = mergeArrays(forScriptsCore, forScriptsCustom);

  forScripts.forEach(item => {
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
      const ext = path.extname(itemCustom);
      if (ext === '.js') {
        tmpArr.push(itemCustom);
      }

    } else if (statCore && statCore.isFile()) {
      const ext = path.extname(itemCore);
      if (ext === '.js') {
        tmpArr.push(itemCore);
      }

    // Need to recurse into core directories by default.
    } else if (statCore && statCore.isDirectory()) {
      tmpArr.push([]);
      recurseComponentsDirs.call(this, `${itemCore}`, tmpArr[tmpArr.length - 1]);

    // Only recurse into custom directories if an equivalent core directory does not exist.
    } else if (statCustom && statCustom.isDirectory()) {
      tmpArr.push([]);
      recurseComponentsDirs.call(this, `${itemCustom}`, tmpArr[tmpArr.length - 1]);
    }
  });
}

function recurseComponentsDirForClient(componentsArr, componentsArrForClient) {
  let last = componentsArr.length - 1;

  if (typeof componentsArr[last] === 'string') {
    componentsArrForClient.push(`window.React.DOM.${path.basename(componentsArr[last], '.js')}`);
    componentsArrForClient.push(`require('${componentsArr[last]}')`);

    for (let i = 0; i < last; i++) {
      let item = componentsArr[i];

      if (Array.isArray(item)) {
        let tmpArr = [];
        componentsArrForClient.push(tmpArr);
        recurseComponentsDirForClient(item, tmpArr);
      }
    }
  }
}

module.exports = class {
  constructor(patternlab) {
    this.config = patternlab.config;
    this.componentsDirCoreRoot = __dirname;
    this.componentsDirCustomRoot = this.config.paths.source.ui || null;
    this.componentsArr = [];
    this.extSupported = ['.css'];
    this.styleguidePath = this.config.paths.public.styleguide;
  }

  init(forceCompile) {
    if (!this.config.compileUiOnEveryBuild && !forceCompile) {
      return Promise.resolve();
    }

    return new Promise(resolve => {
      findSupportedStyleExtensions(this.config.paths.source.css, this.extSupported);

      this.extSupported.forEach(ext => {
        if (fs.existsSync(`${this.styleguidePath}/styles/ui${ext}`)) {
          fs.unlinkSync(`${this.styleguidePath}/styles/ui${ext}`);
        }
      });

      recurseComponentsDirs.call(this, `${this.componentsDirCoreRoot}/index/html`, this.componentsArr);

      let componentsArrForClient = [];
      recurseComponentsDirForClient(this.componentsArr, componentsArrForClient);

      let componentsToStream = JSON.stringify(componentsArrForClient);
      componentsToStream = componentsToStream.replace(/^\[/, '');
      componentsToStream = componentsToStream.replace(/","require/g, '(require');
      componentsToStream = componentsToStream.replace(/(require\('[^']*'\))",\["/g, '$1,');
      componentsToStream = componentsToStream.replace(/\],\[/g, '),');
      componentsToStream = componentsToStream.replace(/\]/g, ')');
      componentsToStream = componentsToStream.replace(/"/g, '');

      let streamToBrowserify = `window.componentsForClient = () => ${componentsToStream};`;

      const readable = new Readable();
      readable.push(streamToBrowserify);
      readable.push(null);

      const writable = new Writable();
      global.componentsForClient = '';

      writable.on('pipe', src => {
        src.on('data', chunk => {
          global.componentsForClient += chunk.toString();
        });

        src.on('readable', () => {
          src.read();
        });

        src.on('end', () => {
          writable.end();
        });

        src.on('error', err => {
          console.error(err);
          writable.end();
        });
      });

      writable.on('finish', () => {
        global.componentsForClient = stripComments(global.componentsForClient);
        resolve(createRenderObj.bind(this));
      });


      writable.on('error', () => {
      });


      browserify(readable)
        .bundle()
        .pipe(writable);
    });
  }
};
