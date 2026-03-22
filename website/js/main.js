// ============================================================================
// ModularAuth-Kit Website — Main JS
// Navigation, scroll animations, tab switching
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initMobileNav();
  initTabs();
});

// ---------- Scroll Animations ----------
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-up');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
}

// ---------- Mobile Navigation ----------
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
  });

  // Close on link click
  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => links.classList.remove('open'));
  });
}

// ---------- Tab Switching (Getting Started page) ----------
function initTabs() {
  const tabs = document.querySelectorAll('.gs-tab');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      // Update tab states
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      // Update panel states
      document.querySelectorAll('.gs-panel').forEach((panel) => {
        panel.classList.toggle('active', panel.id === target);
      });
    });
  });
}
