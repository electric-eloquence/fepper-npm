((d) => {
  'use strict'; // eslint-disable-line strict

  const baseUrl = window.location.protocol + '//' + window.location.host;
  const loadAnim = d.getElementById('load-anim');
  const message = d.getElementById('message');
  const stage = d.getElementById('scraper__stage');
  const targeter = d.getElementById('scraper__targeter');

  function fetchCors(url_) {
    let url;

    if (url_[0] === '/') {
      url = baseUrl + url_;
    }
    else {
      url = url_;
    }

    return fetch('/html-scraper-xhr/cors?url=' + encodeURIComponent(url))
      .then((response) => {
        return new Promise((resolve, reject) => {
          if (response.ok) {
            stage.src = baseUrl + '/html-scraper-xhr/cors?url=' + encodeURIComponent(url);

            resolve();
          }
          else {
            message.className = 'message error';
            message.innerHTML = 'ERROR! Please enter a valid, reachable URL.';
            d.body.scrollTop = d.documentElement.scrollTop = 0;

            reject(response.statusText);
          }
        });
      })
      .catch((err) => {
        // eslint-disable-next-line curly, no-console
        if (err) console.error(err);
      });
  }

  function nodeListToJson(nodeItem, jsonToRecurse) {
    switch (nodeItem.nodeType) {
      case 1:
        jsonToRecurse.node = 'element';

        if (typeof nodeItem.nodeName === 'string') {
          jsonToRecurse.tag = nodeItem.nodeName.toLowerCase();
        }

        if (nodeItem.attributes.length) {
          jsonToRecurse.attr = {};

          for (let i = 0, l = nodeItem.attributes.length; i < l; i++) {
            const attribute = nodeItem.attributes[i];
            jsonToRecurse.attr[attribute.name] = attribute.value;
          }
        }

        break;

      case 3:
        jsonToRecurse.node = 'text';
        jsonToRecurse.text = nodeItem.textContent;

        break;

      case 8:
        jsonToRecurse.node = 'comment';
        jsonToRecurse.text = nodeItem.textContent;

        break;

      default:
        jsonToRecurse.node = '';
    }

    if (nodeItem.childNodes.length) {
      jsonToRecurse.child = [];

      for (let i = 0, l = nodeItem.childNodes.length; i < l; i++) {
        jsonToRecurse.child.push({});
        nodeListToJson(nodeItem.childNodes[i], jsonToRecurse.child[i]);
      }
    }
  }

  function validateAndParseSelector(selectorRaw) {
    const selectorSplit = selectorRaw.trim().split('[');
    const selector = selectorSplit[0];
    let index;
    let retVal;

    // Validate.
    // eslint-disable-next-line no-useless-escape
    if (!/^(#|\.)?[_a-z][\w#\-\.]*$/i.test(selector)) {
      retVal = null;
    }

    if (selectorSplit[1]) {
      if (/^\d+\]$/.test(selectorSplit[1])) {
        index = selectorSplit[1].slice(0, -1);
      }
      else {
        retVal = null;
      }
    }

    if (retVal === null) {
      message.className = 'message error';
      message.innerHTML = 'ERROR! Please enter a correctly syntaxed selector.';
      d.body.scrollTop = d.documentElement.scrollTop = 0;
    }
    else {
      message.className = 'message';
      message.innerHTML = '';
      targeter.selector.value = selector;
      targeter.index.value = index = index || '';
      retVal = {selector, index};
    }

    return retVal;
  }

  targeter.addEventListener('submit', (e) => {
    e.preventDefault();

    const validatedSelector = validateAndParseSelector(targeter.selector_raw.value);

    if (validatedSelector) {
      const {selector, index} = validatedSelector;

      loadAnim.style.display = 'block';
      stage.setAttribute('data-selector', selector);
      stage.setAttribute('data-index', index);
      fetchCors(targeter.url.value);
    }
  });

  stage.addEventListener('load', () => {
    const innerHTML = stage.contentWindow.document.body.innerHTML;

    if (innerHTML) {
      // Parse xhr.responseText as DOM. Create an object consumable by the html2json library.
      const parser = new DOMParser();
      const doc = parser.parseFromString(innerHTML, 'text/html');
      const selector = stage.getAttribute('data-selector');
      const selection = doc ? doc.querySelectorAll(selector) : [];
      const html2json = {node: 'root', child: []};

      for (let i = 0, l = selection.length; i < l; i++) {
        html2json.child.push({});
        nodeListToJson(selection[i], html2json.child[i]);
      }

      message.className = 'message';
      message.innerHTML = '';

      targeter.html2json.value = JSON.stringify(html2json);
      targeter.submit();
    }
  });

  // Show/hide help text.
  const helpShowButton = d.getElementById('help-show');
  const helpHideButton = d.getElementById('help-hide');
  let helpText;

  if (helpShowButton) {
    helpShowButton.addEventListener('click', (e) => {
      e.preventDefault();

      helpText = helpText || d.getElementById('help-text') || {style: {}};
      helpText.style.visibility = 'visible';
      helpShowButton.style.display = 'none';
      helpHideButton.style.display = 'block';
    });
  }

  if (helpHideButton) {
    helpHideButton.addEventListener('click', (e) => {
      e.preventDefault();

      helpText = helpText || d.getElementById('help-text') || {style: {}};
      helpText.style.visibility = 'hidden';
      helpHideButton.style.display = 'none';
      helpShowButton.style.display = 'block';
    });
  }

  // Validate importer form.
  const importer = d.forms.importer;

  if (importer) {
    importer.addEventListener('submit', (e) => {
      if (
        !/^[0-9a-z][\w\-\.]*$/i.test(importer.filename.value) || // eslint-disable-line no-useless-escape
        importer.filename.value.indexOf('00-html-scraper') === 0
      ) {
        e.preventDefault();

        message.className = 'message error';
        message.innerHTML = 'ERROR! Please enter a valid filename.';
        d.body.scrollTop = d.documentElement.scrollTop = 0;
      }
    });
  }
})(document);
