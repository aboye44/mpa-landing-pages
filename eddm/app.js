/* ================================================
   MPA EDDM Landing Page — app.js v3
   Zapier webhook submission, GCLID capture,
   conversion tracking, smooth scroll, mobile sticky CTA,
   scroll animations, phone formatting
   ================================================ */

(function () {
  'use strict';

  var ZAPIER_WEBHOOK = 'https://hooks.zapier.com/hooks/catch/18492625/upqr7mk/';

  // --- GCLID & UTM Capture ---
  var _paramStore = {};

  function captureParams() {
    var params = new URLSearchParams(window.location.search);
    var fields = ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

    fields.forEach(function (field) {
      var value = params.get(field);
      if (value) {
        _paramStore[field] = value;
      }
      var targets = document.querySelectorAll('[id="' + field + '"], [id="' + field + '-2"]');
      targets.forEach(function (input) {
        if (value) {
          input.value = value;
        } else if (_paramStore[field]) {
          input.value = _paramStore[field];
        }
      });
    });
  }

  // --- Submit form data to Zapier webhook ---
  function submitToZapier(formData, onSuccess, onError) {
    // Check honeypot
    if (formData._honey) {
      onSuccess();
      return;
    }
    delete formData._honey;

    fetch(ZAPIER_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      mode: 'no-cors'
    })
    .then(function () {
      // no-cors means we can't read the response, but Zapier will receive it
      onSuccess();
    })
    .catch(function (err) {
      console.error('Form submission error:', err);
      onError();
    });
  }

  // --- Collect form data into an object ---
  function collectFormData(form) {
    var data = {};
    var formData = new FormData(form);
    formData.forEach(function (value, key) {
      if (value) data[key] = value;
    });
    // Add timestamp and page URL
    data.submitted_at = new Date().toISOString();
    data.page_url = window.location.href;
    return data;
  }

  // --- Fire conversion events ---
  function fireConversionEvents(formSource) {
    if (typeof gtag === 'function') {
      gtag('event', 'conversion', {
        send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL',
        value: 1.0,
        currency: 'USD'
      });
      gtag('event', 'generate_lead', {
        event_category: 'form',
        event_label: formSource
      });
    }
    if (typeof fbq === 'function') {
      fbq('track', 'Lead', {
        content_name: 'EDDM Quote Request',
        content_category: formSource
      });
    }
  }

  // --- Smooth Scroll ---
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
          window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
      });
    });
  }

  // --- Header Scroll State ---
  function initHeaderScroll() {
    const header = document.getElementById('header');
    window.addEventListener('scroll', function () {
      if (window.pageYOffset > 50) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
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

  // --- Hero Form ---
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
      var requiredFields = [
        { id: 'full-name', errorId: 'full-name-error' },
        { id: 'email', errorId: 'email-error' },
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
          isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }

        if (!isValid) {
          hasErrors = true;
          input.closest('.form-group').classList.add('has-error');
        }
      });

      if (hasErrors) {
        var firstError = form.querySelector('.has-error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Disable button
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="btn__text">Sending...</span>';

      var formData = collectFormData(form);
      formData.form_source = 'EDDM Landing Page — Hero Form';

      submitToZapier(formData, function () {
        // Success
        form.style.display = 'none';
        successEl.style.display = 'block';
        successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        fireConversionEvents('hero_form');
      }, function () {
        // Error — re-enable button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="btn__text">Get My Free Quote</span><span class="btn__arrow">&rarr;</span>';
        alert('Something went wrong. Please call us at (863) 356-1853.');
      });
    });

    // Real-time validation clear
    form.querySelectorAll('input, select').forEach(function (input) {
      input.addEventListener('input', function () {
        this.closest('.form-group').classList.remove('has-error');
      });
      input.addEventListener('change', function () {
        this.closest('.form-group').classList.remove('has-error');
      });
    });

    // Phone formatting
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

  // --- Inline Form (Bottom CTA) ---
  function initInlineForm() {
    var form = document.getElementById('inline-form');
    if (!form) return;

    // Phone formatting for inline form tel inputs
    form.querySelectorAll('input[type="tel"]').forEach(function (phoneInput) {
      phoneInput.addEventListener('input', function () {
        var x = this.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
        if (x) {
          this.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Basic validation
      var inputs = form.querySelectorAll('.inline-form__input[required]');
      var hasErrors = false;
      inputs.forEach(function (input) {
        if (!input.value.trim()) {
          hasErrors = true;
          input.style.borderColor = '#EF4444';
        } else {
          input.style.borderColor = '';
        }
      });

      if (hasErrors) return;

      var btn = form.querySelector('.inline-form__btn');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending...';
      }

      var formData = collectFormData(form);
      formData.form_source = 'EDDM Landing Page — Bottom CTA Form';

      submitToZapier(formData, function () {
        // Success
        form.querySelector('.inline-form__fields').style.display = 'none';
        var successEl = document.getElementById('inline-form-success');
        if (successEl) successEl.style.display = 'flex';
        fireConversionEvents('inline_form');
      }, function () {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Get Quote →';
        }
        alert('Something went wrong. Please call us at (863) 356-1853.');
      });
    });
  }

  // --- Scroll Animations ---
  function initScrollAnimations() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var animatedElements = document.querySelectorAll(
      '.step, .math-card, .testimonial-card, .comparison-col, .industry-card, .faq-item, .postcard-card, .tool-feature__content, .tool-feature__visual'
    );

    if (!animatedElements.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = 0;
          var siblings = entry.target.parentElement.children;
          for (var i = 0; i < siblings.length; i++) {
            if (siblings[i] === entry.target) { delay = i * 60; break; }
          }
          setTimeout(function () { entry.target.classList.add('is-visible'); }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    animatedElements.forEach(function (el) { observer.observe(el); });
  }

  // --- Initialize ---
  function init() {
    captureParams();
    initSmoothScroll();
    initHeaderScroll();
    initMobileStickyCTA();
    initFormValidation();
    initInlineForm();
    initScrollAnimations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
