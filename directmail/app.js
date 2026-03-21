/* ============================================
   MPA Direct Mail Landing Page — app.js
   Form validation, GCLID capture, FAQ accordion,
   mobile sticky CTA, scroll animations
   ============================================ */

(function () {
  'use strict';

  // --- GCLID Capture ---
  function captureGclid() {
    const params = new URLSearchParams(window.location.search);
    const gclid = params.get('gclid');
    if (gclid) {
      const field = document.getElementById('form-gclid');
      if (field) field.value = gclid;
      // Store in cookie for 90 days
      const expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = 'gclid=' + encodeURIComponent(gclid) + '; expires=' + expires + '; path=/; SameSite=Lax';
    } else {
      // Check for stored GCLID
      const match = document.cookie.match(/(?:^|;\s*)gclid=([^;]*)/);
      if (match) {
        const field = document.getElementById('form-gclid');
        if (field) field.value = decodeURIComponent(match[1]);
      }
    }
  }

  // --- UTM Capture (in-memory) ---
  var capturedUtmParams = {};
  function captureUtmParams() {
    var params = new URLSearchParams(window.location.search);
    var utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    utmKeys.forEach(function (key) {
      var val = params.get(key);
      if (val) capturedUtmParams[key] = val;
    });
  }

  // --- Header Scroll Effect ---
  function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;
    let lastScroll = 0;
    window.addEventListener('scroll', function () {
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollY > 40) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
      lastScroll = scrollY;
    }, { passive: true });
  }

  // --- Mobile Sticky CTA ---
  function initMobileStickyCta() {
    var mobileCta = document.getElementById('mobileCta');
    if (!mobileCta) return;
    var hero = document.getElementById('hero');
    if (!hero) return;

    function checkVisibility() {
      var heroBottom = hero.getBoundingClientRect().bottom;
      if (heroBottom < 0 && window.innerWidth < 900) {
        mobileCta.classList.add('visible');
      } else {
        mobileCta.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', checkVisibility, { passive: true });
    window.addEventListener('resize', checkVisibility, { passive: true });
    checkVisibility();
  }

  // --- FAQ Accordion ---
  function initFaqAccordion() {
    var triggers = document.querySelectorAll('.faq-item__trigger');
    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var item = this.closest('.faq-item');
        var isOpen = item.classList.contains('active');

        // Close all
        document.querySelectorAll('.faq-item.active').forEach(function (openItem) {
          openItem.classList.remove('active');
          openItem.querySelector('.faq-item__trigger').setAttribute('aria-expanded', 'false');
        });

        // Toggle current
        if (!isOpen) {
          item.classList.add('active');
          this.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // --- Form Validation ---
  function initFormValidation() {
    var form = document.getElementById('quoteForm');
    if (!form) return;

    var fields = {
      name: { el: document.getElementById('form-name'), error: document.getElementById('error-name'), msg: 'Please enter your name' },
      company: { el: document.getElementById('form-company'), error: document.getElementById('error-company'), msg: 'Please enter your company' },
      email: { el: document.getElementById('form-email'), error: document.getElementById('error-email'), msg: 'Please enter a valid email' },
      phone: { el: document.getElementById('form-phone'), error: document.getElementById('error-phone'), msg: 'Please enter your phone number' },
      mailtype: { el: document.getElementById('form-mailtype'), error: document.getElementById('error-mailtype'), msg: 'Please select a mail type' },
      frequency: { el: document.getElementById('form-frequency'), error: document.getElementById('error-frequency'), msg: 'Please select a frequency' },
      haslist: { el: document.getElementById('form-haslist'), error: document.getElementById('error-haslist'), msg: 'Please select an option' }
    };

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validatePhone(phone) {
      return phone.replace(/\D/g, '').length >= 10;
    }

    function clearError(field) {
      if (field.el) field.el.classList.remove('error');
      if (field.error) field.error.textContent = '';
    }

    function setError(field) {
      if (field.el) field.el.classList.add('error');
      if (field.error) field.error.textContent = field.msg;
    }

    // Live validation on blur
    Object.keys(fields).forEach(function (key) {
      var field = fields[key];
      if (!field.el) return;
      field.el.addEventListener('blur', function () {
        if (key === 'email') {
          if (!validateEmail(this.value)) setError(field);
          else clearError(field);
        } else if (key === 'phone') {
          if (!validatePhone(this.value)) setError(field);
          else clearError(field);
        } else {
          if (!this.value.trim()) setError(field);
          else clearError(field);
        }
      });
      field.el.addEventListener('input', function () {
        clearError(field);
      });
    });

    // Phone formatting
    var phoneInput = fields.phone.el;
    if (phoneInput) {
      phoneInput.addEventListener('input', function () {
        var digits = this.value.replace(/\D/g, '');
        if (digits.length >= 10) {
          // Format as (XXX) XXX-XXXX
          this.value = '(' + digits.substring(0, 3) + ') ' + digits.substring(3, 6) + '-' + digits.substring(6, 10);
        }
      });
    }

    // Submit handler
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var isValid = true;

      // Validate required fields
      Object.keys(fields).forEach(function (key) {
        var field = fields[key];
        if (!field.el) return;
        var val = field.el.value.trim();

        if (key === 'email') {
          if (!validateEmail(val)) { setError(field); isValid = false; }
          else clearError(field);
        } else if (key === 'phone') {
          if (!validatePhone(val)) { setError(field); isValid = false; }
          else clearError(field);
        } else {
          if (!val) { setError(field); isValid = false; }
          else clearError(field);
        }
      });

      if (!isValid) {
        // Scroll to first error
        var firstError = form.querySelector('.error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstError.focus();
        }
        return;
      }

      // Gather form data
      var formData = new FormData(form);
      var data = {};
      formData.forEach(function (value, key) {
        data[key] = value;
      });

      // Add UTM params
      if (Object.keys(capturedUtmParams).length > 0) {
        Object.assign(data, capturedUtmParams);
      }

      // Show success state
      var submitBtn = document.getElementById('formSubmit');
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending...';

      // Simulate submission (replace with actual endpoint)
      setTimeout(function () {
        form.innerHTML = '<div class="quote-form--success">' +
          '<div class="quote-form__success-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>' +
          '<h3 class="quote-form__success-title">Quote Request Received!</h3>' +
          '<p class="quote-form__success-text">Thank you. We\'ll send your detailed proposal within 24 hours. If you need immediate assistance, call <a href="tel:8636876945" style="color:#193266;font-weight:600">(863) 687-6945</a>.</p>' +
          '</div>';
      }, 800);

      // Log data (replace with real submission)
      console.log('Form submission data:', data);
    });
  }

  // --- Smooth Scroll for Anchor Links ---
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;
        var target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        var headerHeight = document.getElementById('header') ? document.getElementById('header').offsetHeight : 0;
        var targetPos = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      });
    });
  }

  // --- Scroll Animations ---
  function initScrollAnimations() {
    var animatedElements = document.querySelectorAll(
      '.industry-card, .service-card, .step, .testimonial-card, .faq-item'
    );

    animatedElements.forEach(function (el) {
      el.classList.add('animate-on-scroll');
    });

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      });

      animatedElements.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      // Fallback: show all
      animatedElements.forEach(function (el) {
        el.classList.add('visible');
      });
    }
  }

  // --- Init ---
  document.addEventListener('DOMContentLoaded', function () {
    captureGclid();
    captureUtmParams();
    initHeaderScroll();
    initMobileStickyCta();
    initFaqAccordion();
    initFormValidation();
    initSmoothScroll();
    initScrollAnimations();
  });

})();
