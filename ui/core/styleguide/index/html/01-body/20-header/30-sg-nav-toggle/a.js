const uiFns = window.FEPPER_UI.uiFns;

$('.sg-nav-toggle').click(function (e) {
  e.preventDefault();

  const $sgNavContainer = $('.sg-nav-container');
  const isActive = $sgNavContainer.hasClass('active');

  uiFns.closeAllPanels();

  if (!isActive) {
    $sgNavContainer.addClass('active');
  }
});
