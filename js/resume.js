// Portfolio JavaScript — Sham Kumar Meghwar

document.addEventListener('DOMContentLoaded', function () {
  initNavigation();
  initSmoothScrolling();
  initScrollAnimations();
  initTypingAnimation();
  initNavbarScroll();
  initMobileMenu();
  initCounterAnimation();
  revealElements();
});

/* ===== Navbar Active Link on Scroll ===== */
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      if (scrollY >= section.offsetTop - 200) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

/* ===== Smooth Scrolling ===== */
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        window.scrollTo({ top: target.offsetTop - 68, behavior: 'smooth' });
        closeMobileMenu();
      }
    });
  });
}

/* ===== Scroll Reveal Animations ===== */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  const animated = [
    { selector: '.section-header',       cls: 'fade-in' },
    { selector: '.about-text',           cls: 'slide-in-left' },
    { selector: '.about-stats',          cls: 'slide-in-right' },
    { selector: '.skill-category',       cls: 'fade-in' },
    { selector: '.timeline-item',        cls: 'fade-in' },
    { selector: '.project-card',         cls: 'fade-in' },
    { selector: '.education-item',       cls: 'fade-in' },
    { selector: '.recommendation-card',  cls: 'fade-in' },
    { selector: '.contact-item',         cls: 'slide-in-left' },
    { selector: '.social-links',         cls: 'slide-in-right' },
  ];

  animated.forEach(({ selector, cls }) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add(cls);
      el.style.transitionDelay = `${i * 0.08}s`;
      observer.observe(el);
    });
  });
}

/* ===== Typing Animation ===== */
function initTypingAnimation() {
  const el = document.querySelector('.typing-text');
  if (!el) return;

  const texts = [
    'iOS & Flutter Developer',
    'Mobile App Developer',
    'Software Engineer',
    'SwiftUI Specialist',
    'UI/UX Enthusiast',
  ];

  let textIndex = 0, charIndex = 0, isDeleting = false;

  function typeText() {
    const current = texts[textIndex];
    el.textContent = isDeleting
      ? current.substring(0, charIndex - 1)
      : current.substring(0, charIndex + 1);

    isDeleting ? charIndex-- : charIndex++;

    let delay = isDeleting ? 45 : 95;

    if (!isDeleting && charIndex === current.length) {
      delay = 2200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      delay = 400;
    }

    setTimeout(typeText, delay);
  }

  setTimeout(typeText, 900);
}

/* ===== Navbar Scroll Effect ===== */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
  }, { passive: true });
}

/* ===== Mobile Menu ===== */
function initMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    menu.classList.toggle('active');
    toggle.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      closeMobileMenu();
    }
  });
}

function closeMobileMenu() {
  const menu = document.getElementById('nav-menu');
  const toggle = document.getElementById('nav-toggle');
  if (menu) menu.classList.remove('active');
  if (toggle) toggle.classList.remove('active');
}

/* ===== Counter Animation ===== */
function initCounterAnimation() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const suffix = el.textContent.includes('+') ? '+' : '';
  const duration = 1600;
  const step = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      el.textContent = target + '+';
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current) + (current > 1 ? '+' : '');
    }
  }, 16);
}

/* ===== Scroll Reveal (fallback) ===== */
function revealElements() {
  document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight - 120) {
      el.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', revealElements, { passive: true });

/* ===== Parallax on Hero Orb ===== */
window.addEventListener('scroll', () => {
  const orb = document.querySelector('.hero-orb');
  if (orb) {
    orb.style.transform = `translate(-50%, calc(-50% + ${window.scrollY * 0.15}px))`;
  }
}, { passive: true });


/* ===== LinkedIn Recommendations ===== */
function openLinkedInProfile(profileId) {
  window.open(
    'https://www.linkedin.com/in/kumarsham/details/recommendations/?detailScreenTabIndex=0',
    '_blank'
  );
}

/* ===== Page Load ===== */
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});
