/**
 * PSPH Website - Main JavaScript
 * Mobile navigation, calendar, and testimonial carousel functionality
 */

(function () {
  'use strict';

  // =====================
  // Mobile Menu Toggle with Backdrop
  // =====================
  function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');

    if (!menuBtn || !mobileNav) return;

    // Create backdrop element
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
      if (mobileNav.classList.contains('active')) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    menuBtn.addEventListener('click', toggleMenu);

    // Close menu when backdrop is clicked
    backdrop.addEventListener('click', closeMenu);

    // Close mobile menu when clicking a link
    document.querySelectorAll('.mobile-nav a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
        closeMenu();
      }
    });
  }

  // =====================
  // Active Navigation Highlighting
  // =====================
  function initNavHighlighting() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav a, .mobile-nav a');

    if (sections.length === 0 || navLinks.length === 0) return;

    function highlightNav() {
      let current = '';
      const scrollPosition = window.scrollY;

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollPosition >= (sectionTop - 100)) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    }

    window.addEventListener('scroll', highlightNav);
    window.addEventListener('load', highlightNav);
  }

  // =====================
  // Dynamic Calendar
  // =====================
  function initCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthEl = document.getElementById('currentMonth');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    if (!calendarGrid) return;

    let currentDate = new Date();

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    function renderCalendar() {
      // Remove loading spinner if present
      const loadingSpinner = calendarGrid.parentElement.querySelector('.loading-spinner');
      if (loadingSpinner) {
        loadingSpinner.remove();
      }

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // Set month/year display
      if (currentMonthEl) {
        currentMonthEl.textContent = `${monthNames[month]} ${year}`;
      }

      // Clear calendar
      calendarGrid.innerHTML = '';

      // Add day headers
      const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-cell header';
        header.textContent = day;
        calendarGrid.appendChild(header);
      });

      // Get first day of month and number of days
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = new Date();

      // Add empty cells for days before month starts
      for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-cell';
        calendarGrid.appendChild(emptyCell);
      }

      // Add days of month
      for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell';
        cell.textContent = day;

        const cellDate = new Date(year, month, day);

        // Mark today
        if (cellDate.toDateString() === today.toDateString()) {
          cell.classList.add('today');
        }

        // Mark weekdays (Mon-Sat) as available if they're in the future
        const dayOfWeek = cellDate.getDay();
        if (cellDate > today && dayOfWeek >= 1 && dayOfWeek <= 6) {
          cell.classList.add('available');
          cell.setAttribute('tabindex', '0');
          cell.setAttribute('role', 'button');
          cell.setAttribute('aria-label', `Schedule an appointment on ${monthNames[month]} ${day}, ${year}`);

          // Multipage structure: schedule form is at root (/)
          const navigateToSchedule = () => {
            window.location.href = '/';
          };

          cell.addEventListener('click', navigateToSchedule);
          cell.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              navigateToSchedule();
            }
          });
        }

        calendarGrid.appendChild(cell);
      }
    }

    // Calendar navigation
    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
      });
    }

    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
      });
    }

    // Initialize
    renderCalendar();
  }

  // =====================
  // Testimonial Carousel
  // =====================
  function initTestimonialCarousel() {
    const track = document.querySelector('.testimonial-track');
    const dotsContainer = document.querySelector('.carousel-dots');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');

    if (!track) return;

    let currentSlide = 0;
    let autoRotateInterval;
    let totalSlides = 0;

    // Show loading skeleton
    function showLoadingSkeleton() {
      track.innerHTML = `
        <div class="testimonial-card skeleton-card">
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text" style="width: 30%"></div>
        </div>
      `;
    }

    async function loadTestimonials() {
      showLoadingSkeleton();

      try {
        const response = await fetch('/assets/data/reviews.json');
        const data = await response.json();

        // Filter reviews with non-empty review_text
        const reviews = data.reviews.filter(r => r.review_text && r.review_text.trim() !== '');

        if (reviews.length === 0) {
          console.warn('No valid testimonials found');
          track.innerHTML = '<p class="testimonial-text">No testimonials available at this time.</p>';
          return;
        }

        totalSlides = reviews.length;

        // Clear loading skeleton
        track.innerHTML = '';
        if (dotsContainer) dotsContainer.innerHTML = '';

        reviews.forEach((review, index) => {
          // Create testimonial card
          const card = document.createElement('div');
          card.className = 'testimonial-card';

          // Create elements safely using textContent to prevent XSS
          const textP = document.createElement('p');
          textP.className = 'testimonial-text';
          textP.textContent = `"${review.review_text}"`;

          const authorP = document.createElement('p');
          authorP.className = 'testimonial-author';
          authorP.textContent = review.reviewer;

          const roleP = document.createElement('p');
          roleP.className = 'testimonial-role';
          roleP.textContent = `${review.job_title}, ${review.state}`;

          card.appendChild(textP);
          card.appendChild(authorP);
          card.appendChild(roleP);
          track.appendChild(card);

          // Create dot indicator
          if (dotsContainer) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
          }
        });

        // Add aria-live for accessibility
        track.setAttribute('aria-live', 'polite');
        track.setAttribute('aria-atomic', 'true');

        initCarouselControls();
      } catch (error) {
        console.error('Failed to load testimonials:', error);
        track.innerHTML = '<p class="testimonial-text">Unable to load testimonials. Please try again later.</p>';
      }
    }

    function initCarouselControls() {
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
          updateCarousel();
          clearInterval(autoRotateInterval);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          currentSlide = (currentSlide + 1) % totalSlides;
          updateCarousel();
          clearInterval(autoRotateInterval);
        });
      }

      // Auto-rotate every 6 seconds
      startAutoRotate();

      // Add touch swipe support
      addSwipeSupport();
    }

    function goToSlide(index) {
      currentSlide = index;
      updateCarousel();
      clearInterval(autoRotateInterval);
    }

    function updateCarousel() {
      track.style.transform = `translateX(-${currentSlide * 100}%)`;

      document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
      });
    }

    function startAutoRotate() {
      autoRotateInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
      }, 6000);
    }

    function addSwipeSupport() {
      let startX = 0;
      let isDragging = false;

      track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
      });

      track.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
      }, { passive: false });

      track.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;

        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;

        // Swipe threshold of 50px
        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            currentSlide = (currentSlide + 1) % totalSlides;
          } else {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
          }
          updateCarousel();
          clearInterval(autoRotateInterval);
        }
      });
    }

    // Initialize
    loadTestimonials();
  }



  // =====================
  // Initialize All
  // =====================
  function init() {
    initMobileMenu();
    initNavHighlighting();
    initCalendar();
    initTestimonialCarousel();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
