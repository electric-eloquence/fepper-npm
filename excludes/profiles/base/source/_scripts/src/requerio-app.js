import Requerio from '../../node_modules/requerio/src/requerio.js';

const $organisms = {
  '#nav': null,
  '#toggler': null
};

const requerio = window.requerio = new Requerio($, Redux, $organisms);

requerio.init();

if (requerio.$orgs['#toggler']) {
  requerio.$orgs['#toggler'].on('click', function (e) {
    e.preventDefault();
    requerio.$orgs['#nav'].dispatchAction('toggleClass', 'toggled-on');
  });
}
