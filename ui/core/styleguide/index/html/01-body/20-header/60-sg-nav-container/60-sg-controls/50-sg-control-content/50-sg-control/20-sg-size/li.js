module.exports = {
  className: 'sg-size',
  dangerouslySetInnerHTML: {
    __html: `
<div class="sg-current-size">
  <form id="sg-form">
    <div class="sg-size-label">Size</div
    ><input type="text" class="sg-input" id="sg-size-px" value="---"
    ><div class="sg-size-label">px /</div
    ><input type="text" class="sg-input" id="sg-size-em" value="---"
    ><div class="sg-size-label">em</div>
  </form>
</div>
<ul class="sg-acc-panel sg-size-options">
  {{^ ishControlsHide.whole }}<li><a href="#" id="sg-size-w">W</a></li>{{/ ishControlsHide.whole }}
  {{^ ishControlsHide.grow }}<li><a href="#" class="mode-link" id="sg-size-grow">Grow</a></li>{{/ ishControlsHide.grow }}
  {{^ ishControlsHide.random }}<li><a href="#" id="sg-size-random">Random</a></li>{{/ ishControlsHide.random }}
  {{^ ishControlsHide.disco }}<li><a href="#" class="mode-link" id="sg-size-disco">Disco</a></li>{{/ ishControlsHide.disco }}
</ul>
`
  },
  onLoad: (() => {
    'use strict';

    if (typeof window === 'object') {
      const uiFns = window.FEPPER_UI.uiFns;
      const uiProps = window.FEPPER_UI.uiProps;

      const killDisco = uiFns.killDisco;
      const killGrow = uiFns.killGrow;
      const startDisco = uiFns.startDisco;
      const startGrow = uiFns.startGrow;

      const sizeiframe = uiFns.sizeiframe;
      const updateSizeReading = uiFns.updateSizeReading;

      const bodySize = uiProps.bodySize;
      const $sgSizeEms = $('#sg-size-em'); // Em size input element in toolbar.
      const $sgSizePx = $('#sg-size-px'); // Px size input element in toolbar.

      // Em input.
      $sgSizeEms.on('keydown', function (e) {
        let val = parseFloat($(this).val());

        if (e.keyCode === 38) { // If the up arrow key is hit.
          val++;
          sizeiframe(Math.floor(val * bodySize), false);
        }
        else if (e.keyCode === 40) { // If the down arrow key is hit.
          val--;
          sizeiframe(Math.floor(val * bodySize), false);
        }
        else if (e.keyCode === 13) { // If the Enter key is hit.
          e.preventDefault();
          sizeiframe(Math.floor(val * bodySize)); // Size Iframe to value of text box.
        }
      });

      $sgSizeEms.on('keyup', function () {
        const val = parseFloat($(this).val());

        updateSizeReading(val, 'em', 'updatePxInput');
      });

      // Pixel input.
      $sgSizePx.on('keydown', function (e) {
        let val = Math.floor($(this).val());

        if (e.keyCode === 38) { // If the up arrow key is hit.
          val++;
          sizeiframe(val, false);
        }
        else if (e.keyCode === 40) { // If the down arrow key is hit.
          val--;
          sizeiframe(val, false);
        }
        else if (e.keyCode === 13) { // If the Enter key is hit.
          e.preventDefault();
          sizeiframe(val); // Size Iframe to value of text box.
          $(this).blur();
        }
      });

      $sgSizePx.on('keyup', function () {
        const val = Math.floor($(this).val());

        updateSizeReading(val, 'px', 'updateEmInput');
      });

      // Click whole width button.
      $('#sg-size-w').click(function (e) {
        e.preventDefault();
        uiFns.goWhole();
      });

      // Click Random Size Button.
      $('#sg-size-random').click(function (e) {
        e.preventDefault();
        uiFns.goRandom();
      });

      // Click for Disco Mode, which resizes the viewport randomly.
      $('#sg-size-disco').click(function (e) {
        e.preventDefault();
        killGrow();

        if (uiProps.discoMode) {
          killDisco();
        }
        else {
          startDisco();
        }
      });

      // Grow Mode.
      // "Start with the small screen first, then expand until it looks like shit. Time for a breakpoint!"
      // - Stephen Hay
      $('#sg-size-grow').click(function (e) {
        e.preventDefault();
        killDisco();

        if (uiProps.growMode) {
          killGrow();
        }
        else {
          startGrow();
        }
      });
    }
  })()
};
