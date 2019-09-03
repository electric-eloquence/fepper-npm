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
    const bpMd = 1024; // Not to be user-configured.
    const bpSm = 767; // Not to be user-configured.

    // Remove active classes if browser is resized outside small sw.
    // Putting this window resize listener here instead of in a more general listeners file because we want to keep the
    // bpMd and bpSm variables in one place.
    $orgs.window.on('resize', function () {
      if (uiProps.sw <= bpSm || uiProps.sw > bpMd) {
        $orgs['.sg-size'].dispatchAction('removeClass', 'active');
        $orgs['#sg-form-label'].dispatchAction('removeClass', 'active');
      }
    });

    // Toggle hidden sg-size-options buttons at small sw.
    $orgs['#sg-form-label'].on('click', function (e) {
      e.preventDefault();

      if (uiProps.sw > bpSm && uiProps.sw <= bpMd) {
        $orgs['.sg-size'].dispatchAction('toggleClass', 'active');
      }
    });

    // Pixel input.
    $orgs['#sg-size-px'].on('keydown', function (e) {
      let val = parseFloat($orgs['#sg-size-px'].getState().value);

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

    $orgs['#sg-size-px'].on('keyup', function () {
      const val = parseFloat($orgs['#sg-size-px'].getState().value);

      if (Number.isNaN(val) || !Number.isInteger(val)) {
        return;
      }

      uiFns.updateSizeReading(val, 'px', 'updateEmInput');
    });

    // Em input.
    $orgs['#sg-size-em'].on('keydown', function (e) {
      let val = parseFloat($orgs['#sg-size-em'].getState().value);

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

    $orgs['#sg-size-em'].on('keyup', function () {
      const val = parseFloat($orgs['#sg-size-em'].getState().value);

      if (Number.isNaN(val)) {
        return;
      }

      uiFns.updateSizeReading(val, 'em', 'updatePxInput');
    });

    // Click whole width button.
    $orgs['#sg-size-w'].on('click', function (e) {
      e.preventDefault();
      FEPPER_UI.patternlabViewer.goWhole();
    });

    // Click Random Size Button.
    $orgs['#sg-size-random'].on('click', function (e) {
      e.preventDefault();
      FEPPER_UI.patternlabViewer.goRandom();
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
