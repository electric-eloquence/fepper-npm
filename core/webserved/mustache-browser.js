(() => {
  'use strict'; // eslint-disable-line strict

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.mustache-browser__link').forEach((link) => {
      link.addEventListener('click', (e) => {
        // Only run when loaded from within the iframe.
        if (parent === window) {
          return;
        }

        e.preventDefault();

        const messageObj = {
          event: 'patternlab.updatePath',
          path: link.dataset.path,
          patternPartial: link.dataset.patternpartial
        };
        const targetOrigin =
          (window.location.protocol === 'file:') ? '*' : window.location.protocol + '//' + window.location.host;

        parent.postMessage(messageObj, targetOrigin);
      });
    });
  });
})();
