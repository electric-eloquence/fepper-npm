/**
 * @file ui/core/styleguide/index//html/01-body/20-header/30-sg-nav-container/div.js
 * @description Accordion dropdown.
 */
export function sgAccHandleClick(event) {
  event.preventDefault();

  const $orgs = FEPPER_UI.requerio.$orgs;

  FEPPER_UI.uiFns.closeOtherPanels(this);
  $orgs['.sg-acc-handle'].hasElement(this).dispatchAction('toggleClass', 'active');
  $orgs['.sg-acc-panel'].hasPrev(this).dispatchAction('toggleClass', 'active');
}

/* istanbul ignore if */
if (typeof window === 'object') {
  document.addEventListener('DOMContentLoaded', () => {
    FEPPER_UI.requerio.$orgs['.sg-acc-handle'].on('click', sgAccHandleClick);
  });
}
