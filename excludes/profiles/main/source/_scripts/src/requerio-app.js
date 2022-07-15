import Requerio from '../../node_modules/requerio/src/requerio.js';

const $organisms = {
  window: null,
  '#nav': null,
  /*
  '.nav': null,
  '.nave': null,
  '#nav-toggle-menu': null,
  '#nav-toggle-search': null,
  '#search-form': null
  */
};

const requerio = window.requerio = new Requerio($, Redux, $organisms);

requerio.init();

const $orgs = requerio.$orgs;

if ($orgs['#nav-toggle-menu']) {
  $orgs['#nav-toggle-menu'].on(
    'click',
    function (e) {
      e.preventDefault();
      if ($orgs['#nav']) {
        if ($orgs['#nav'].getState().classArray.includes('active')) {
          $orgs['#nav'].dispatchAction('removeClass', 'active');
          $orgs['#nav-toggle-menu'].dispatchAction('blur');
        }
        else {
          $orgs['#nav'].dispatchAction('addClass', 'active');
        }
      }
    }
  );
}

if ($orgs['#nav-toggle-search']) {
  $orgs['#nav-toggle-search'].on(
    'click',
    function (e) {
      e.preventDefault();
      if ($orgs['#search-form']) {
        if ($orgs['#search-form'].getState().classArray.includes('active')) {
          $orgs['#search-form'].dispatchAction('removeClass', 'active');
          $orgs['#nav-toggle-search'].dispatchAction('blur');
        }
        else {
          $orgs['#search-form'].dispatchAction('addClass', 'active');
        }
      }
    }
  );
}

$orgs.window.on(
  'resize',
  function () {
    if ($orgs['#nav']) {
      $orgs['#nav'].dispatchAction('removeClass', 'active');
    }

    if ($orgs['#search-form']) {
      $orgs['#search-form'].dispatchAction('removeClass', 'active');
    }
  }
);
