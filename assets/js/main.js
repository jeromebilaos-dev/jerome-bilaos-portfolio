document.addEventListener("DOMContentLoaded", function() {

    // --- SETUP: GLOBAL AND ONCE-ONLY INITIALIZATIONS ---
    const rightPane = document.querySelector('.right-pane');
    
    // Initialize things that only need to be set up once
    const creativeModal = createModalController(document.getElementById('creativeModal'));
    const inactivityModal = createModalController(document.getElementById('inactivityModal'));
    const exitIntentModal = createModalController(document.getElementById('exitIntentModal'));
    
    initializeMatrixBackground();
    initializePermanentAudio();
    initializeProactiveEngagement(inactivityModal, exitIntentModal);

    // ===============================================================
    // --- SPA ROUTER & DYNAMIC CONTENT LOADER ---
    // ===============================================================
    async function loadPage(pageName, pushState = true) {
        if (!rightPane) return;

        try {
            const response = await fetch(`pages/${pageName}.html`);
            if (!response.ok) throw new Error("Page not found");
            const content = await response.text();

            rightPane.classList.add('fade-out');

            setTimeout(() => {
                rightPane.innerHTML = content;
                rightPane.scrollTop = 0;
                
                reinitializeContentScripts();

                rightPane.classList.remove('fade-out');

                if (pushState) {
                    const newUrl = pageName === 'home' ? window.location.pathname : `#${pageName}`;
                    history.pushState({ page: pageName }, '', newUrl);
                }
            }, 400);

        } catch (error) {
            console.error("Error loading page:", error);
            rightPane.innerHTML = `<h2>Error: Page not found</h2>`;
        }
    }

    // --- NAVIGATION HANDLING ---
    function handleNavigation(e) {
        const target = e.target.closest('.nav-link');
        if (target) {
            e.preventDefault();
            const pageName = target.dataset.page;
            if (pageName) {
                loadPage(pageName);
                document.getElementById('menu-toggle-btn')?.classList.remove('active');
                document.getElementById('main-nav')?.classList.remove('active');
            }
        }
    }
    document.body.addEventListener('click', handleNavigation);

    // --- BROWSER BACK/FORWARD BUTTON HANDLING ---
    window.addEventListener('popstate', (e) => {
        const page = (e.state && e.state.page) ? e.state.page : 'home';
        loadPage(page, false);
    });

    // --- INITIAL PAGE LOAD ---
    const initialPage = window.location.hash.substring(1) || 'home';
    loadPage(initialPage, false);

    // ===============================================================
    // --- SCRIPT RE-INITIALIZATION FUNCTION ---
    // ===============================================================
    function reinitializeContentScripts() {
        initializeScrollAnimations();
        initializeFooterAnimation();
        initializeCreativeCards(creativeModal);
        initializeExperienceSlider();
        initializeTestimonialsToggle();
    }

    // ===============================================================
    // --- All original JavaScript modules, now modularized ---
    // ===============================================================

    function initializeMatrixBackground() {
        const canvas = document.getElementById('matrix-background');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const keywords = ['SEO', 'WORDPRESS', 'WEBSITE', 'AI', 'REPORTS', 'ANALYTICS', 'MARKETING', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'TIKTOK', 'SHOPIFY', 'WIX', 'PROJECT MANAGEMENT', 'AUTOMATION', 'ECOMMERCE', 'GOOGLE ADS', 'META ADS', 'CONTENT', 'STRATEGY', 'QA TESTING', 'CRM', 'ZAPIER', 'OPERATIONS', 'EFFICIENCY', 'DATA'];
        const alphabet = [...new Set(keywords.join('').replace(/\s/g, ''))].join('') + '0123456789';
        const fontSize = 16;
        let columns, rainDrops, animationInterval;
        const setupCanvas = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; columns = Math.floor(window.innerWidth / fontSize); rainDrops = Array(columns).fill(1).map(() => Math.floor(Math.random() * canvas.height/fontSize)); };
        const draw = () => { ctx.fillStyle = 'rgba(10, 10, 10, 0.05)'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#FFD700'; ctx.font = fontSize + 'px monospace'; rainDrops.forEach((y, i) => { const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length)); ctx.fillText(text, i * fontSize, y * fontSize); if (y * fontSize > canvas.height && Math.random() > 0.975) rainDrops[i] = 0; rainDrops[i]++; }); };
        const startAnimation = () => { if(animationInterval) clearInterval(animationInterval); animationInterval = setInterval(draw, 80); }
        document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(animationInterval) : startAnimation());
        window.addEventListener('resize', () => { setupCanvas(); startAnimation(); });
        setupCanvas();
        startAnimation();
    }

    function createModalController(modalElement) {
        if (!modalElement) return { open: () => {}, close: () => {} };
        const modalCloseBtn = modalElement.querySelector('.modal-close');
        let previouslyFocusedElement;
        function trapFocus(e, focusableElements) { const first = focusableElements[0], last = focusableElements[focusableElements.length - 1]; if (e.key === 'Tab') { if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } } else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } } } }
        function open() { previouslyFocusedElement = document.activeElement; modalElement.classList.add('active'); document.body.style.overflow = 'hidden'; const focusable = modalElement.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'); if (focusable.length > 0) { focusable[0].focus(); modalElement.addEventListener('keydown', (e) => trapFocus(e, focusable)); } }
        function close() { if (document.querySelector('.fancybox__container')) { Fancybox.close(); return; } modalElement.classList.remove('active'); document.body.style.overflow = ''; modalElement.removeEventListener('keydown', trapFocus); if (previouslyFocusedElement) previouslyFocusedElement.focus(); }
        if(modalCloseBtn) modalCloseBtn.addEventListener('click', close);
        modalElement.addEventListener('click', (e) => { if (e.target === modalElement && !document.querySelector('.fancybox__container')) close(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modalElement.classList.contains('active')) close(); });
        return { open, close };
    }
    
    function initializePermanentAudio() {
        const playPauseBtn = document.getElementById('play-pause-btn');
        const introAudio = document.getElementById('introAudio');
        const headshotImage = document.getElementById('headshot-img');
        const headshotContainer = headshotImage ? headshotImage.parentElement : null;
        const audioPromptBubble = document.getElementById('audio-prompt-bubble');
        let hasPlayedOnce = false;
        function togglePlayPause() { if (introAudio && introAudio.paused) introAudio.play(); else if (introAudio) introAudio.pause(); }
        function updateUI() { if (!introAudio || !playPauseBtn) return; const isPlaying = !introAudio.paused; playPauseBtn.querySelector('.icon-play').style.display = isPlaying ? 'none' : 'block'; playPauseBtn.querySelector('.icon-pause').style.display = isPlaying ? 'block' : 'none'; playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pause Introduction' : 'Play Introduction'); if (headshotImage) headshotImage.classList.toggle('is-talking', isPlaying); if (isPlaying && !hasPlayedOnce && audioPromptBubble) { audioPromptBubble.classList.add('hidden'); hasPlayedOnce = true; } }
        if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlayPause);
        if (headshotContainer) headshotContainer.addEventListener('click', togglePlayPause);
        if (introAudio) { introAudio.addEventListener('play', updateUI); introAudio.addEventListener('pause', updateUI); introAudio.addEventListener('ended', updateUI); }
        if (audioPromptBubble) { setTimeout(() => { if (!hasPlayedOnce) audioPromptBubble.classList.add('hidden'); }, 5000); }
        updateUI();
    }

    function initializeProactiveEngagement(inactivityModal, exitIntentModal) {
        let inactivityTimer;
        function resetInactivityTimer() { clearTimeout(inactivityTimer); inactivityTimer = setTimeout(() => { if (!document.querySelector('.modal.active')) inactivityModal.open(); }, 120000); }
        document.addEventListener('visibilitychange', () => document.hidden ? clearTimeout(inactivityTimer) : resetInactivityTimer());
        ['mousemove', 'keypress', 'click', 'scroll'].forEach(evt => document.addEventListener(evt, resetInactivityTimer, false));
        resetInactivityTimer();
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (!isTouchDevice) { document.documentElement.addEventListener('mouseleave', (e) => { if (e.clientY < 0 && !document.querySelector('.modal.active')) { exitIntentModal.open(); } }); }
    }

    function initializeScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        const scrollObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); }); }, { threshold: 0.1 });
        animatedElements.forEach(el => scrollObserver.observe(el));
        document.querySelectorAll('#introduction > .animate-on-scroll').forEach(el => el.classList.add('is-visible'));
    }

    function initializeFooterAnimation() {
        let headerAnimationInterval;
        function startHeaderAnimation() { const headerContainer = document.getElementById('animated-header-container'); if (!headerContainer || headerAnimationInterval) return; const headers = headerContainer.querySelectorAll('h2'); if (headers.length === 0) return; let currentIndex = 0; headers[currentIndex].classList.add('text-in'); headerAnimationInterval = setInterval(() => { headers[currentIndex].classList.remove('text-in'); headers[currentIndex].classList.add('text-out'); currentIndex = (currentIndex + 1) % headers.length; headers[currentIndex].classList.remove('text-out'); headers[currentIndex].classList.add('text-in'); }, 4000); }
        const footerObserver = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) startHeaderAnimation(); }, { threshold: 0.5 });
        const footerEl = document.getElementById('contact');
        if (footerEl) footerObserver.observe(footerEl);
    }

    function initializeCreativeCards(creativeModal) {
        let currentModalInstance;
        document.querySelectorAll('.creative-card').forEach(card => card.addEventListener('click', () => {
            const modalTitle = card.dataset.modalTitle, modalContentStr = card.dataset.modalContent;
            const modalTitleEl = document.querySelector('#creativeModal .modal-title'), modalBodyEl = document.querySelector('#creativeModal .modal-body');
            try { const content = JSON.parse(modalContentStr); modalTitleEl.textContent = modalTitle; modalBodyEl.innerHTML = ''; if (content.type === 'gallery-lightbox' && typeof Fancybox !== 'undefined') { const galleryEl = document.createElement('div'); galleryEl.className = 'lightbox-gallery'; content.items.forEach(item => { galleryEl.innerHTML += `<a href="${item.full}" data-fancybox="gallery" data-caption="${item.caption||''}"><img src="${item.thumb}" alt="${item.caption||''}"></a>`; }); modalBodyEl.appendChild(galleryEl); Fancybox.bind('[data-fancybox="gallery"]', { hideScrollbar: false }); } else if (content.type === 'gallery-masonry' && typeof Masonry !== 'undefined') { const grid = document.createElement('div'); grid.className = 'masonry-grid'; content.items.forEach(item => { const itemEl = document.createElement('div'); itemEl.className = 'masonry-item'; itemEl.innerHTML = item.type === 'image' ? `<img src="${item.src}">` : `<video controls muted loop playsinline src="${item.src}"></video>`; grid.appendChild(itemEl); }); modalBodyEl.appendChild(grid); imagesLoaded(grid, () => { grid.style.visibility = 'visible'; currentModalInstance = new Masonry(grid, { itemSelector: '.masonry-item', percentPosition: true }); }); } else if (content.type === 'blog') { const layout = document.createElement('div'); layout.className = 'blog-modal-layout'; let archiveHTML = content.archive && content.archive.length > 0 ? `<div class="blog-archive"><h4>Older Posts</h4><ul>${content.archive.map(post => `<li><a href="#">${post.title}</a></li>`).join('')}</ul></div>` : ''; layout.innerHTML = `<div class="blog-main-content"><img src="${content.featured.img}" alt="${content.featured.title}"><h2>${content.featured.title}</h2>${content.featured.content}</div>${archiveHTML}`; modalBodyEl.appendChild(layout); } else if (content.type === 'carousel' && typeof Swiper !== 'undefined') { const carouselContainer = document.createElement('div'); carouselContainer.className = 'swiper'; carouselContainer.innerHTML = `<div class="swiper-wrapper">${content.items.map(item => `<div class="swiper-slide"><img src="${item.img}" alt="${item.caption||''}"></div>`).join('')}</div><div class="swiper-pagination"></div><div class="swiper-button-prev"></div><div class="swiper-button-next"></div>`; modalBodyEl.appendChild(carouselContainer); currentModalInstance = new Swiper(carouselContainer, { loop: true, pagination: { el: '.swiper-pagination', clickable: true }, navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }, }); } creativeModal.open(); } catch (e) { console.error("Could not parse modal content:", e); }
        }));
    }

    function initializeExperienceSlider() {
        const slideshowContainer = document.querySelector('.slideshow');
        if (!slideshowContainer) return;
        slideshowContainer.innerHTML = ''; // Clear previous slides
        const experiencesData = [ { header: 'Digital Solutions Specialist', subheader: 'AJD Digital Solutions', duration: 'November 2023 – Present', website: null, description: 'Providing comprehensive digital expertise...', tags: ['WordPress', 'SEO'], image: 'https://images.unsplash.com/photo-1517694712202-1428bc64a259' }, { header: 'WordPress & SEO Specialist', subheader: 'The Handyman Services, WA', duration: 'December 2023 – Present', website: 'https://thehandymansystem.com/', description: 'Driving client acquisition and market visibility...', tags: ['WordPress', 'SEO'], image: 'https://images.unsplash.com/photo-1560472354-b333cb9352e7' }, /* ... and so on for all your experiencesData ... */ ];
        experiencesData.forEach(job => { const slide = document.createElement('div'); slide.className = 'slide'; let tagsHTML = job.tags.map(tag => `<span>${tag}</span>`).join(''); let websiteLink = job.website ? `<a href="${job.website}" target="_blank" rel="noopener noreferrer">${job.subheader}</a>` : job.subheader; slide.innerHTML = `<img src="${job.image}?w=700&q=80" alt="${job.header}" loading="lazy"><h3>${job.header}</h3><p class="meta"><span>${websiteLink}</span> | <span>${job.duration}</span></p><p>${job.description}</p><div class="tags">${tagsHTML}</div>`; slideshowContainer.appendChild(slide); });
        let currentIndex = 0;
        const totalSlides = experiencesData.length;
        const prevButton = document.getElementById('prev-slide');
        const nextButton = document.getElementById('next-slide');