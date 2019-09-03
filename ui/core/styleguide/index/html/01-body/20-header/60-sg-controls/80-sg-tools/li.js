/**
 * @file ui/core/styleguide/index//html/01-body/20-header/60-sg-controls/80-sg-tools/li.js
 * @description Documentation links.
 */
/* istanbul ignore if */
if (typeof window === 'object') {
  document.addEventListener('DOMContentLoaded', () => {
    const $orgs = FEPPER_UI.requerio.$orgs;

    // Do not use Event.preventDefault().
    $orgs['.sg-tool'].on('click', function () {
      $orgs['#sg-tools'].dispatchAction('removeClass', 'active');
      $orgs['#sg-tools-toggle'].dispatchAction('removeClass', 'active');
    });
  });
}
