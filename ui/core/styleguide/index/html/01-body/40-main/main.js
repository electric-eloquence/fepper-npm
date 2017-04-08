module.exports = {
  dangerouslySetInnerHTML: {
    __html: `
<div id="sg-vp-wrap">
  <div id="sg-cover"></div>
  <div id="sg-gen-container">
    <iframe id="sg-viewport" name="sg-viewport" sandbox="allow-same-origin allow-scripts allow-popups allow-forms"></iframe>
    <div id="sg-rightpull-container">
      <div id="sg-rightpull"></div>
    </div>
  </div>
</div>
`
  },
  onLoad: (() => {
    'use strict';

    if (typeof window === 'object') {
      const uiFns = window.FEPPER_UI.uiFns;
      const uiProps = window.FEPPER_UI.uiProps;

      // handle when someone clicks on the grey area of the viewport so it auto-closes the nav
      $('#sg-vp-wrap').click(function () {
        uiFns.closePanels();
      });

      // on "mouseup" we unbind the "mousemove" event and hide the cover again
      $('body').mouseup(function ()  {
        $('#sg-cover').unbind('mousemove');
        $('#sg-cover').css('display','none');
      });

      $('#sg-gen-container').on('transitionend webkitTransitionEnd', function (e) {
        let targetOrigin;
        if (window.location.protocol === 'file:') {
          targetOrigin = '*';
        } else {
          targetOrigin = window.location.protocol + '//' + window.location.host;
        }
        const obj = JSON.stringify({event: 'patternLab.resize', resize: 'true'});
        document.getElementById('sg-viewport').contentWindow.postMessage(obj, targetOrigin);
      });

      $('#sg-gen-container').on('touchstart', function (event) {});

      // handles widening the "viewport"
      //   1. on "mousedown" store the click location
      //   2. make a hidden div visible so that it can track mouse movements and make sure the pointer doesn't get lost in the iframe
      //   3. on "mousemove" calculate the math, save the results to a cookie, and update the viewport
      $('#sg-rightpull').mousedown(function (event) {

        // capture default data
        const origClientX = event.clientX;
        const origViewportWidth = uiProps.$sgViewport.width();

        uiProps.fullMode = false;

        // show the cover
        $('#sg-cover').css('display', 'block');

        // add the mouse move event and capture data. also update the viewport width
        $('#sg-cover').mousemove(function (event) {
          const viewportWidth = origViewportWidth + 2 * (event.clientX - origClientX);

          if (viewportWidth > uiProps.minViewportWidth) {

            if (!DataSaver.findValue('vpWidth')) {
              DataSaver.addValue("vpWidth",viewportWidth);
            } else {
              DataSaver.updateValue("vpWidth",viewportWidth);
            }

            uiFns.sizeiframe(viewportWidth,false);
          }
        });

        return false;

      });
    }
  })()
};
