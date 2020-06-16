/**
 * @file ui/core/styleguide/index//html/01-body/40-main/main.js
 * @description Listeners on the body, iframe, and rightpull bar.
 */
/* istanbul ignore if */
if (typeof window === 'object') {
  document.addEventListener('DOMContentLoaded', () => {
    const $orgs = FEPPER_UI.requerio.$orgs;
    const {
      annotationsViewer,
      codeViewer,
      dataSaver,
      uiFns,
      uiProps
    } = FEPPER_UI;

    // Ensure that if a new pattern or viewall is loaded, that annotations or code viewer is turned on as appropriate.
    $orgs['#sg-viewport'].on('load', function () {
      if (annotationsViewer.annotationsActive) {
        $orgs['#sg-viewport'][0].contentWindow.postMessage({annotationsToggle: 'on'}, uiProps.targetOrigin);
      }

      if (codeViewer.codeActive) {
        $orgs['#sg-viewport'][0].contentWindow.postMessage({codeToggle: 'on'}, uiProps.targetOrigin);
      }
    });

    $orgs['#sg-rightpull'].on('mouseenter', function () {
      $orgs['#sg-cover'].dispatchAction('addClass', 'shown-by-rightpull-hover');
    });

    $orgs['#sg-rightpull'].on('mouseleave', function () {
      $orgs['#sg-cover'].dispatchAction('removeClass', 'shown-by-rightpull-hover');
    });

    // Handle manually resizing the viewport.
    // 1. On "mousedown" store the click location.
    // 2. Make a hidden div visible so that the cursor doesn't get lost in the iframe.
    // 3. On "mousemove" calculate the math, save the results to a cookie, and update the viewport.
    $orgs['#sg-rightpull'].on('mousedown', function (e) {
      uiProps.sgRightpull.posX = e.pageX;
      uiProps.sgRightpull.viewportWidth = $orgs['#sg-viewport'].getState().innerWidth;

      // Show the cover.
      $orgs['#sg-cover'].dispatchAction('addClass', 'shown-by-rightpull-drag');
    });

    // Add the mouse move event and capture data. Also update the viewport width.
    $orgs['#patternlab-body'].on('mousemove', function (e) {
      if ($orgs['#sg-cover'].getState().classArray.includes('shown-by-rightpull-drag')) {
        const viewportWidth = uiProps.sgRightpull.viewportWidth + 2 * (e.pageX - uiProps.sgRightpull.posX);

        if (viewportWidth > uiProps.minViewportWidth) {
          if (!dataSaver.findValue('vpWidth')) {
            dataSaver.addValue('vpWidth', viewportWidth);
          }
          else {
            dataSaver.updateValue('vpWidth', viewportWidth);
          }

          uiFns.sizeIframe(viewportWidth, false);
        }
      }
    });

    // Handle letting go of rightpull bar after dragging to resize.
    $orgs['#patternlab-body'].on('mouseup', function () {
      $orgs['#sg-cover'].dispatchAction('removeClass', 'shown-by-rightpull-hover');
      $orgs['#sg-cover'].dispatchAction('removeClass', 'shown-by-rightpull-drag');
    });
  });
}
