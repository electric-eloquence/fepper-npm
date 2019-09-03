/**
 * @file ui/core/styleguide/index//html/01-body/20-header/60-sg-controls/40-sg-find/li.js
 * @description Pattern finder.
 */
/* istanbul ignore if */
if (typeof window === 'object') {
  document.addEventListener('DOMContentLoaded', () => {
    const $orgs = FEPPER_UI.requerio.$orgs;
    const patternFinder = FEPPER_UI.patternFinder;

    $orgs['#sg-f-toggle'].on('mouseenter', function () {
      $orgs['#sg-f-toggle'].dispatchAction('addClass', 'mouseentered');
    });

    $orgs['#sg-f-toggle'].on('mouseleave', function () {
      $orgs['#sg-f-toggle'].dispatchAction('removeClass', 'mouseentered');
    });

    $orgs['#sg-f-toggle'].on('click', function (e) {
      e.preventDefault();

      patternFinder.toggleFinder();
    });

    $orgs['#typeahead'].on('blur', function () {
      const mouseentered = $orgs['#sg-f-toggle'].getState().classList.includes('mouseentered');

      if (!mouseentered) {
        // Do not invoke an infinite loop by calling patternFinder.closeFinder() which will invoke a blur.
        $orgs['#sg-f-toggle'].dispatchAction('removeClass', 'active');
        $orgs['#sg-find'].dispatchAction('removeClass', 'active');
      }
    });

    $orgs['#typeahead'].typeahead(
      {highlight: true},
      {displayKey: 'patternPartial', source: patternFinder.patterns.ttAdapter()}
    ).on(
      'typeahead:selected',
      ((patternFinder_) => {
        return function (e, item) {
          patternFinder_.onSelected(e, item, patternFinder_);
        };
      })(patternFinder)
    ).on(
      'typeahead:autocompleted',
      ((patternFinder_) => {
        return function (e, item) {
          patternFinder_.onAutocompleted(e, item, patternFinder_);
        };
      })(patternFinder)
    );
  });
}
