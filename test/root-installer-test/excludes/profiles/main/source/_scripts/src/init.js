(function (d) {
  'use strict';

  // Nav menu toggle
  var navMenu = d.querySelector('.nav-toggle-menu');
  if (navMenu) {
    navMenu.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        var nav = d.querySelector('.nav');
        if (nav) {
          nav.classList.toggle('active');
        }
      },
      false
    );
  }
  
  // Nav search toggle
  var navSearch = d.querySelector('.nav-toggle-search');
  if (navSearch) {
    navSearch.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        var searchForm = d.querySelector('.header .search-form');
        if (searchForm) {
          searchForm.classList.toggle('active');
        }
      },
      false
    );
  }
})(document);
