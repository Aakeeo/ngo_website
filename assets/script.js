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

  // Active section highlighting in navbar
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');

  if (sections.length > 0 && navLinks.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px -66%',
      threshold: 0
    };

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');

          // Remove active class from all nav links
          navLinks.forEach(function(link) {
            link.classList.remove('active');
          });

          // Add active class to the corresponding nav link
          navLinks.forEach(function(link) {
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('active');
              console.log('Active section:', id); // Debug log
            }
          });
        }
      });
    }, observerOptions);

    // Observe all sections
    sections.forEach(function(section) {
      observer.observe(section);
    });

    console.log('Section highlighting initialized'); // Debug log
  }
})();

// Razorpay Donation Integration
// TODO: Replace with your live Razorpay Key ID before going to production
const RAZORPAY_KEY = 'YOUR_RAZORPAY_KEY_ID';
let selectedAmount = 0;

function openDonationModal() {
  document.getElementById('donationModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDonationModal() {
  document.getElementById('donationModal').classList.remove('active');
  document.body.style.overflow = '';
  // Reset form
  selectedAmount = 0;
  document.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('selected'));
  document.getElementById('customAmount').value = '';
  document.getElementById('donorName').value = '';
  document.getElementById('donorEmail').value = '';
  document.getElementById('donorPhone').value = '';
}

// Amount button selection
document.addEventListener('DOMContentLoaded', function() {
  const amountBtns = document.querySelectorAll('.amount-btn');
  const customAmountInput = document.getElementById('customAmount');

  amountBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      amountBtns.forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      selectedAmount = parseInt(this.dataset.amount);
      customAmountInput.value = '';
    });
  });

  customAmountInput.addEventListener('input', function() {
    amountBtns.forEach(b => b.classList.remove('selected'));
    selectedAmount = parseInt(this.value) || 0;
  });

  // Close modal on outside click
  document.getElementById('donationModal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeDonationModal();
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeDonationModal();
    }
  });
});

function initiatePayment() {
  const name = document.getElementById('donorName').value.trim();
  const email = document.getElementById('donorEmail').value.trim();
  const phone = document.getElementById('donorPhone').value.trim();

  // Validation
  if (selectedAmount < 1) {
    alert('Please select or enter a donation amount');
    return;
  }
  if (!name) {
    alert('Please enter your name');
    return;
  }
  if (!email || !email.includes('@')) {
    alert('Please enter a valid email address');
    return;
  }
  if (!phone || phone.length < 10) {
    alert('Please enter a valid phone number');
    return;
  }

  const options = {
    key: RAZORPAY_KEY,
    amount: selectedAmount * 100, // Razorpay expects amount in paise
    currency: 'INR',
    name: 'Reminiscence Welfare Trust',
    description: 'Donation to RWT',
    image: 'https://reminiscencewelfaretrust.org/assets/logo.png',
    handler: function(response) {
      // Payment successful
      alert('Thank you for your donation! Payment ID: ' + response.razorpay_payment_id);
      closeDonationModal();
      // You can send this to your server to verify and record
      console.log('Payment successful:', response);
    },
    prefill: {
      name: name,
      email: email,
      contact: phone
    },
    notes: {
      purpose: 'Donation',
      donor_name: name
    },
    theme: {
      color: '#2d5a27'
    },
    modal: {
      ondismiss: function() {
        console.log('Payment modal closed');
      }
    }
  };

  const rzp = new Razorpay(options);

  rzp.on('payment.failed', function(response) {
    alert('Payment failed. Please try again. Error: ' + response.error.description);
    console.error('Payment failed:', response.error);
  });

  rzp.open();
}
