/**
 * MPA Statement & Transactional Mail — PPC Landing Page
 * Features:
 * - GCLID + UTM capture from URL params
 * - Form validation with inline errors
 * - FAQ accordion
 * - Smooth scroll for anchor links
 * - Sticky header with scroll shadow
 * - Mobile CTA bar visibility
 * - Intersection Observer for fade-in animations
 */

(function () {
  'use strict';

  // ============================================================
  // GCLID + UTM Parameter Capture
  // ============================================================
  function captureURLParams() {
    const params = new URLSearchParams(window.location.search);

    const gclidField = document.getElementById('gclid-field');
    const utmSource = document.getElementById('utm-source');
    const utmMedium = document.getElementById('utm-medium');
    const utmCampaign = document.getElementById('utm-campaign');

    if (gclidField && params.get('gclid')) {
      gclidField.value = params.get('gclid');
    }
    if (utmSource && params.get('utm_source')) {
      utmSource.value = params.get('utm_source');
    }
    if (utmMedium && params.get('utm_medium')) {
      utmMedium.value = params.get('utm_medium');
    }
    if (utmCampaign && params.get('utm_campaign')) {
      utmCampaign.value = params.get('utm_campaign');
    }

    // Store gclid in memory for session persistence
    var gclidStore = null;
    var gclidParam = params.get('gclid');
    if (gclidParam) {
      gclidStore = gclidParam;
    }
  }

  // ============================================================
  // Form Validation
  // ============================================================
  function initFormValidation() {
    const form = document.getElementById('lead-form');
    if (!form) return;

    const fields = {
      'full-name': {
        validate: (v) => v.trim().length >= 2,
        errorId: 'error-name'
      },
      'company': {
        validate: (v) => v.trim().length >= 2,
        errorId: 'error-company'
      },
      'email': {
        validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
        errorId: 'error-email'
      },
      'phone': {
        validate: (v) => v.trim().replace(/\D/g, '').length >= 7,
        errorId: 'error-phone'
      },
      'volume': {
        validate: (v) => v.trim().length > 0,
        errorId: 'error-volume'
      }
    };

    // Real-time validation on blur
    Object.keys(fields).forEach((fieldId) => {
      const input = document.getElementById(fieldId);
      if (!input) return;

      input.addEventListener('blur', function () {
        validateField(fieldId, fields[fieldId]);
      });

      // Clear error on focus
      input.addEventListener('focus', function () {
        clearFieldError(fieldId, fields[fieldId].errorId);
      });
    });

    // Form submission
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      let isValid = true;

      Object.keys(fields).forEach((fieldId) => {
        if (!validateField(fieldId, fields[fieldId])) {
          isValid = false;
        }
      });

      if (!isValid) {
        // Scroll to first error
        const firstError = form.querySelector('.form-input.error, .form-select.error');
        if (firstError) {
          firstError.focus();
        }
        return;
      }

      // Show success
      showFormSuccess();
    });
  }

  function validateField(fieldId, config) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(config.errorId);
    if (!input) return true;

    const value = input.value;
    const isValid = config.validate(value);

    if (!isValid) {
      input.classList.add('error');
      if (errorEl) errorEl.classList.add('visible');
      return false;
    } else {
      input.classList.remove('error');
      if (errorEl) errorEl.classList.remove('visible');
      return true;
    }
  }

  function clearFieldError(fieldId, errorId) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(errorId);
    if (input) input.classList.remove('error');
    if (errorEl) errorEl.classList.remove('visible');
  }

  function showFormSuccess() {
    const form = document.getElementById('lead-form');
    const formFooter = document.querySelector('.form-footer');
    const success = document.getElementById('form-success');
    const formHeader = document.querySelector('.form-card__header');

    if (form) form.style.display = 'none';
    if (formFooter) formFooter.style.display = 'none';
    if (formHeader) formHeader.style.display = 'none';
    if (success) success.classList.add('visible');
  }

  // ============================================================
  // Phone Number Formatting
  // ============================================================
  function initPhoneFormatting() {
    const phoneInput = document.getElementById('phone');
    if (!phoneInput) return;

    phoneInput.addEventListener('input', function () {
      let value = this.value.replace(/\D/g, '');
      if (value.length > 0) {
        if (value.length <= 3) {
          value = '(' + value;
        } else if (value.length <= 6) {
          value = '(' + value.slice(0, 3) + ') ' + value.slice(3);
        } else {
          value = '(' + value.slice(0, 3) + ') ' + value.slice(3, 6) + '-' + value.slice(6, 10);
        }
      }
      this.value = value;
    });
  }

  // ============================================================
  // FAQ Accordion
  // ============================================================
  function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach((item) => {
      const question = item.querySelector('.faq-item__question');
      const answer = item.querySelector('.faq-item__answer');
      const answerInner = item.querySelector('.faq-item__answer-inner');

      if (!question || !answer || !answerInner) return;

      question.addEventListener('click', function () {
        const isActive = item.classList.contains('active');

        // Close all other items
        faqItems.forEach((other) => {
          if (other !== item) {
            other.classList.remove('active');
            const otherAnswer = other.querySelector('.faq-item__answer');
            const otherQuestion = other.querySelector('.faq-item__question');
            if (otherAnswer) otherAnswer.style.maxHeight = '0';
            if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
            const otherAnswerDiv = other.querySelector('.faq-item__answer');
            if (otherAnswerDiv) otherAnswerDiv.setAttribute('aria-hidden', 'true');
          }
        });

        // Toggle current item
        if (isActive) {
          item.classList.remove('active');
          answer.style.maxHeight = '0';
          question.setAttribute('aria-expanded', 'false');
          answer.setAttribute('aria-hidden', 'true');
        } else {
          item.classList.add('active');
          answer.style.maxHeight = answerInner.scrollHeight + 24 + 'px';
          question.setAttribute('aria-expanded', 'true');
          answer.setAttribute('aria-hidden', 'false');
        }
      });
    });
  }

  // ============================================================
  // Smooth Scroll for Anchor Links
  // ============================================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        const headerHeight = document.querySelector('.header')?.offsetHeight || 72;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      });
    });
  }

  // ============================================================
  // Sticky Header Scroll Effect
  // ============================================================
  function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    let lastScrollY = 0;
    let ticking = false;

    function updateHeader() {
      const scrollY = window.pageYOffset;

      if (scrollY > 50) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }

      lastScrollY = scrollY;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
  }

  // ============================================================
  // Mobile CTA Bar
  // ============================================================
  function initMobileCTABar() {
    const bar = document.getElementById('mobile-cta-bar');
    if (!bar) return;

    let ticking = false;

    function updateBar() {
      const scrollY = window.pageYOffset;

      if (scrollY > 500) {
        bar.classList.add('visible');
      } else {
        bar.classList.remove('visible');
      }

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateBar);
        ticking = true;
      }
    }, { passive: true });
  }

  // ============================================================
  // Intersection Observer for Fade-in Animations
  // ============================================================
  function initScrollAnimations() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    document.querySelectorAll('.fade-in').forEach((el) => {
      observer.observe(el);
    });
  }

  // ============================================================
  // Initialize Everything
  // ============================================================
  function init() {
    captureURLParams();
    initFormValidation();
    initPhoneFormatting();
    initFAQ();
    initSmoothScroll();
    initHeaderScroll();
    initMobileCTABar();
    initScrollAnimations();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
