module.exports = {
  className: 'sg-find',
  dangerouslySetInnerHTML: {
    __html: `
{{^ ishControlsHide.find }}
  <a href="#" class="sg-acc-handle sg-control-trigger sg-icon sg-icon-search" id="sg-f-toggle" title="Search Patterns"><span class="is-vishidden">Search Patterns</span></a>
  <ul class="sg-view sg-acc-panel sg-right sg-checklist" id="sg-find" style="margin-top: 33px;">
      <li><input class="typeahead" id="typeahead" type="text" placeholder="search for a pattern..."></li>
  </ul>
{{/ ishControlsHide.find }}
`
  },
  onLoad: (() => {
    'use strict';
    if (typeof window === 'object') {

      const patternFinder = window.FEPPER_UI.uiProps.patternFinder;

      patternFinder.init();

      window.addEventListener('message', patternFinder.receiveIframeMessage, false);

      $('#sg-find .typeahead').focus(function () {
        if (!patternFinder.active) {
          patternFinder.openFinder();
        }
      });

      $('#sg-find .typeahead').blur(function () {
        patternFinder.closeFinder();
      });
    }
  })()
};
