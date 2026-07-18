
document.addEventListener('DOMContentLoaded', () => {
  // Chaque fonction est isolée dans son propre try/catch : si l'une
  // échoue (ex. localStorage bloqué par le navigateur en file://),
  // les autres fonctionnalités de la page continuent de s'initialiser.
  const features = [
    initThemeToggle,
    initNavbarScroll,
    initScrollAnimations,
    initCountdown,
    initAnimatedCounters,
    initProgramTabs,
    initSpeakerFilter,
    initContactForm,
    initBackToTop,
    injectCurrentYear,
  ];

  features.forEach((feature) => {
    try {
      feature();
    } catch (error) {
      console.error(`Erreur dans ${feature.name} :`, error);
    }
  });
});

/* --------------------------------------------------------------------------
   DARK MODE / LIGHT MODE — persistant via localStorage
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  const toggleButtons = document.querySelectorAll('.theme-toggle');
  if (!toggleButtons.length) return;

  // localStorage peut être bloqué (navigation en file://, mode privé,
  // protection anti-pistage) : on part sur "light" par défaut si l'accès échoue.
  let savedTheme = 'light';
  try {
    savedTheme = localStorage.getItem('africonnect-theme') || 'light';
  } catch (error) {
    console.warn('localStorage indisponible, thème par défaut appliqué.', error);
  }
  applyTheme(savedTheme);

  toggleButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try {
        localStorage.setItem('africonnect-theme', next);
      } catch (error) {
        console.warn('Impossible d\'enregistrer le thème (localStorage indisponible).', error);
      }
    });
  });

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    toggleButtons.forEach((btn) => {
      const icon = btn.querySelector('i');
      if (icon) icon.className = theme === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
    });
  }
}

/* --------------------------------------------------------------------------
   NAVBAR — passe de transparente à blanche/ombrée après 80px de scroll
   -------------------------------------------------------------------------- */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const toggleScrolled = () => {
    navbar.classList.toggle('navbar-scrolled', window.scrollY > 80);
  };

  toggleScrolled();
  window.addEventListener('scroll', toggleScrolled);
}

/* --------------------------------------------------------------------------
   ANIMATIONS AU SCROLL — IntersectionObserver ajoute .in-view
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
  const targets = document.querySelectorAll('[data-animate]');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  targets.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------------------------
   COMPTE À REBOURS TEMPS RÉEL
   -------------------------------------------------------------------------- */
function initCountdown() {
  const countdownEl = document.querySelector('.countdown');
  if (!countdownEl) return;

  const targetDate = new Date('2026-11-18T09:00:00');

  const daysEl = document.querySelector('#cd-days');
  const hoursEl = document.querySelector('#cd-hours');
  const minutesEl = document.querySelector('#cd-minutes');
  const secondsEl = document.querySelector('#cd-seconds');

  function updateCountdown() {
    const diff = targetDate - new Date();

    if (diff <= 0) {
      countdownEl.innerHTML = '<p>L\'événement a commencé — à bientôt sur place !</p>';
      clearInterval(timer);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  const timer = setInterval(updateCountdown, 1000);
}

/* --------------------------------------------------------------------------
   COMPTEURS ANIMÉS AU SCROLL
   -------------------------------------------------------------------------- */
function initAnimatedCounters() {
  const counters = document.querySelectorAll('[data-counter-target]');
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-counter-target'), 10);
    const duration = 1600;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString('fr-FR');
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString('fr-FR');
      }
    }
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------------------------
   ONGLETS DU PROGRAMME
   -------------------------------------------------------------------------- */
function initProgramTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  if (!tabButtons.length) return;

  const panels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab-target');
      tabButtons.forEach((b) => b.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(targetId).classList.add('active');
    });
  });
}

/* --------------------------------------------------------------------------
   FILTRAGE DYNAMIQUE DES INTERVENANTS
   -------------------------------------------------------------------------- */
function initSpeakerFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  if (!filterButtons.length) return;

  const speakerCards = document.querySelectorAll('.speaker-card');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-filter');
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      speakerCards.forEach((card) => {
        const matches = category === 'tous' || card.getAttribute('data-category') === category;
        card.classList.toggle('is-hidden', !matches);
      });
    });
  });
}

/* --------------------------------------------------------------------------
   VALIDATION DU FORMULAIRE D'INSCRIPTION
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.querySelector('#registration-form');
  if (!form) return;

  const successBanner = document.querySelector('#form-success');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    let isFormValid = true;
    isFormValid = validateRequiredText('full-name', 'Merci d\'indiquer votre nom complet.') && isFormValid;
    isFormValid = validateEmail('email') && isFormValid;
    isFormValid = validatePhone('phone') && isFormValid;
    isFormValid = validateRequiredSelect('participation-type', 'Merci de choisir un type de participation.') && isFormValid;
    isFormValid = validateRequiredSelect('country', 'Merci de sélectionner votre pays.') && isFormValid;
    isFormValid = validateMessage('message') && isFormValid;

    if (isFormValid) {
      successBanner.classList.add('is-visible');
      form.reset();
      form.querySelectorAll('.form-group').forEach((group) => {
        group.classList.remove('is-valid', 'is-invalid');
      });
      successBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      successBanner.classList.remove('is-visible');
    }
  });

  function setFieldState(fieldId, valid, message) {
    const group = document.querySelector(`[data-field="${fieldId}"]`);
    const errorEl = group.querySelector('.error-message');
    group.classList.toggle('is-valid', valid);
    group.classList.toggle('is-invalid', !valid);
    if (errorEl) errorEl.textContent = valid ? '' : message;
    return valid;
  }

  function validateRequiredText(fieldId, message) {
    const input = document.getElementById(fieldId);
    return setFieldState(fieldId, input.value.trim().length > 0, message);
  }

  function validateRequiredSelect(fieldId, message) {
    const select = document.getElementById(fieldId);
    return setFieldState(fieldId, select.value !== '', message);
  }

  function validateEmail(fieldId) {
    const input = document.getElementById(fieldId);
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return setFieldState(fieldId, regex.test(input.value.trim()), 'Merci de saisir une adresse e-mail valide.');
  }

  function validatePhone(fieldId) {
    const input = document.getElementById(fieldId);
    const digitsOnly = input.value.replace(/\D/g, '');
    return setFieldState(fieldId, digitsOnly.length >= 8, 'Le numéro doit contenir au moins 8 chiffres.');
  }

  function validateMessage(fieldId) {
    const textarea = document.getElementById(fieldId);
    return setFieldState(fieldId, textarea.value.trim().length >= 20, 'Merci de rédiger au moins 20 caractères.');
  }
}

/* --------------------------------------------------------------------------
   BOUTON RETOUR EN HAUT
   -------------------------------------------------------------------------- */
function initBackToTop() {
  const backToTopBtn = document.querySelector('.back-to-top');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    backToTopBtn.classList.toggle('is-visible', window.scrollY > 300);
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* --------------------------------------------------------------------------
   ANNÉE DYNAMIQUE DANS LE FOOTER
   -------------------------------------------------------------------------- */
function injectCurrentYear() {
  const year = new Date().getFullYear();
  document.querySelectorAll('.current-year').forEach((el) => { el.textContent = year; });
}