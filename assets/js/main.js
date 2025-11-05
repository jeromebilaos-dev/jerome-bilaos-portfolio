// --- DYNAMIC CONTENT LOADER ---
const loadHTML = (filePath, placeholderId) => {
  const placeholder = document.getElementById(placeholderId);
  if (placeholder) {
    fetch(filePath)
      .then(response => response.ok ? response.text() : Promise.reject('File not found'))
      .then(data => {
        placeholder.innerHTML = data;
        if (placeholderId === 'nav-placeholder') {
          initializeNavigation(); // Initialize nav AFTER it's loaded
        }
      })
      .catch(error => console.error(`Error loading ${placeholderId}:`, error));
  }
};

// --- NAVIGATION MENU LOGIC ---
const initializeNavigation = () => {
  const menuToggleBtn = document.getElementById('menu-toggle-btn');
  const mainNav = document.getElementById('main-nav');
  if (menuToggleBtn && mainNav) {
    menuToggleBtn.addEventListener('click', () => {
      menuToggleBtn.classList.toggle('active');
      mainNav.classList.toggle('active');
    });
  }
};

// --- MAIN INITIALIZATION ---
// This function runs when the page is ready
document.addEventListener("DOMContentLoaded", function() {
  loadHTML('partials/nav.html', 'nav-placeholder');
  
  // ===================================================================
  // --- ALL OF YOUR ORIGINAL JAVASCRIPT LOGIC IS BELOW THIS LINE ---
  // ===================================================================
  
  // --- SETUP: GLOBAL VARIABLES & INITIALIZATION ---
  const creativeModalEl = document.getElementById('creativeModal');
  const inactivityModalEl = document.getElementById('inactivityModal');
  const exitIntentModalEl = document.getElementById('exitIntentModal');
  let currentModalInstance = null; // For Swiper/Masonry instances

  // ===============================================================
  // --- MODULE 1: CORE MODAL SYSTEM ---
  // ===============================================================
  const focusableElementsString = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

  function createModalController(modalElement) {
    if (!modalElement) return { open: () => {}, close: () => {} }; // Safety check
    const modalCloseBtn = modalElement.querySelector('.modal-close');
    let previouslyFocusedElement;

    function trapFocus(e, focusableElements) {
      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement = focusableElements[focusableElements.length - 1];
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            e.preventDefault();
            lastFocusableElement.focus();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            e.preventDefault();
            firstFocusableElement.focus();
          }
        }
      }
    }

    function open() {
      previouslyFocusedElement = document.activeElement;
      modalElement.classList.add('active');
      document.body.style.overflow = 'hidden';

      const focusableElements = modalElement.querySelectorAll(focusableElementsString);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
        modalElement.addEventListener('keydown', (e) => trapFocus(e, focusableElements));
      }
    }

    function close() {
      if (document.querySelector('.fancybox__container')) {
        Fancybox.close();
        return;
      }

      modalElement.classList.remove('active');
      document.body.style.overflow = '';
      modalElement.removeEventListener('keydown', trapFocus);

      if (previouslyFocusedElement) {
        previouslyFocusedElement.focus();
      }

      if (currentModalInstance && typeof currentModalInstance.destroy === 'function') {
        currentModalInstance.destroy(true, true);
        currentModalInstance = null;
      }
    }

    if(modalCloseBtn) modalCloseBtn.addEventListener('click', close);
    modalElement.addEventListener('click', (e) => {
      if (e.target === modalElement && !document.querySelector('.fancybox__container')) {
        close();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalElement.classList.contains('active')) {
        close();
      }
    });
    return { open, close };
  }

  const creativeModal = createModalController(creativeModalEl);
  const inactivityModal = createModalController(inactivityModalEl);
  const exitIntentModal = createModalController(exitIntentModalEl);

  // ========================================================
  // --- MODULE 2: AUDIO INTRODUCTION LOGIC ---
  // ========================================================
  const playPauseBtn = document.getElementById('play-pause-btn');
  const introAudio = document.getElementById('introAudio');
  const headshotImage = document.getElementById('headshot-img');
  const headshotContainer = headshotImage ? headshotImage.parentElement : null;
  const audioPromptBubble = document.getElementById('audio-prompt-bubble');

  let hasPlayedOnce = false;

  function togglePlayPause() {
    if (introAudio && introAudio.paused) {
      introAudio.play();
    } else if (introAudio) {
      introAudio.pause();
    }
  }

  function updateUI() {
    if (!introAudio || !playPauseBtn) return;
    const isPlaying = !introAudio.paused;
    playPauseBtn.querySelector('.icon-play').style.display = isPlaying ? 'none' : 'block';
    playPauseBtn.querySelector('.icon-pause').style.display = isPlaying ? 'block' : 'none';
    playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pause Introduction' : 'Play Introduction');
    if (headshotImage) headshotImage.classList.toggle('is-talking', isPlaying);

    if (isPlaying && !hasPlayedOnce && audioPromptBubble) {
      audioPromptBubble.classList.add('hidden');
      hasPlayedOnce = true;
    }
  }

  if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlayPause);
  if (headshotContainer) headshotContainer.addEventListener('click', togglePlayPause);
  if (introAudio) {
    introAudio.addEventListener('play', updateUI);
    introAudio.addEventListener('pause', updateUI);
    introAudio.addEventListener('ended', updateUI);
  }

  if (audioPromptBubble) {
    setTimeout(() => {
      if (!hasPlayedOnce) {
        audioPromptBubble.classList.add('hidden');
      }
    }, 5000);
  }

  updateUI();

  // ========================================================
  // --- MODULE 3: PROACTIVE ENGAGEMENT LOGIC ---
  // ========================================================
  let inactivityTimer;

  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      if (!document.querySelector('.modal.active')) {
        inactivityModal.open();
      }
    }, 120000); // 2 minutes
  }
  document.addEventListener('visibilitychange', () => document.hidden ? clearTimeout(inactivityTimer) : resetInactivityTimer());
  ['mousemove', 'keypress', 'click', 'scroll'].forEach(evt => document.addEventListener(evt, resetInactivityTimer, false));
  resetInactivityTimer();

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isTouchDevice) {
    document.documentElement.addEventListener('mouseleave', (e) => {
      if (e.clientY < 0 && !document.querySelector('.modal.active')) {
        exitIntentModal.open();
      }
    });
  }

  // ========================================================
  // --- MODULE 4: MOBILE STICKY CTA LOGIC ---
  // ========================================================
  const stickyCTA = document.getElementById('mobile-sticky-cta');
  const introPane = document.querySelector('.left-pane');
  if (stickyCTA && introPane) {
      const ctaObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
              stickyCTA.classList.toggle('visible', !entry.isIntersecting);
          });
      }, { threshold: 0.1 });
      ctaObserver.observe(introPane);
  }

  // ========================================================
  // --- MODULE 5: ORIGINAL PORTFOLIO JAVASCRIPT ---
  // ========================================================
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, {
    threshold: 0.1
  });
  animatedElements.forEach(el => scrollObserver.observe(el));
  document.querySelectorAll('#introduction > .animate-on-scroll').forEach(el => el.classList.add('is-visible'));

  let headerAnimationInterval;

  function startHeaderAnimation() {
    const headerContainer = document.getElementById('animated-header-container');
    if (!headerContainer || headerAnimationInterval) return;
    const headers = headerContainer.querySelectorAll('h2');
    if (headers.length === 0) return;
    let currentIndex = 0;
    headers[currentIndex].classList.add('text-in');
    headerAnimationInterval = setInterval(() => {
      headers[currentIndex].classList.remove('text-in');
      headers[currentIndex].classList.add('text-out');
      currentIndex = (currentIndex + 1) % headers.length;
      headers[currentIndex].classList.remove('text-out');
      headers[currentIndex].classList.add('text-in');
    }, 4000);
  }
  const footerObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) startHeaderAnimation();
  }, {
    threshold: 0.5
  });
  const footerEl = document.getElementById('contact');
  if (footerEl) footerObserver.observe(footerEl);

  const creativeCards = document.querySelectorAll('.creative-card');
  creativeCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      card.style.transform = `perspective(1000px) rotateX(${(y / (rect.height / 2)) * -10}deg) rotateY(${(x / (rect.width / 2)) * 10}deg) scale3d(1.03, 1.03, 1.03)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
  });

  const experiencesData = [{ header: 'Digital Solutions Specialist', subheader: 'AJD Digital Solutions', duration: 'November 2023 – Present', website: null, description: 'Providing comprehensive digital expertise across multiple domains, including WordPress development, SEO, project management, and content creation. Architecting and implementing robust digital strategies for clients that enhance online visibility, drive engagement, and deliver measurable results.', tags: ['WordPress', 'SEO & Web Optimization Specialist', 'Project Management', 'Content Creator & Copywriter', 'Digital Marketing Strategist', 'General Virtual Assistant'], image: 'https://images.unsplash.com/photo-1517694712202-1428bc64a259' }, { header: 'WordPress & SEO Specialist', subheader: 'The Handyman Services, WA', duration: 'December 2023 – Present', website: 'https://thehandymansystem.com/', description: 'Driving client acquisition and market visibility by developing and managing a professional WordPress website. Implementing targeted SEO strategies to connect the business with local customers actively searching for handyman services, resulting in increased organic traffic and qualified leads.', tags: ['WordPress', 'SEO & Web Optimization Specialist', 'Website Designer & Developer', 'Digital Marketing Strategist', 'Local SEO'], image: 'https://images.unsplash.com/photo-1560472354-b333cb9352e7' }, { header: 'Digital Marketing & Admin Support', subheader: 'Natural Awakenings, NJ', duration: 'March 2023 – Present', website: 'https://www.naturalawakeningsnj.com/', description: "Enhancing the publication's digital footprint and streamlining operations through a combination of virtual assistance and strategic content marketing. Managing administrative tasks to ensure smooth daily operations while developing and distributing engaging content that resonates with a health-conscious audience.", tags: ['Content Creator & Copywriter', 'Digital Marketing Strategist', 'Social Media Manager', 'General Virtual Assistant', 'Administrative Support'], image: 'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e' }, { header: 'WordPress Developer & Virtual Assistant', subheader: 'Crowned Creative Space, PA', duration: 'December 2023 – September 2025', website: 'https://www.crownedcreativespace.com/', description: 'Developing and maintaining a visually appealing and functional WordPress website to attract and inform potential clients for this premier event venue. Providing essential administrative and client support to ensure a seamless booking and planning process.', tags: ['WordPress', 'Website Designer & Developer', 'General Virtual Assistant', 'Customer Support & CRM Manager', 'SEO & Web Optimization Specialist'], image: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0' }, { header: 'SEO & Web Development Specialist', subheader: 'Redwood Cleaning, NJ', duration: 'October 2023 – March 2025', website: null, description: "Boosting the company's local search presence and client base by architecting a user-friendly WordPress site and deploying effective SEO tactics. Focusing on local search optimization to ensure the business ranks prominently for relevant cleaning service queries in New Jersey.", tags: ['SEO & Web Optimization Specialist', 'WordPress', 'Website Designer & Developer', 'Local SEO', 'Digital Marketing Strategist', 'General Virtual Assistant'], image: 'https://images.unsplash.com/photo-1599310342043-5598d1a0bd3d' }, { header: 'Project Manager & Team Leader', subheader: 'HeroApps Software Development Services, Philippines', duration: 'March 2021 – June 2025', website: 'https://heroapps.com.ph/', description: 'Successfully directed end-to-end website creation and iOS app development projects, consistently achieving a 95% client satisfaction rate. Expertly led, mentored, and expanded a team of virtual assistants, which drove a 30% increase in new client acquisition.', tags: ['Operations & Project Manager', 'Website Designer & Developer', 'Digital Marketing Strategist', 'Sales and Marketing Specialist', 'Process & Efficiency Strategist'], image: 'https://images.unsplash.com/photo-1552664730-d307ca884978' }, { header: 'SEO & WordPress Virtual Assistant', subheader: 'Colton P., Utah, Texas (via OnlineJobs.ph)', duration: 'June 2022 – April 2023', website: null, description: 'Significantly enhanced the online presence of multiple businesses by architecting and implementing effective SEO strategies, resulting in a 40% increase in organic search traffic. Developed visually appealing website layouts and managed e-commerce stores using WooCommerce.', tags: ['SEO & Web Optimization Specialist', 'Website Designer & Developer', 'WordPress', 'Digital Marketing Strategist', 'General Virtual Assistant'], image: 'https://images.unsplash.com/photo-1616401784845-1808454c9e07' }, { header: 'General Virtual Assistant', subheader: 'Swift Lawn and Garden Care, Brisbane, Australia', duration: 'December 2020 – March 2022', website: 'https://www.swiftlgc.com.au/', description: "Played a pivotal role in expanding the company's client base and boosting revenue by consistently securing and maintaining 2-3 new business partnerships every two weeks. Fostered trust and credibility by professionally promoting the company's services.", tags: ['General Virtual Assistant', 'Sales and Marketing Specialist', 'Operations & Project Manager', 'Customer Support & CRM Manager', 'Business Development'], image: 'https://images.unsplash.com/photo-1554744512-d6c603f27c54' }, { header: 'Quality Assurance Engineer', subheader: 'Wembassy LLC, US', duration: 'September 2020 – November 2020', website: 'https://wembassy.com/', description: 'Improved overall efficiency and product quality by implementing rigorous testing methodologies and creating comprehensive test cases, which resulted in a 30% reduction in post-release issues. Collaborated effectively with development teams to provide valuable feedback on new features.', tags: ['Quality Assurance & Tester', 'Process & Efficiency Strategist', 'Automation & Systems Specialist', 'Technical Analysis'], image: 'https://images.unsplash.com/photo-1581093581729-289d33b3d1b8' }, { header: 'Content SEO + Digital Marketing', subheader: 'Cornerstone Marketing Solutions, Inc., US - PH', duration: 'September 2019 – August 2020', website: 'https://www.cornerstonemarketingsolutions.com/', description: 'Drove significant client growth by creating high-quality, SEO-optimized blog content that consistently surpassed performance targets by 30% and increased content engagement rates by 25%. Maintained a high level of client satisfaction and a 98% on-time delivery rate.', tags: ['Content Creator & Copywriter', 'Digital Marketing Strategist', 'SEO & Web Optimization Specialist', 'Social Media Manager', 'Content Strategy'], image: 'https://images.unsplash.com/photo-1554232456-8727a6e6fdf2' }, { header: 'Quality Assurance Specialist', subheader: 'Simpro Software Limited, Australia', duration: 'November 2017 – September 2019', website: 'https://www.simprogroup.com/', description: 'Ensured the delivery of high-quality software by creating and executing an average of 30 comprehensive test cases per project, minimizing critical defects. Proactively identified and reported critical issues, leading to a 30% reduction in post-release customer complaints.', tags: ['Quality Assurance & Tester', 'Automation & Systems Specialist', 'Process & Efficiency Strategist', 'System Integration'], image: 'https://images.unsplash.com/photo-1664575196044-193406f86a9f' }, { header: 'Helpdesk & NOC Specialist (IT)', subheader: 'Greymouse Virtual Workforce, Australia/PH', duration: 'September 2021 – February 2018', website: 'https://greymouse.com.au/', description: 'Maintained optimal performance and minimized downtime of company servers through diligent monitoring and maintenance. Achieved a 90% first-call resolution rate and contributed to a significant reduction in average response times.', tags: ['Customer Support & CRM Manager', 'Automation & Systems Specialist', 'IT Support', 'Operations & Project Manager'], image: 'https://images.unsplash.com/photo-1521185496955-15097b20c5fe' }, { header: 'Merchandise Inventory Specialist', subheader: 'La Consumidores Corporation, Bicol, Philippines', duration: 'May 2014 – September 2015', website: 'https://lcc.com.ph/', description: 'Improved inventory management and customer satisfaction by implementing strategies that effectively reduced stockouts. Achieved and maintained a 98% inventory accuracy rate through consistent quarterly audits. Streamlined the inventory tracking system, reducing task time by 30%.', tags: ['Process & Efficiency Strategist', 'Operations & Project Manager', 'Inventory Management', 'Data Analysis'], image: 'https://images.unsplash.com/photo-1576185244365-4f733e8b19cc' }, { header: 'Customer Service Representative / Associate', subheader: 'Sutherland Global, Philippines', duration: 'September 2013 – April 2014', website: 'https://www.sutherlandglobal.com/', description: 'Delivered exceptional customer service, achieving high satisfaction ratings and earning recognition as a top performer. Contributed directly to team sales targets by achieving a 30% higher conversion rate on sales inquiries.', tags: ['Customer Support & CRM Manager', 'Sales and Marketing Specialist', 'General Virtual Assistant', 'Client Relations'], image: 'https://images.unsplash.com/photo-1628033254208-18e4a4a15983' }].sort((a, b) => new Date(b.duration.split(' – ')[0]) - new Date(a.duration.split(' – ')[0]));
  const slideshowContainer = document.querySelector('.slideshow');
  if (slideshowContainer) {
    experiencesData.forEach(job => {
      const slide = document.createElement('div');
      slide.className = 'slide';
      let tagsHTML = job.tags.map(tag => `<span>${tag}</span>`).join('');
      let websiteLink = job.website ? `<a href="${job.website}" target="_blank" rel="noopener noreferrer">${job.subheader}</a>` : job.subheader;
      slide.innerHTML = `<img src="${job.image}?w=700&q=80" alt="Workplace for ${job.header}" loading="lazy"><h3>${job.header}</h3><p class="meta"><span>${websiteLink}</span> | <span>${job.duration}</span></p><p>${job.description}</p><div class="tags">${tagsHTML}</div>`;
      slideshowContainer.appendChild(slide);
    });
    let currentIndex = 0;
    const totalSlides = experiencesData.length;
    const prevButton = document.getElementById('prev-slide');
    const nextButton = document.getElementById('next-slide');
    const goToSlide = (index) => {
      slideshowContainer.style.transform = `translateX(-${index * 100}%)`;
      currentIndex = index;
      if (prevButton) prevButton.classList.toggle('disabled', currentIndex === 0);
      if (nextButton) nextButton.classList.toggle('disabled', currentIndex === totalSlides - 1);
    }
    if (nextButton) nextButton.addEventListener('click', () => {
      if (currentIndex < totalSlides - 1) goToSlide(currentIndex + 1);
    });
    if (prevButton) prevButton.addEventListener('click', () => {
      if (currentIndex > 0) goToSlide(currentIndex - 1);
    });
    goToSlide(0);
  }

  const testimonials = Array.from(document.querySelectorAll('.testimonial-card'));
  const toggleButton = document.getElementById('toggle-testimonials');
  if (toggleButton && testimonials.length > 2) {
    const initialVisible = 2;
    testimonials.forEach((card, index) => {
      if (index >= initialVisible) card.classList.add('hidden');
    });
    toggleButton.addEventListener('click', () => {
      const isShowingMore = toggleButton.textContent.includes('Read More');
      const visibleCount = testimonials.filter(card => !card.classList.contains('hidden')).length;
      if (isShowingMore) {
        const nextVisibleLimit = visibleCount + 2;
        testimonials.forEach((card, index) => {
          if (index < nextVisibleLimit) card.classList.remove('hidden');
        });
        if (nextVisibleLimit >= testimonials.length) toggleButton.textContent = 'Show Less';
      } else {
        testimonials.forEach((card, index) => {
          if (index >= initialVisible) card.classList.add('hidden');
        });
        toggleButton.textContent = 'Read More';
      }
    });
  } else if (toggleButton) {
    toggleButton.style.display = 'none';
  }

  document.querySelectorAll('.creative-card').forEach(card => card.addEventListener('click', () => {
    const modalTitle = card.dataset.modalTitle;
    const modalContentStr = card.dataset.modalContent;
    const modalTitleEl = creativeModalEl.querySelector('.modal-title');
    const modalBodyEl = creativeModalEl.querySelector('.modal-body');

    try {
      const content = JSON.parse(modalContentStr);
      modalTitleEl.textContent = modalTitle;
      modalBodyEl.innerHTML = '';
      if (content.type === 'gallery-lightbox' && typeof Fancybox !== 'undefined') {
        const galleryEl = document.createElement('div');
        galleryEl.className = 'lightbox-gallery';
        content.items.forEach(item => {
          galleryEl.innerHTML += `<a href="${item.full}" data-fancybox="gallery" data-caption="${item.caption || ''}"><img src="${item.thumb}" alt="${item.caption || 'Gallery image'}"></a>`;
        });
        modalBodyEl.appendChild(galleryEl);
        Fancybox.bind('[data-fancybox="gallery"]', {
          hideScrollbar: false
        });
      } else if (content.type === 'gallery-masonry' && typeof Masonry !== 'undefined' && typeof imagesLoaded !== 'undefined') {
        const grid = document.createElement('div');
        grid.className = 'masonry-grid';
        content.items.forEach(item => {
          const itemEl = document.createElement('div');
          itemEl.className = 'masonry-item';
          itemEl.innerHTML = item.type === 'image' ? `<img src="${item.src}" alt="Social media graphic">` : `<video controls muted loop playsinline src="${item.src}"></video>`;
          grid.appendChild(itemEl);
        });
        modalBodyEl.appendChild(grid);
        imagesLoaded(grid, () => {
          grid.style.visibility = 'visible';
          currentModalInstance = new Masonry(grid, {
            itemSelector: '.masonry-item',
            percentPosition: true
          });
        });
      } else if (content.type === 'blog') {
        const layout = document.createElement('div');
        layout.className = 'blog-modal-layout';
        let archiveHTML = content.archive && content.archive.length > 0 ? `<div class="blog-archive"><h4>Older Posts</h4><ul>${content.archive.map(post => `<li><a href="#">${post.title}</a></li>`).join('')}</ul></div>` : '';
        layout.innerHTML = `<div class="blog-main-content"><img src="${content.featured.img}" alt="${content.featured.title}"><h2>${content.featured.title}</h2>${content.featured.content}</div>${archiveHTML}`;
        modalBodyEl.appendChild(layout);
      } else if (content.type === 'carousel' && typeof Swiper !== 'undefined') {
        const carouselContainer = document.createElement('div');
        carouselContainer.className = 'swiper';
        carouselContainer.innerHTML = `<div class="swiper-wrapper">${content.items.map(item => `<div class="swiper-slide"><img src="${item.img}" alt="${item.caption || ''}"></div>`).join('')}</div><div class="swiper-pagination"></div><div class="swiper-button-prev"></div><div class="swiper-button-next"></div>`;
        modalBodyEl.appendChild(carouselContainer);
        currentModalInstance = new Swiper(carouselContainer, {
          loop: true,
          pagination: {
            el: '.swiper-pagination',
            clickable: true
          },
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
          },
        });
      }
      creativeModal.open();
    } catch (e) {
      console.error("Could not parse modal content:", e);
    }
  }));

  const canvas = document.getElementById('matrix-background');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const keywords = ['SEO', 'WORDPRESS', 'WEBSITE', 'AI', 'REPORTS', 'ANALYTICS', 'MARKETING', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'TIKTOK', 'SHOPIFY', 'WIX', 'PROJECT MANAGEMENT', 'AUTOMATION', 'ECOMMERCE', 'GOOGLE ADS', 'META ADS', 'CONTENT', 'STRATEGY', 'QA TESTING', 'CRM', 'ZAPIER', 'OPERATIONS', 'EFFICIENCY', 'DATA'];
    const alphabet = [...new Set(keywords.join('').replace(/\s/g, ''))].join('') + '0123456789';
    const fontSize = 16;
    let columns, rainDrops, animationInterval;
    const setupCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(window.innerWidth / fontSize);
      rainDrops = Array(columns).fill(1).map(() => Math.floor(Math.random() * canvas.height / fontSize));
    };
    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FFD700';
      ctx.font = fontSize + 'px monospace';
      rainDrops.forEach((y, i) => {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        ctx.fillText(text, i * fontSize, y * fontSize);
        if (y * fontSize > canvas.height && Math.random() > 0.975) rainDrops[i] = 0;
        rainDrops[i]++;
      });
    };
    const startAnimation = () => {
      if (animationInterval) clearInterval(animationInterval);
      animationInterval = setInterval(draw, 80);
    }
    document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(animationInterval) : startAnimation());
    window.addEventListener('resize', () => {
      setupCanvas();
      startAnimation();
    });
    setupCanvas();
    startAnimation();
  }

  const siteFooter = document.querySelector('.site-footer');
  const rightPane = document.querySelector('.right-pane');
  const leftPane = document.querySelector('.left-pane');
  const handleFooterLocation = () => {
      if (!siteFooter || !rightPane || !leftPane) return;
    const isMobile = window.matchMedia("(max-width: 1024px)").matches;
    if (isMobile && siteFooter.parentElement !== rightPane) {
      rightPane.appendChild(siteFooter);
      siteFooter.classList.add('moved-footer');
    } else if (!isMobile && siteFooter.parentElement !== leftPane) {
      leftPane.appendChild(siteFooter);
      siteFooter.classList.remove('moved-footer');
    }
  };
  handleFooterLocation();
  window.addEventListener('resize', handleFooterLocation);

});