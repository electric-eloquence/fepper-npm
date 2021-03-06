/**
 * @file ui/core/styleguide/index//html/01-body/20-header/60-sg-controls/20-sg-size/li.js
 * @description Viewport resizer.
 */
/* istanbul ignore if */
if (typeof window === 'object') {
  document.addEventListener('DOMContentLoaded', () => {
    const $orgs = FEPPER_UI.requerio.$orgs;
    const {
      uiFns,
      uiProps
    } = FEPPER_UI;

    // Toggle hidden sg-size-options buttons at small sw.
    $orgs['#sg-form-label'].on('click', function (e) {
      e.preventDefault();

      if (uiProps.sw > uiProps.bpSm && uiProps.sw <= uiProps.bpMd) {
        $orgs['.sg-size'].dispatchAction('toggleClass', 'active');
      }
    });

    // Pixel input.
    $orgs['#sg-size-px'].on('keydown', function (e) {
      let val = parseFloat($orgs['#sg-size-px'].getState().val);

      if (Number.isNaN(val) || !Number.isInteger(val)) {
        return;
      }

      if (e.keyCode === 38) { // If the up arrow key is hit.
        val++;

        uiFns.sizeIframe(val, false);
      }
      else if (e.keyCode === 40) { // If the down arrow key is hit.
        val--;

        uiFns.sizeIframe(val, false);
      }
      else if (e.keyCode === 13) { // If the Enter key is hit.
        e.preventDefault();

        uiFns.sizeIframe(val); // Size iframe to value of text box.
        $orgs['#sg-size-px'].dispatchAction('blur');
      }
    });

    // Em input.
    $orgs['#sg-size-em'].on('keydown', function (e) {
      let val = parseFloat($orgs['#sg-size-em'].getState().val);

      if (Number.isNaN(val)) {
        return;
      }

      if (e.keyCode === 38) { // If the up arrow key is hit.
        val++;

        uiFns.sizeIframe(Math.round(val * uiProps.bodyFontSize), false);
      }
      else if (e.keyCode === 40) { // If the down arrow key is hit.
        val--;

        uiFns.sizeIframe(Math.round(val * uiProps.bodyFontSize), false);
      }
      else if (e.keyCode === 13) { // If the Enter key is hit.
        e.preventDefault();

        uiFns.sizeIframe(Math.round(val * uiProps.bodyFontSize)); // Size iframe to value of text box.
      }
    });

    // Click whole width button.
    $orgs['#sg-size-w'].on('click', function (e) {
      e.preventDefault();
      FEPPER_UI.patternViewport.goWhole();
    });

    // Click Random Size Button.
    $orgs['#sg-size-random'].on('click', function (e) {
      e.preventDefault();
      FEPPER_UI.patternViewport.goRandom();
    });

    // Click for Disco Mode, which resizes the viewport randomly.
    $orgs['#sg-size-disco'].on('click', function (e) {
      e.preventDefault();
      uiFns.stopGrow();

      if (uiProps.discoMode) {
        uiFns.stopDisco();
      }
      else {
        uiFns.startDisco();
      }
    });

    // Grow Mode.
    // "Start with the small screen first, then expand until it looks like shit. Time for a breakpoint!"
    // - Stephen Hay
    $orgs['#sg-size-grow'].on('click', function (e) {
      e.preventDefault();
      uiFns.stopDisco();

      if (uiProps.growMode) {
        uiFns.stopGrow();
      }
      else {
        uiFns.startGrow();
      }
    });
  });
}
