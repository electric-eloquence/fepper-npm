(function (d) {
  'use strict';

  var menuToggle = d.querySelector('.nav-toggle-menu');
  var menuNav = d.querySelector('.nav');

  if (menuToggle) {
    menuToggle.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        if (menuNav) {
          menuNav.classList.toggle('active');
        }
      }
    );
  }
  
  var searchToggle = d.querySelector('.nav-toggle-search');
  var searchForm = d.querySelector('.header .search-form');

  if (searchToggle) {
    searchToggle.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        if (searchForm) {
          searchForm.classList.toggle('active');
        }
      }
    );
  }

  window.addEventListener(
    'resize',
    function () {
      if (menuNav) {
        menuNav.classList.remove('active');
      }

      if (searchForm) {
        searchForm.classList.remove('active');
      }
    }
  );
})(document);
