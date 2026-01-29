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

// =========================================
// CAMPAIGNS API INTEGRATION
// =========================================
// Configure the API URL (change for production)
const CAMPAIGNS_API_URL = 'http://localhost:5000/api/campaigns';

// Fetch and display campaigns on page load
document.addEventListener('DOMContentLoaded', function() {
  fetchCampaigns();
});

async function fetchCampaigns() {
  const container = document.getElementById('campaigns-container');
  const errorEl = document.getElementById('campaigns-error');
  const noCampaignsEl = document.getElementById('no-campaigns');

  if (!container) return;

  try {
    const response = await fetch(CAMPAIGNS_API_URL + '?limit=6');

    if (!response.ok) {
      throw new Error('Failed to fetch campaigns');
    }

    const data = await response.json();

    if (!data.success || !data.campaigns || data.campaigns.length === 0) {
      container.innerHTML = '';
      noCampaignsEl.style.display = 'block';
      return;
    }

    // Render campaigns
    container.innerHTML = data.campaigns.map(campaign => renderCampaignCard(campaign)).join('');

  } catch (error) {
    console.error('Error fetching campaigns:', error);
    container.innerHTML = '';
    errorEl.style.display = 'block';
  }
}

function renderCampaignCard(campaign) {
  const categoryLabel = campaign.category
    ? campaign.category.replace('_', ' ')
    : 'General';

  const progressPercent = Math.min(campaign.progress_percentage, 100);
  const daysLeft = campaign.end_date ? Math.max(0, Math.ceil((new Date(campaign.end_date) - new Date()) / (1000 * 60 * 60 * 24))) : null;

  return `
    <article class="campaign-card">
      <div class="campaign-card-img-wrap">
        ${campaign.cover_image
          ? `<img src="${campaign.cover_image}" alt="${campaign.name}" loading="lazy">`
          : `<div class="campaign-card-placeholder"><span>🎯</span></div>`
        }
        <span class="campaign-card-badge">${categoryLabel}</span>
        ${daysLeft !== null ? `<span class="campaign-card-days">${daysLeft} days left</span>` : ''}
      </div>

      <div class="campaign-card-content">
        <h3 class="campaign-card-name">${campaign.name}</h3>
        ${campaign.description ? `<p class="campaign-card-desc">${campaign.description}</p>` : ''}

        <div class="campaign-card-progress-wrap">
          <div class="campaign-card-progress-bar">
            <div class="campaign-card-progress-fill" style="width: ${progressPercent}%"></div>
          </div>
          <div class="campaign-card-amounts">
            <span class="campaign-card-raised">₹${formatNumber(campaign.raised_amount)} raised</span>
            <span class="campaign-card-goal">of ₹${formatNumber(campaign.goal_amount)}</span>
          </div>
        </div>

        <div class="campaign-card-footer">
          <div class="campaign-card-donors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>${campaign.donation_count} donor${campaign.donation_count !== 1 ? 's' : ''}</span>
          </div>
          <div class="campaign-card-share">
            <button onclick="shareCampaign('whatsapp', '${campaign.url}', '${campaign.name}')" title="WhatsApp">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </button>
            <button onclick="shareCampaign('copy', '${campaign.url}', '${campaign.name}')" title="Copy link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </button>
          </div>
        </div>

        <a href="${campaign.url}" class="campaign-card-btn" target="_blank" rel="noopener">
          Donate Now
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </article>
  `;
}

// Share campaign function
function shareCampaign(platform, url, name) {
  const text = `Support "${name}" - Help us reach our goal!`;
  let shareUrl;

  switch(platform) {
    case 'whatsapp':
      shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
      window.open(shareUrl, '_blank');
      break;
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      window.open(shareUrl, '_blank', 'width=600,height=400');
      break;
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(shareUrl, '_blank', 'width=600,height=400');
      break;
    case 'copy':
      navigator.clipboard.writeText(url).then(() => {
        // Show a brief notification
        const btn = event.currentTarget;
        const originalTitle = btn.title;
        btn.title = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.title = originalTitle;
          btn.classList.remove('copied');
        }, 2000);
      });
      break;
  }
}

function formatNumber(num) {
  if (num >= 100000) {
    return (num / 100000).toFixed(1) + 'L';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString('en-IN');
}

// =========================================
// GALLERY API INTEGRATION
// =========================================
const GALLERY_API_URL = 'http://localhost:5000/api/gallery';

// Fetch and display gallery on page load
document.addEventListener('DOMContentLoaded', function() {
  fetchGallery();
});

async function fetchGallery() {
  const container = document.getElementById('gallery-container');
  const staticGallery = document.getElementById('gallery-static');

  if (!container) return;

  try {
    const response = await fetch(GALLERY_API_URL + '?limit=12');

    if (!response.ok) {
      throw new Error('Failed to fetch gallery');
    }

    const data = await response.json();

    if (!data.success || !data.images || data.images.length === 0) {
      // No images from API, show static gallery
      container.style.display = 'none';
      if (staticGallery) staticGallery.style.display = '';
      return;
    }

    // Render gallery from API
    container.innerHTML = data.images.map(image => renderGalleryItem(image)).join('');

  } catch (error) {
    console.error('Error fetching gallery:', error);
    // Show static gallery as fallback
    container.style.display = 'none';
    if (staticGallery) staticGallery.style.display = '';
  }
}

function renderGalleryItem(image) {
  const categoryLabel = image.category
    ? image.category.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : '';

  return `
    <div class="gallery-item">
      <div class="gallery-image-wrapper">
        <img src="${image.image_url}" alt="${image.title}" loading="lazy" />
        <div class="gallery-overlay"></div>
        ${categoryLabel ? `<span class="gallery-badge">${categoryLabel}</span>` : ''}
      </div>
      <div class="gallery-caption">
        <h3>${image.title}</h3>
        ${image.location ? `<p>${image.location}</p>` : (image.description ? `<p>${image.description}</p>` : '')}
      </div>
    </div>
  `;
}
