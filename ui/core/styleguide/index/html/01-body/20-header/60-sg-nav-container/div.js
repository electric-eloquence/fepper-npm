module.exports = {
  className: 'sg-nav-container',
  id: 'sg-nav-container',
  onLoad: (() => {
    'use strict';
    if (typeof window === 'object') {

      // Accordion dropdown
      $('.sg-acc-handle').not('#sg-f-toggle').click(function (e) {
        e.preventDefault();

        const $this = $(this);
        const $panel = $this.next('.sg-acc-panel');
        const subnav = $this.parent().parent().hasClass('sg-acc-panel');

        // Close other panels if link isn't a subnavigation item.
        if (!subnav) {
          $('.sg-acc-handle').not($this).removeClass('active');
          $('.sg-acc-panel').not($panel).removeClass('active');
        }

        // Activate selected panel.
        $this.toggleClass('active');
        $panel.toggleClass('active');
        window.FEPPER_UI.uiFns.setAccordionHeight();
      });
    }
  })()
};
