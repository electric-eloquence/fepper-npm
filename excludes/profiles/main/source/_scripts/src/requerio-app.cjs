const $organisms = {
  '#nav': null,
  '#nav__submenu-container': null,
  '#nav__submenu-toggle': null,
  '#sidebar-toggle-for-small-vp': null
};

const requerio = window.requerio = new Requerio($, Redux, $organisms);

requerio.init();

if (requerio.$orgs['#nav__submenu-toggle'] && requerio.$orgs['#nav__submenu-container']) {
  requerio.$orgs['#nav__submenu-toggle'].on('click', function (e) {
    e.preventDefault();

    requerio.$orgs['#nav__submenu-container'].dispatchAction('toggleClass', 'active');
  });
}

if (requerio.$orgs['#sidebar-toggle-for-small-vp'] && requerio.$orgs['#nav']) {
  requerio.$orgs['#sidebar-toggle-for-small-vp'].on('click', function (e) {
    e.preventDefault();

    requerio.$orgs['#sidebar-toggle-for-small-vp'].dispatchAction('toggleClass', 'active');

    const toggleState = requerio.$orgs['#sidebar-toggle-for-small-vp'].getState();

    // Ensuring classes sync, instead of just dispatching toggleClass.
    if (toggleState.classArray.includes('active')) {
      requerio.$orgs['#nav'].dispatchAction('addClass', 'active');
    }
    else {
      requerio.$orgs['#nav'].dispatchAction('removeClass', 'active');
    }
  });
}
