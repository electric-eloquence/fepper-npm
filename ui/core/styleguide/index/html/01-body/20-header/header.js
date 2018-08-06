module.exports = {
  className: 'sg-header',
  role: 'banner',
  onLoad: (() => {
    'use strict';
    if (typeof window === 'object') {

      // Close all dropdowns and navigation.
      window.FEPPER_UI.uiFns.closePanels = () => {
        $('.sg-nav-container, .sg-nav-toggle, .sg-acc-handle, .sg-acc-panel').removeClass('active');
      };
    }
  })()
};
