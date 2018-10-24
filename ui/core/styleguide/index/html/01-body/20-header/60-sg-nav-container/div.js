const uiFns = window.FEPPER_UI.uiFns;

// Accordion dropdown
$('.sg-acc-handle').not('#sg-f-toggle').click(function (e) {
  e.preventDefault();

  const $this = $(this);
  const $panel = $this.next('.sg-acc-panel');

  uiFns.closeOtherPanels(this);

  // Activate selected panel.
  $this.toggleClass('active');
  $panel.toggleClass('active');
});
