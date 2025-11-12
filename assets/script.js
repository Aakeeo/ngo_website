// Sticky header scroll state + smooth anchor scrolling + year + mobile menu
(function () {
  const header = document.querySelector('.site-header');
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Sticky header on scroll
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY || window.pageYOffset;
    if (!header) return;
    if (y > 12 && lastY <= 12) header.classList.add('scrolled');
    if (y <= 12 && lastY > 12) header.classList.remove('scrolled');
    lastY = y;
  }, { passive: true });

  // Mobile menu toggle
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.site-nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      nav.classList.toggle('active');
      document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a nav link
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
        menuToggle.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Smooth anchor scrolling with offset for fixed header
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();

      // Get header height for offset
      const headerHeight = header ? header.offsetHeight : 0;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      history.pushState(null, '', id);
    });
  });

  // Lazy load images
  if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      img.src = img.src;
    });
  } else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
  }
})();


