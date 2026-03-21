/* ============================================
   MPA Commercial Printing — PPC Landing Page JS
   GCLID capture, UTM pass-through, form validation,
   mobile sticky CTA, scroll animations
   ============================================ */

(function () {
  'use strict';

  // --- GCLID & UTM Capture ---
  function captureParams() {
    const params = new URLSearchParams(window.location.search);
    
    // GCLID
    const gclid = params.get('gclid');
    if (gclid) {
      const gclidField = document.getElementById('gclid');
      if (gclidField) gclidField.value = gclid;
      // Store in cookie for 90 days
      const expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `gclid=${encodeURIComponent(gclid)};expires=${expires};path=/;SameSite=Lax`;
    } else {
      // Try to retrieve from cookie
      const match = document.cookie.match(/(?:^|;\s*)gclid=([^;]*)/);
      if (match) {
        const gclidField = document.getElementById('gclid');
        if (gclidField) gclidField.value = decodeURIComponent(match[1]);
      }
    }
    
    // UTM parameters
    const utmFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    utmFields.forEach(function (field) {
      const value = params.get(field);
      if (value) {
        const input = document.querySelector('input[name="' + field + '"]');
        if (input) input.value = value;
      }
    });
  }

  // --- Form Validation ---
  function setupFormValidation() {
    const form = document.getElementById('quoteForm');
    if (!form) return;

    const validators = {
      name: {
        validate: function (v) { return v.trim().length >= 2; },
        message: 'Please enter your name'
      },
      email: {
        validate: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); },
        message: 'Please enter a valid email address'
      },
      phone: {
        validate: function (v) { return /[\d]{7,}/.test(v.replace(/\D/g, '')); },
        message: 'Please enter a valid phone number'
      },
      'print-type': {
        validate: function (v) { return v !== ''; },
        message: 'Please select a print product'
      },
      quantity: {
        validate: function (v) { return v.trim().length >= 1; },
        message: 'Please enter the quantity needed'
      }
    };

    // Real-time validation on blur
    Object.keys(validators).forEach(function (fieldId) {
      var field = document.getElementById(fieldId);
      if (!field) return;
      
      field.addEventListener('blur', function () {
        validateField(fieldId);
      });

      field.addEventListener('input', function () {
        if (field.classList.contains('error')) {
          validateField(fieldId);
        }
      });
    });

    function validateField(fieldId) {
      var field = document.getElementById(fieldId);
      var errorEl = document.getElementById(fieldId + '-error');
      var validator = validators[fieldId];
      
      if (!field || !validator) return true;

      var isValid = validator.validate(field.value);
      
      if (!isValid) {
        field.classList.add('error');
        if (errorEl) {
          errorEl.textContent = validator.message;
          errorEl.classList.add('visible');
        }
      } else {
        field.classList.remove('error');
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.classList.remove('visible');
        }
      }
      
      return isValid;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      
      var allValid = true;
      Object.keys(validators).forEach(function (fieldId) {
        if (!validateField(fieldId)) {
          allValid = false;
        }
      });

      if (!allValid) {
        // Scroll to first error
        var firstError = form.querySelector('.error');
        if (firstError) {
          firstError.focus();
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Collect form data
      var formData = new FormData(form);
      var data = {};
      formData.forEach(function (value, key) {
        data[key] = value;
      });

      // Log submission (in production, this would POST to an endpoint)
      console.log('Form submitted:', data);

      // Show success state
      showFormSuccess();
    });
  }

  function showFormSuccess() {
    var form = document.getElementById('quoteForm');
    if (!form) return;

    form.innerHTML = '';
    form.classList.add('quote-form--success');
    form.innerHTML = 
      '<div class="success-icon">' +
        '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
      '</div>' +
      '<h3>Quote Request Received!</h3>' +
      '<p>We\'ll get back to you within 2 hours during business hours. Check your email for confirmation.</p>' +
      '<a href="tel:8636876945" class="btn btn--primary btn--lg" style="margin-top: 8px;">Call (863) 687-6945 Now</a>';
  }

  // --- Phone Number Formatting ---
  function setupPhoneFormatting() {
    var phoneInput = document.getElementById('phone');
    if (!phoneInput) return;

    phoneInput.addEventListener('input', function (e) {
      var value = e.target.value.replace(/\D/g, '');
      if (value.length > 10) value = value.substring(0, 10);
      
      if (value.length >= 7) {
        e.target.value = '(' + value.substring(0, 3) + ') ' + value.substring(3, 6) + '-' + value.substring(6);
      } else if (value.length >= 4) {
        e.target.value = '(' + value.substring(0, 3) + ') ' + value.substring(3);
      } else if (value.length >= 1) {
        e.target.value = '(' + value;
      }
    });
  }

  // --- Mobile Sticky CTA ---
  function setupMobileStickyCta() {
    var stickyCta = document.getElementById('mobileCta');
    if (!stickyCta) return;

    var heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    function checkVisibility() {
      if (window.innerWidth >= 769) {
        stickyCta.classList.remove('visible');
        document.body.classList.remove('has-sticky-cta');
        return;
      }

      var heroBottom = heroSection.getBoundingClientRect().bottom;
      if (heroBottom < 0) {
        stickyCta.classList.add('visible');
        document.body.classList.add('has-sticky-cta');
      } else {
        stickyCta.classList.remove('visible');
        document.body.classList.remove('has-sticky-cta');
      }
    }

    var scrollTimer;
    window.addEventListener('scroll', function () {
      if (scrollTimer) return;
      scrollTimer = requestAnimationFrame(function () {
        checkVisibility();
        scrollTimer = null;
      });
    }, { passive: true });

    window.addEventListener('resize', checkVisibility, { passive: true });
    checkVisibility();
  }

  // --- Scroll Animations ---
  function setupScrollAnimations() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var animatedElements = document.querySelectorAll(
      '.service-card, .capability-item, .process__step, .testimonial'
    );

    if (!animatedElements.length) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry, index) {
          if (entry.isIntersecting) {
            // Stagger the animation
            var el = entry.target;
            var siblings = Array.from(el.parentElement.children).filter(function (child) {
              return child.classList.contains(el.classList[0]);
            });
            var idx = siblings.indexOf(el);
            
            setTimeout(function () {
              el.classList.add('visible');
            }, idx * 80);
            
            observer.unobserve(el);
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      });

      animatedElements.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      // Fallback: just show everything
      animatedElements.forEach(function (el) {
        el.classList.add('visible');
      });
    }
  }

  // --- Smooth Scroll for Anchor Links ---
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          // Update URL without triggering scroll
          if (history.pushState) {
            history.pushState(null, null, targetId);
          }
        }
      });
    });
  }

  // --- Header Scroll Effect ---
  function setupHeaderScroll() {
    var header = document.getElementById('header');
    if (!header) return;

    var lastScroll = 0;
    var scrollTimer;

    window.addEventListener('scroll', function () {
      if (scrollTimer) return;
      scrollTimer = requestAnimationFrame(function () {
        var currentScroll = window.pageYOffset;
        
        if (currentScroll > 10) {
          header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
        } else {
          header.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
        scrollTimer = null;
      });
    }, { passive: true });
  }

  // --- Initialize ---
  function init() {
    captureParams();
    setupFormValidation();
    setupPhoneFormatting();
    setupMobileStickyCta();
    setupScrollAnimations();
    setupSmoothScroll();
    setupHeaderScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
