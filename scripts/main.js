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
  // JotForm Loading State with Error Handling & Dynamic Height
  // =====================
  function initJotFormLoading() {
    const formWrapper = document.querySelector('.jotform-loading');
    if (!formWrapper) return;

    const LOAD_TIMEOUT = 15000; // 15 seconds before showing error
    const CHECK_INTERVAL = 100;
    const CONFIRM_GRACE_MS = 3500; // give JotForm a moment to postMessage after iframe load

    let iframeFound = false;
    let jotformConfirmed = false;
    let loadStarted = false;

    let checkForIframeTimer = null;
    let loadTimeoutTimer = null;

    function isJotFormOrigin(origin) {
      try {
        const host = new URL(origin).hostname.toLowerCase();
        return (
          host === 'jotform.com' ||
          host.endsWith('.jotform.com') ||
          host === 'jotfor.ms' ||
          host.endsWith('.jotfor.ms')
        );
      } catch (e) {
        return false;
      }
    }

    function cleanupTimers() {
      if (checkForIframeTimer) clearInterval(checkForIframeTimer);
      if (loadTimeoutTimer) clearTimeout(loadTimeoutTimer);
      checkForIframeTimer = null;
      loadTimeoutTimer = null;
    }

    // Form ID source:
    // - Preferred: data-jotform-id on the container (keeps HTML free of third-party URLs)
    // - Fallback: existing embed script
    const embedScript = formWrapper.querySelector('script[src*="jotform.com/jsform/"]');
    const formIdFromData = formWrapper.getAttribute('data-jotform-id');
    const formIdMatch = embedScript && embedScript.src.match(/jsform\/(\d+)/);
    const formId = formIdFromData || (formIdMatch ? formIdMatch[1] : null);

    const directFormUrl = formId ? `https://form.jotform.com/${formId}` : 'https://form.jotform.com/';

    const spinnerEl = formWrapper.querySelector('.loading-spinner');
    const preloadEl = formWrapper.querySelector('.jotform-preload');
    const loadBtn = formWrapper.querySelector('#loadJotformBtn');
    const openNewTabBtn = formWrapper.querySelector('#openJotformNewTabBtn');

    // Populate "open in new tab" link without hardcoding JotForm URL in HTML
    if (openNewTabBtn) {
      openNewTabBtn.href = directFormUrl;
    }

    function setSpinnerVisible(visible) {
      if (!spinnerEl) return;
      spinnerEl.style.display = visible ? '' : 'none';
    }

    // Ensure spinner is hidden until user starts a load attempt
    setSpinnerVisible(false);

    function markLoaded() {
      formWrapper.classList.add('loaded');
      setSpinnerVisible(false);
    }

    // Create error message element (hidden initially)
    const errorMessage = document.createElement('div');
    errorMessage.className = 'jotform-error';
    errorMessage.innerHTML = `
      <div class="jotform-error-content">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Unable to Load Scheduling Form</h3>
        <p>The form is taking longer than expected to load.</p>
        <ul>
          <li>Slow internet connection</li>
          <li>Ad blocker or privacy extension interference</li>
          <li><strong>Network filtering (school/office Wi‑Fi) blocking JotForm</strong></li>
          <li>Temporary service disruption</li>
        </ul>
        <div class="jotform-error-actions">
          <button class="btn btn-primary" type="button" data-action="reload">
            <i class="fas fa-redo"></i> Try Again
          </button>
          <a href="${directFormUrl}" target="_blank" rel="noopener" class="btn btn-secondary">
            <i class="fas fa-external-link-alt"></i> Open Form in New Tab
          </a>
          <a href="/request" class="btn btn-secondary">
            <i class="fas fa-calendar-plus"></i> Request an Appointment (Works on School Wi‑Fi)
          </a>
          <a href="mailto:hello@psph.org?subject=Appointment%20Request" class="btn btn-secondary">
            <i class="fas fa-envelope"></i> Email Us Instead
          </a>
        </div>
      </div>
    `;
    errorMessage.style.display = 'none';

    // Insert error message near the top so it’s visible even if an iframe exists
    if (preloadEl) {
      preloadEl.insertAdjacentElement('afterend', errorMessage);
    } else if (spinnerEl) {
      spinnerEl.insertAdjacentElement('afterend', errorMessage);
    } else {
      formWrapper.appendChild(errorMessage);
    }

    function showError(mode) {
      // mode: 'no-iframe' | 'likely-filter'
      const iframe = formWrapper.querySelector('iframe');
      if (iframe) iframe.style.display = 'none';

      const p = errorMessage.querySelector('p');
      if (p) {
        if (mode === 'no-iframe') {
          p.textContent = 'The scheduling form could not be loaded. It may be blocked by a network filter (common on school Wi‑Fi) or by a browser extension.';
        } else {
          p.textContent = 'The scheduling form appears to be blocked. This is common on school/office Wi‑Fi content filters that block JotForm.';
        }
      }

      // Wire buttons without inline JS (CSP-friendly)
      errorMessage.querySelectorAll('[data-action="reload"]').forEach((btn) => {
        btn.addEventListener('click', () => location.reload());
      });

      errorMessage.style.display = 'block';
      formWrapper.classList.add('error');
      markLoaded();
    }

    // JotForm iframe auto-resize handler (official JotForm method)
    // This listens for postMessage events from JotForm to resize the iframe
    function handleJotFormMessage(event) {
      // Verify the message is from JotForm (network block pages won't postMessage from a JotForm origin)
      if (!isJotFormOrigin(event.origin)) return;

      const iframe = formWrapper.querySelector('iframe');
      if (!iframe) return;

      jotformConfirmed = true;
      cleanupTimers();

      if (preloadEl) preloadEl.style.display = 'none';

      iframe.style.display = '';
      errorMessage.style.display = 'none';
      formWrapper.classList.remove('error');
      markLoaded();

      // Parse the message data
      let args;
      if (typeof event.data === 'object') {
        args = event.data;
      } else if (typeof event.data === 'string') {
        try {
          args = JSON.parse(event.data);
        } catch (e) {
          // Try legacy format: "scrollHeight:1234"
          const match = event.data.match(/scrollHeight:(\d+)/);
          if (match) {
            args = { scrollHeight: parseInt(match[1], 10) };
          } else {
            return;
          }
        }
      } else {
        return;
      }

      // Handle height change
      if (args.scrollHeight) {
        // Add buffer for mobile (extra padding for touch targets, etc.)
        const isMobile = window.innerWidth <= 768;
        const buffer = isMobile ? 100 : 50;
        const newHeight = parseInt(args.scrollHeight, 10) + buffer;

        // Only increase height, don't shrink (prevents jumpiness)
        const currentHeight = parseInt(iframe.style.height, 10) || 0;
        if (newHeight > currentHeight || currentHeight === 0) {
          iframe.style.height = newHeight + 'px';
        }
      }

      // Handle scroll to top (when form pages change)
      if (args.action === 'scrollIntoView' || args.action === 'scrollToTop') {
        formWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    // Listen for JotForm postMessage events
    window.addEventListener('message', handleJotFormMessage, false);

    function startJotFormLoad() {
      if (loadStarted) return;
      loadStarted = true;

      if (!formId) {
        showError('no-iframe');
        return;
      }

      // Hide pre-load UI and show spinner
      if (preloadEl) preloadEl.style.display = 'none';
      setSpinnerVisible(true);

      // Old microsite behavior: use JotForm's JavaScript embed (jsform).
      // Note: this still renders the form in an iframe, but we avoid hardcoding it in HTML.
      const existing = formWrapper.querySelector('script[src*="jotform.com/jsform/"]');
      if (!existing) {
        const s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = `https://form.jotform.com/jsform/${formId}`;
        formWrapper.appendChild(s);
      }

      // Check for JotForm iframe periodically
      checkForIframeTimer = setInterval(() => {
        const iframe = formWrapper.querySelector('iframe');
        if (iframe) {
          iframeFound = true;

          // Listen for iframe load; note: a network filter block page can still trigger "load"
          iframe.addEventListener('load', () => {
            // Stop the spinner after a grace period even if we haven't confirmed postMessage,
            // but we'll still show a friendly error at LOAD_TIMEOUT if JotForm never confirms.
            setTimeout(() => {
              if (!jotformConfirmed) {
                markLoaded();
              }
            }, CONFIRM_GRACE_MS);
          }, { once: true });

          if (checkForIframeTimer) clearInterval(checkForIframeTimer);
          checkForIframeTimer = null;
        }
      }, CHECK_INTERVAL);

      // Timeout: show error if JotForm doesn't confirm (common when blocked by filters)
      loadTimeoutTimer = setTimeout(() => {
        cleanupTimers();

        if (!jotformConfirmed) {
          if (!iframeFound) {
            showError('no-iframe');
          } else {
            // iframe exists (maybe even loaded), but no JotForm postMessage came through
            showError('likely-filter');
          }
        } else {
          markLoaded();
        }
      }, LOAD_TIMEOUT);
    }

    // If the page has a load button, wait for user intent (avoids filter heuristics).
    // Otherwise, fall back to auto-load for legacy templates.
    if (loadBtn) {
      loadBtn.addEventListener('click', startJotFormLoad);
    } else if (embedScript) {
      startJotFormLoad();
    }
  }

  // =====================
  // Initialize All
  // =====================
  function init() {
    initMobileMenu();
    initNavHighlighting();
    initCalendar();
    initTestimonialCarousel();
    initJotFormLoading();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
