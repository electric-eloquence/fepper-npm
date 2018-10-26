const annotationsViewer = window.annotationsViewer;
const codeViewer = window.codeViewer;
const uiFns = window.FEPPER_UI.uiFns;
const uiProps = window.FEPPER_UI.uiProps;

// On "mouseup" we unbind the "mousemove" event and hide the cover again.
$('body').mouseup(function () {
  $('#sg-cover').unbind('mousemove');
  $('#sg-cover').css('display', 'none');
});

// Make sure that if a new pattern or viewall is loaded, that annotations are turned on as appropriate.
uiProps.sgViewport.addEventListener(
  'load',
  function () {
    if (annotationsViewer.annotationsActive) {
      uiProps.sgViewport.contentWindow.postMessage({annotationsToggle: 'on'}, uiProps.targetOrigin);
    }

    if (codeViewer.codeActive) {
      uiProps.sgViewport.contentWindow.postMessage({codeToggle: 'on'}, uiProps.targetOrigin);
    }
  },
  false
);

// Handle widening the viewport.
//   1. On "mousedown" store the click location.
//   2. Make a hidden div visible so that it can track mouse movements and make sure the pointer doesn't get lost
//      in the iframe.
//   3. On "mousemove" calculate the math, save the results to a cookie, and update the viewport.
$('#sg-rightpull').mousedown(function (e) {

  // Capture default data.
  const dataSaver = window.dataSaver;
  const origClientX = e.clientX;
  const origViewportWidth = uiProps.sgViewport.clientWidth;

  uiProps.wholeMode = false;

  // Show the cover.
  $('#sg-cover').css('display', 'block');

  // Add the mouse move event and capture data. Also update the viewport width.
  $('#sg-cover').mousemove(function (e) {
    const viewportWidth = origViewportWidth + 2 * (e.clientX - origClientX);

    if (viewportWidth > uiProps.minViewportWidth) {

      if (!dataSaver.findValue('vpWidth')) {
        dataSaver.addValue('vpWidth', viewportWidth);
      }
      else {
        dataSaver.updateValue('vpWidth', viewportWidth);
      }

      uiFns.sizeiframe(viewportWidth, false);
    }
  });
});
