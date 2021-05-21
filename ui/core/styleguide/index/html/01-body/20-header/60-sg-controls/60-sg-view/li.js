/**
 * @file ui/core/styleguide/index//html/01-body/20-header/60-sg-controls/60-sg-view/li.js
 * @description Annotations and code viewer toggles.
 */
// Annotations toggle click handler.
export function sgTAnnotationsClick(event) {
  event.preventDefault();

  const $orgs = FEPPER_UI.requerio.$orgs;
  const annotationsViewer = FEPPER_UI.annotationsViewer;

  annotationsViewer.toggleAnnotations();

  // If viewall, scroll to the focused pattern.
  if (annotationsViewer.viewall && annotationsViewer.annotationsActive) {
    annotationsViewer.scrollViewall();
  }

  $orgs['#sg-view'].dispatchAction('removeClass', 'active');
  $orgs['#sg-t-toggle'].dispatchAction('removeClass', 'active');
}

// Code toggle click handler.
export function sgTCodeClick(event) {
  event.preventDefault();

  const $orgs = FEPPER_UI.requerio.$orgs;
  const codeViewer = FEPPER_UI.codeViewer;

  codeViewer.toggleCode();

  // If viewall, scroll to the focused pattern.
  if (codeViewer.viewall && codeViewer.codeActive) {
    codeViewer.scrollViewall();
  }

  $orgs['#sg-view'].dispatchAction('removeClass', 'active');
  $orgs['#sg-t-toggle'].dispatchAction('removeClass', 'active');
}

/* istanbul ignore if */
if (typeof window === 'object') {
  document.addEventListener('DOMContentLoaded', () => {
    const $orgs = FEPPER_UI.requerio.$orgs;

    $orgs['#sg-t-annotations'].on('click', sgTAnnotationsClick);
    $orgs['#sg-t-code'].on('click', sgTCodeClick);

    // Click handler for "Open in new window" link.
    // Do not use Event.preventDefault().
    $orgs['#sg-raw'].on('click', function () {
      $orgs['#sg-view'].dispatchAction('removeClass', 'active');
      $orgs['#sg-t-toggle'].dispatchAction('removeClass', 'active');
    });
  });
}
