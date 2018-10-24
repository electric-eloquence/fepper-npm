const uiFns = window.FEPPER_UI.uiFns;
const uiProps = window.FEPPER_UI.uiProps;

const stopDisco = uiFns.stopDisco;
const stopGrow = uiFns.stopGrow;
const startDisco = uiFns.startDisco;
const startGrow = uiFns.startGrow;

const sizeiframe = uiFns.sizeiframe;
const updateSizeReading = uiFns.updateSizeReading;

const bodyFontSize = uiProps.bodyFontSize;
const $sgSize = $('.sg-size');
const $sgFormLabel = $('#sg-form-label');
const $sgSizeEms = $('#sg-size-em'); // Em size input element in toolbar.
const $sgSizePx = $('#sg-size-px'); // Px size input element in toolbar.
const $window = $(window);

// Toggle hidden sg-size-options buttons at small sw.
$sgFormLabel.click(function (e) {
  e.preventDefault();

  if (uiProps.sw > 767 && uiProps.sw <= 1024) {
    $sgFormLabel.parents('.sg-size').toggleClass('active');
  }

  return false;
});

// Remove active classes if browser is resized outside small sw.
$window.resize(function () {
  if (uiProps.sw <= 767 || uiProps.sw > 1024) {
    $sgSize.removeClass('active');
    $sgFormLabel.removeClass('active');
  }
});

// Em input.
$sgSizeEms.keydown(function (e) {
  let val = parseFloat($(this).val());

  if (Number.isNaN(val)) {
    return;
  }

  if (e.keyCode === 38) { // If the up arrow key is hit.
    val++;
    sizeiframe(Math.round(val * bodyFontSize), false);
  }
  else if (e.keyCode === 40) { // If the down arrow key is hit.
    val--;
    sizeiframe(Math.round(val * bodyFontSize), false);
  }
  else if (e.keyCode === 13) { // If the Enter key is hit.
    e.preventDefault();
    sizeiframe(Math.round(val * bodyFontSize)); // Size Iframe to value of text box.
  }
});

$sgSizeEms.keyup(function () {
  const val = parseFloat($(this).val());

  updateSizeReading(val, 'em', 'updatePxInput');
});

// Pixel input.
$sgSizePx.keydown(function (e) {
  let val = parseInt($(this).val(), 10);

  if (Number.isNaN(val)) {
    return;
  }

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

$sgSizePx.keyup(function () {
  const val = $(this).val();

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
  stopGrow();

  if (uiProps.discoMode) {
    stopDisco();
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
  stopDisco();

  if (uiProps.growMode) {
    stopGrow();
  }
  else {
    startGrow();
  }
});
