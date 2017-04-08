module.exports = {
  className: 'sg-size',
  dangerouslySetInnerHTML: {
    __html: `
<div class="sg-current-size">
  <form id="sg-form">
    Size <input type="text" class="sg-input sg-size-px" value="---">px /
    <input type="text" class="sg-input sg-size-em" value="---">em
  </form>
</div>
<ul class="sg-acc-panel sg-size-options">
  {{^ ishControlsHide.full }}<li><a href="#" id="sg-size-full">Full</a></li>{{/ ishControlsHide.full }}
  {{^ ishControlsHide.random }}<li><a href="#" id="sg-size-random">Random</a></li>{{/ ishControlsHide.random }}
  {{^ ishControlsHide.disco }}<li><a href="#" class="mode-link" id="sg-size-disco">Disco</a></li>{{/ ishControlsHide.disco }}
  {{^ ishControlsHide.hay }}<li><a href="#" class="mode-link" id="sg-size-hay">Hay!</a></li>{{/ ishControlsHide.hay }}
</ul>
`
  },
  onLoad: (() => {
    'use strict';
    if (typeof window === 'object') {

      const uiFns = window.FEPPER_UI.uiFns;
      const uiProps = window.FEPPER_UI.uiProps;

      const killDisco = uiFns.killDisco;
      const killHay = uiFns.killHay;
      const startDisco = uiFns.startDisco;
      const startHay = uiFns.startHay;

      const sizeiframe = uiFns.sizeiframe;
      const updateSizeReading = uiFns.updateSizeReading;

      const $bodySize = uiProps.$bodySize;
      const $sizeEms = $('.sg-size-em'); //Em size input element in toolbar
      const $sizePx = $('.sg-size-px'); //Px size input element in toolbar

      let fullMode = uiProps.fullMode;

      //Em input
      $sizeEms.on('keydown', function (e) {
        const val = parseFloat($(this).val());

        if (e.keyCode === 38) { //If the up arrow key is hit
          val++;
          sizeiframe(Math.floor(val * $bodySize), false);
        } else if (e.keyCode === 40) { //If the down arrow key is hit
          val--;
          sizeiframe(Math.floor(val * $bodySize), false);
        } else if (e.keyCode === 13) { //If the Enter key is hit
          e.preventDefault();
          sizeiframe(Math.floor(val * $bodySize)); //Size Iframe to value of text box
        }
      });

      $sizeEms.on('keyup', function () {
        const val = parseFloat($(this).val());
        updateSizeReading(val, 'em', 'updatePxInput');
      });

      //Pixel input
      $sizePx.on('keydown', function (e) {
        const val = Math.floor($(this).val());

        if(e.keyCode === 38) { //If the up arrow key is hit
          val++;
          sizeiframe(val, false);
        } else if(e.keyCode === 40) { //If the down arrow key is hit
          val--;
          sizeiframe(val, false);
        } else if(e.keyCode === 13) { //If the Enter key is hit
          e.preventDefault();
          sizeiframe(val); //Size Iframe to value of text box
          $(this).blur();
        }
      });

      $sizePx.on('keyup', function () {
        const val = Math.floor($(this).val());
        updateSizeReading(val, 'px', 'updateEmInput');
      });

      //Click Full Width Button
      $('#sg-size-full').on('click', e => { //Resets
        e.preventDefault();
        killDisco();
        killHay();
        fullMode = true;
        sizeiframe(uiProps.sw);
      });

      //Click Random Size Button
      $('#sg-size-random').on('click', function(e){
        e.preventDefault();
        killDisco();
        killHay();
        fullMode = false;
        sizeiframe(getRandom(minViewportWidth, uiProps.sw));
      });

      //Click for Disco Mode, which resizes the viewport randomly
      $('#sg-size-disco').on('click', function(e){
        e.preventDefault();
        killHay();
        fullMode = false;
        if (discoMode) {
          killDisco();
        } else {
          startDisco();
        }
      });

      //Stephen Hay Mode - "Start with the small screen first, then expand until it looks like shit. Time for a breakpoint!"
      $('#sg-size-hay').on('click', function(e){
        e.preventDefault();
        killDisco();
        if (hayMode) {
          killHay();
        } else {
          startHay();
        }
      });
    }
  })()
};
