/**
 * @file ui/core/styleguide/index//html/01-body/20-header/30-sg-nav-container/30-sg-nav-toggle/a.js
 * @description Toggle hidden nav in smaller viewports.
 */
export function sgNavToggleClick(event) {
  event.preventDefault();

  const $orgs = FEPPER_UI.requerio.$orgs;
  const isActive = $orgs['#sg-nav-target'].getState().classList.includes('active');

  FEPPER_UI.uiFns.closeAllPanels();

  if (!isActive) {
    $orgs['#sg-nav-target'].dispatchAction('addClass', 'active');
  }
}

/* istanbul ignore if */
if (typeof window === 'object') {
  document.addEventListener('DOMContentLoaded', () => {
    FEPPER_UI.requerio.$orgs['.sg-nav-toggle'].on('click', sgNavToggleClick);
  });
}
