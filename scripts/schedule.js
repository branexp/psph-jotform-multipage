(function () {
  'use strict';

  function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');

    if (!menuBtn || !mobileNav) return;

    const backdrop = document.createElement('div');
    backdrop.className = 'mobile-nav-backdrop';
    document.body.appendChild(backdrop);

    function openMenu() {
      mobileNav.classList.add('active');
      menuBtn.classList.add('active');
      menuBtn.setAttribute('aria-expanded', 'true');
      backdrop.classList.add('active');
      document.body.classList.add('menu-open');
    }

    function closeMenu() {
      mobileNav.classList.remove('active');
      menuBtn.classList.remove('active');
      menuBtn.setAttribute('aria-expanded', 'false');
      backdrop.classList.remove('active');
      document.body.classList.remove('menu-open');
    }

    function toggleMenu() {
      if (mobileNav.classList.contains('active')) closeMenu();
      else openMenu();
    }

    menuBtn.addEventListener('click', toggleMenu);
    backdrop.addEventListener('click', closeMenu);

    document.querySelectorAll('.mobile-nav a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
        closeMenu();
      }
    });
  }

  function init() {
    initMobileMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
