/* ================================================
   MPA EDDM Landing Page — app.js
   GCLID capture, form validation, smooth scroll,
   mobile sticky CTA, scroll animations
   ================================================ */

(function () {
  'use strict';

  // --- GCLID & UTM Capture ---
  // In-memory store for params (persists only within this page load)
  var _paramStore = {};

  function captureParams() {
    var params = new URLSearchParams(window.location.search);
    var fields = ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

    fields.forEach(function (field) {
      var value = params.get(field);
      if (value) {
        // Store in hidden form field
        var input = document.getElementById(field);
        if (input) input.value = value;

        // Store in memory for persistence within page
        _paramStore[field] = value;
      } else if (_paramStore[field]) {
        var input = document.getElementById(field);
        if (input) input.value = _paramStore[field];
      }
    });
  }

  // --- Smooth Scroll for anchor links ---
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const headerHeight = document.querySelector('.header').offsetHeight;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // --- Header Scroll State ---
  function initHeaderScroll() {
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', function () {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 50) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }

      lastScroll = currentScroll;
    }, { passive: true });
  }

  // --- Mobile Sticky CTA ---
  function initMobileStickyCTA() {
    const stickyBar = document.getElementById('mobile-sticky-cta');
    const hero = document.getElementById('hero');

    if (!stickyBar || !hero) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          stickyBar.classList.remove('is-visible');
        } else {
          stickyBar.classList.add('is-visible');
        }
      });
    }, { threshold: 0 });

    observer.observe(hero);
  }

  // --- Form Validation ---
  function initFormValidation() {
    const form = document.getElementById('lead-form');
    const successEl = document.getElementById('form-success');
    const submitBtn = document.getElementById('submit-btn');

    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Clear previous errors
      form.querySelectorAll('.form-group').forEach(function (group) {
        group.classList.remove('has-error');
      });

      let hasErrors = false;

      // Validate required fields
      var requiredFields = [
        { id: 'full-name', errorId: 'full-name-error' },
        { id: 'business-name', errorId: 'business-name-error' },
        { id: 'email', errorId: 'email-error' },
        { id: 'phone', errorId: 'phone-error' },
        { id: 'business-type', errorId: 'business-type-error' },
        { id: 'target-zip', errorId: 'target-zip-error' }
      ];

      requiredFields.forEach(function (field) {
        var input = document.getElementById(field.id);
        if (!input) return;

        var value = input.value.trim();
        var isValid = true;

        if (!value) {
          isValid = false;
        } else if (field.id === 'email') {
          // Basic email validation
          isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        } else if (field.id === 'phone') {
          // Basic phone validation (at least 7 digits)
          isValid = value.replace(/\D/g, '').length >= 7;
        }

        if (!isValid) {
          hasErrors = true;
          input.closest('.form-group').classList.add('has-error');
        }
      });

      if (hasErrors) {
        // Scroll to first error
        var firstError = form.querySelector('.has-error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Show loading state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      // Collect form data
      var formData = new FormData(form);
      var data = {};
      formData.forEach(function (value, key) {
        data[key] = value;
      });

      // Log submission (in production, send to CRM/endpoint)
      console.log('EDDM Form Submission:', data);

      // Simulate API call (replace with actual endpoint)
      setTimeout(function () {
        // Show success state
        form.style.display = 'none';
        successEl.style.display = 'block';

        // Scroll success into view
        successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Fire conversion event (Google Ads)
        if (typeof gtag === 'function') {
          gtag('event', 'conversion', {
            send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL',
            value: 1.0,
            currency: 'USD'
          });
        }

        // Fire Facebook Pixel event
        if (typeof fbq === 'function') {
          fbq('track', 'Lead', {
            content_name: 'EDDM Quote Request',
            content_category: data.business_type
          });
        }
      }, 800);
    });

    // Real-time validation: remove error on input
    form.querySelectorAll('input, select, textarea').forEach(function (input) {
      input.addEventListener('input', function () {
        this.closest('.form-group').classList.remove('has-error');
      });
      input.addEventListener('change', function () {
        this.closest('.form-group').classList.remove('has-error');
      });
    });

    // Phone number formatting
    var phoneInput = document.getElementById('phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', function () {
        var x = this.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
        if (x) {
          this.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        }
      });
    }
  }

  // --- Scroll Animations (IntersectionObserver) ---
  function initScrollAnimations() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var animatedElements = document.querySelectorAll(
      '.industry-card, .math-card, .math-breakdown__item, .step, .testimonial-card, .faq-item'
    );

    if (!animatedElements.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, index) {
        if (entry.isIntersecting) {
          // Stagger animation delay
          var delay = 0;
          var siblings = entry.target.parentElement.children;
          for (var i = 0; i < siblings.length; i++) {
            if (siblings[i] === entry.target) {
              delay = i * 80;
              break;
            }
          }

          setTimeout(function () {
            entry.target.classList.add('is-visible');
          }, delay);

          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // --- Initialize Everything ---
  function init() {
    captureParams();
    initSmoothScroll();
    initHeaderScroll();
    initMobileStickyCTA();
    initFormValidation();
    initScrollAnimations();
  }

  // Run when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
