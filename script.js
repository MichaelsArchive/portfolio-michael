document.addEventListener('DOMContentLoaded', () => {

    // 1. Homepage titel hover
    setupHeroWordHover();

    // 2. Video crossfade
    setupSeamlessVideoLoop();

    // 3. Glow Cursor
    setupExpressiveCursor();

    // 4. Portfolio hover preview
    setupPortfolioHoverPreview();

    // 5. Dynamische logokleur
    setupDynamicLogoAdaptation();

    // 6. Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            if (!targetId || targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 7. Actieve navigatie
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (sections.length > 0) {
        window.addEventListener('scroll', () => {
            let current = '';

            sections.forEach(section => {
                if (window.scrollY >= section.offsetTop - window.innerHeight / 3) {
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

    // 8. Achtergrond blobs bewegen mee met de muis
    const blobs = document.querySelectorAll('.blob');

    const isTouchDevice =
        window.matchMedia('(pointer: coarse)').matches ||
        'ontouchstart' in window;

    if (!isTouchDevice) {
        document.addEventListener('mousemove', (e) => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                return;
            }

            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;

            blobs.forEach((blob, index) => {
                const speed = (index + 1) * 15;
                const xOffset = (x - 0.5) * speed;
                const yOffset = (y - 0.5) * speed;

                blob.style.transform =
                    `translate(${xOffset}px, ${yOffset}px)`;
            });
        }, { passive: true });
    }

    // 9. Pagina geladen
    document.body.classList.add('page-loaded');
});


// ==================================================
// SEAMLESS VIDEO CROSSFADE LOOP
// ==================================================

function setupSeamlessVideoLoop() {
    const videoA = document.getElementById('bgVideo1');
    const videoB = document.getElementById('bgVideo2');

    if (!videoA || !videoB) return;

    const FADE_DURATION = 1400;
    const FADE_START_BEFORE_END = 1.5;
    const VIDEO_OPACITY = '1';

    let activeVideo = videoA;
    let nextVideo = videoB;
    let isFading = false;
    let fadeStartedForCurrentRun = false;

    [videoA, videoB].forEach(video => {
        video.muted = true;
        video.loop = false;
        video.preload = 'auto';
        video.playsInline = true;
        video.setAttribute('playsinline', '');

        video.style.transition =
            `opacity ${FADE_DURATION}ms linear`;

        video.style.opacity = '0';
    });

    videoA.style.opacity = VIDEO_OPACITY;

    videoA.play().catch(() => {});

    function beginCrossfade() {
        if (
            isFading ||
            !activeVideo.duration ||
            !Number.isFinite(activeVideo.duration)
        ) {
            return;
        }

        isFading = true;
        fadeStartedForCurrentRun = true;

        try {
            nextVideo.pause();
            nextVideo.currentTime = 0;
        } catch (error) {
            isFading = false;
            fadeStartedForCurrentRun = false;
            return;
        }

        const startNextVideo = () => {
            nextVideo.removeEventListener('seeked', startNextVideo);

            nextVideo.play().then(() => {

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        nextVideo.style.opacity = VIDEO_OPACITY;
                        activeVideo.style.opacity = '0';
                    });
                });

                let finished = false;

                function finishCrossfade() {
                    if (finished) return;
                    finished = true;

                    activeVideo.pause();
                    activeVideo.style.opacity = '0';

                    const previousVideo = activeVideo;

                    activeVideo = nextVideo;
                    nextVideo = previousVideo;

                    try {
                        nextVideo.currentTime = 0;
                    } catch (error) {}

                    nextVideo.style.opacity = '0';

                    isFading = false;
                    fadeStartedForCurrentRun = false;
                }

                window.setTimeout(
                    finishCrossfade,
                    FADE_DURATION + 100
                );

            }).catch(() => {
                isFading = false;
                fadeStartedForCurrentRun = false;
            });
        };

        if (nextVideo.seeking) {
            nextVideo.addEventListener(
                'seeked',
                startNextVideo,
                { once: true }
            );
        } else {
            startNextVideo();
        }
    }

    function checkLoop() {
        if (
            isFading ||
            fadeStartedForCurrentRun ||
            !activeVideo.duration ||
            !Number.isFinite(activeVideo.duration)
        ) {
            return;
        }

        const timeRemaining =
            activeVideo.duration - activeVideo.currentTime;

        if (timeRemaining <= FADE_START_BEFORE_END) {
            beginCrossfade();
        }
    }

    videoA.addEventListener('timeupdate', checkLoop);
    videoB.addEventListener('timeupdate', checkLoop);

    window.setInterval(checkLoop, 100);
}


// ==================================================
// HOMEPAGE TITEL WOORDEN
// ==================================================

function setupHeroWordHover() {
    const heading = document.querySelector('.hero-tile h1');

    if (!heading || heading.querySelector('.hero-word')) return;

    const text = heading.textContent.trim();

    if (!text) return;

    heading.innerHTML = text.split(/(\s+)/).map(part => {
        if (/^\s+$/.test(part)) return part;

        const safeWord = part.replace(/"/g, '&quot;');

        return `<span class="hero-word" data-word="${safeWord}">${part}</span>`;
    }).join('');
}


// ==================================================
// GLOW CURSOR
// ==================================================

function setupExpressiveCursor() {
    const cursorFollower = document.getElementById('cursorFollower');

    const isTouchDevice =
        window.matchMedia('(pointer: coarse)').matches ||
        'ontouchstart' in window;

    if (
        !cursorFollower ||
        isTouchDevice ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
        return;
    }

    const canvas = document.createElement('canvas');

    canvas.className = 'glow-cursor-canvas';
    canvas.setAttribute('aria-hidden', 'true');

    Object.assign(canvas.style, {
        position: 'fixed',
        inset: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: '9998'
    });

    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    if (!ctx) {
        canvas.remove();
        return;
    }

    let width = 0;
    let height = 0;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let currentX = mouseX;
    let currentY = mouseY;

    let lastX = mouseX;
    let lastY = mouseY;

    let active = false;
    let particles = [];
    let frame = 0;

    function resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        width = window.innerWidth;
        height = window.innerHeight;

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resizeCanvas();

    window.addEventListener('resize', resizeCanvas, {
        passive: true
    });

    document.addEventListener('mousemove', event => {
        mouseX = event.clientX;
        mouseY = event.clientY;

        active = true;

        cursorFollower.classList.add('active');

        const dx = mouseX - lastX;
        const dy = mouseY - lastY;

        const distance = Math.hypot(dx, dy);

        const count = Math.min(4, Math.ceil(distance / 18));

        for (let i = 0; i < count; i++) {
            const progress = (i + 1) / Math.max(count, 1);

            particles.push({
                x: lastX + dx * progress,
                y: lastY + dy * progress,
                radius: 12 + Math.random() * 20,
                life: 1,
                decay: 0.018 + Math.random() * 0.018,
                driftX: (Math.random() - 0.5) * 0.8,
                driftY: (Math.random() - 0.5) * 0.8
            });
        }

        if (particles.length > 180) {
            particles.splice(0, particles.length - 180);
        }

        lastX = mouseX;
        lastY = mouseY;

    }, { passive: true });

    document.addEventListener('mouseleave', () => {
        active = false;
        cursorFollower.classList.remove('active');
    });

    document.addEventListener('mouseenter', () => {
        lastX = mouseX;
        lastY = mouseY;
    });

    function animateCursor() {
        frame++;

        currentX += (mouseX - currentX) * 0.18;
        currentY += (mouseY - currentY) * 0.18;

        cursorFollower.style.transform =
            `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;

        ctx.clearRect(0, 0, width, height);

        particles = particles.filter(
            particle => particle.life > 0.025
        );

        for (const particle of particles) {
            particle.x += particle.driftX;
            particle.y += particle.driftY;
            particle.life -= particle.decay;

            const radius =
                particle.radius * (0.45 + particle.life * 0.7);

            const gradient = ctx.createRadialGradient(
                particle.x,
                particle.y,
                0,
                particle.x,
                particle.y,
                radius
            );

            gradient.addColorStop(
                0,
                `rgba(129, 191, 218, ${0.22 * particle.life})`
            );

            gradient.addColorStop(
                0.42,
                `rgba(177, 240, 247, ${0.12 * particle.life})`
            );

            gradient.addColorStop(
                1,
                'rgba(177, 240, 247, 0)'
            );

            ctx.fillStyle = gradient;

            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                radius,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }

        if (active) {
            const pulse =
                0.92 + Math.sin(frame * 0.045) * 0.08;

            cursorFollower.style.setProperty(
                '--cursor-pulse',
                pulse.toFixed(3)
            );
        }

        requestAnimationFrame(animateCursor);
    }

    animateCursor();
}


// ==================================================
// PORTFOLIO HOVER PREVIEW
// ==================================================

function setupPortfolioHoverPreview() {
    const projectCards = document.querySelectorAll('.project-card');
    const bgPreview = document.getElementById('bgPreview');

    if (!bgPreview) return;

    projectCards.forEach(card => {

        card.addEventListener('mouseenter', () => {
            const previewUrl = card.getAttribute('data-preview');

            document.body.classList.add('is-hovering-project');

            // MELTDOWN (third project)
            bgPreview.classList.toggle(
                'meltdown-preview',
                card === projectCards[2]
            );

            if (!previewUrl) return;

            if (previewUrl.endsWith('.pdf')) {

                bgPreview.innerHTML = `
                    <div class="poster-pdf-wrapper"
                         style="width:100%;height:100%;">
                        <object
                            data="${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit"
                            type="application/pdf"
                            class="project-poster-pdf">
                        </object>
                    </div>
                `;

                bgPreview.style.backgroundImage = 'none';

            } else {

                if (card === projectCards[4]) {

                    // SCENT ORCHESTRA:
                    // Schermvullende achtergrond met een zachte,
                    // vervaagde versie van de afbeelding.
                    // De volledige originele afbeelding blijft
                    // scherp en gecentreerd zichtbaar.

                    bgPreview.innerHTML =
                        '<img class="scent-hover-image" alt="">';

                    bgPreview.querySelector(
                        '.scent-hover-image'
                    ).src = previewUrl;

                    bgPreview.style.setProperty(
                        '--scent-hover-image',
                        `url("${previewUrl}")`
                    );

                    bgPreview.style.backgroundImage = 'none';
                    bgPreview.style.backgroundSize = '';
                    bgPreview.style.backgroundPosition = '';
                    bgPreview.style.backgroundRepeat = '';

                    bgPreview.classList.add('scent-preview');

                } else {

                    bgPreview.innerHTML = '';

                    bgPreview.classList.remove('scent-preview');

                    bgPreview.style.removeProperty(
                        '--scent-hover-image'
                    );

                    const img = new Image();
                    img.src = previewUrl;

                    img.onload = () => {
                        bgPreview.style.backgroundImage =
                            `url("${previewUrl}")`;
                    };

                    bgPreview.style.backgroundImage =
                        `url("${previewUrl}")`;

                    bgPreview.style.backgroundSize = '';
                    bgPreview.style.backgroundPosition = '';
                    bgPreview.style.backgroundRepeat = '';
                }
            }

            bgPreview.classList.add('active');
        });

        card.addEventListener('mouseleave', () => {
            document.body.classList.remove('is-hovering-project');

            bgPreview.classList.remove(
                'active',
                'meltdown-preview',
                'scent-preview'
            );

            bgPreview.style.removeProperty(
                '--scent-hover-image'
            );
        });

    });
}


// ==================================================
// DYNAMISCHE LOGOKLEUR
// ==================================================

function setupDynamicLogoAdaptation() {
    const navLogo = document.getElementById('navLogo');

    const sections = document.querySelectorAll(
        'section[data-nav-theme]'
    );

    if (!navLogo || sections.length === 0) return;

    const observer = new IntersectionObserver(entries => {

        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const theme =
                entry.target.getAttribute('data-nav-theme');

            if (theme === 'dark') {
                navLogo.classList.add('dark-bg');
                navLogo.classList.remove('light-bg');
            } else {
                navLogo.classList.add('light-bg');
                navLogo.classList.remove('dark-bg');
            }
        });

    }, {
        threshold: 0.3
    });

    sections.forEach(section => observer.observe(section));
}