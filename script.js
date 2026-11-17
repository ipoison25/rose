document.addEventListener('DOMContentLoaded', () => {

    const triggerOverlay = document.getElementById('triggerOverlay');
    const startButton = document.getElementById('startButton');
    const loadingBar = document.getElementById('loadingBar');
    const statusText = document.getElementById('statusText');
    const ambientLight = document.getElementById('ambientLight');
    const roseWrapper = document.getElementById('roseWrapper');
    const endText = document.getElementById('endText');
    const lyricsPanel = document.getElementById('lyricsPanel');
    const lyricsPrevEl = document.getElementById('lyricsPrev');
    const lyricsCurrentEl = document.getElementById('lyricsCurrent');
    const lyricsNextEl = document.getElementById('lyricsNext');
    const fallingPetalsEl = document.getElementById('fallingPetals');
    const scene = document.querySelector('.scene');
    const bgMusic = document.getElementById('bgMusic');
    bgMusic.volume = 0.35;

    // ما قدرت أسمع الملف الصوتي فعليًا، فهذا تقدير: ثواني السكوت قبل ما يبدأ الغناء.
    // لو الكلمات طلعت مو متزامنة، غيّر هذا الرقم فقط وجرّب من جديد.
    const LYRICS_INTRO_DELAY = 2;

    const LYRICS = [
        'I see the crystal raindrops fall',
        'And the beauty of it all',
        'Is when the sun comes shining through',
        'To make those rainbows in my mind',
        'When I think of you sometime',
        'And I wanna spend some time with you',
        'Just the two of us',
        'We can make it if we try',
        'Just the two of us',
        '(Just the two of us)',
        'Just the two of us',
        'Building castles in the sky',
        'Just the two of us',
        'You and I',
        'We look for love, no time for tears',
        "Wasted water's all that is",
        "And it don't make no flowers grow",
        'Good things might come to those who wait',
        'Not for those who wait too late',
        'We gotta go for all we know',
        'Just the two of us',
        'We can make it if we try',
        'Just the two of us',
        '(Just the two of us)',
        'Just the two of us',
        'Building them castles in the sky',
        'Just the two of us',
        'You and I',
        'I hear the crystal raindrops fall',
        'On the window down the hall',
        'And it becomes the morning dew',
        'And darling when the morning comes',
        'And I see the morning sun',
        'I wanna be the one with you',
        'Just the two of us',
        'We can make it if we try',
        'Just the two of us',
        '(Just the two of us)',
        'Just the two of us',
        'Building big castles way on high',
        'Just the two of us',
        'You and I',
        'just the two of us',
        '(We can make it, just the two of us)',
        "Let's get it together baby (yeah)",
        '(Just the two of us)',
        'Just the two of us',
        '(We can make it, just the two of us)',
        '(Just the two of us)',
        '(We can make it, just the two of us)',
        '(Just the two of us)',
        '(We can make it, just the two of us)',
        '(Just the two of us)',
        '(We can make it, just the two of us)',
        '(Just the two of us)',
    ];

    let lastLyricsIndex = -1;

    function getLyricsLineDuration() {
        const total = bgMusic.duration && isFinite(bgMusic.duration) ? bgMusic.duration : 240;
        return Math.max(1, (total - LYRICS_INTRO_DELAY) / LYRICS.length) * 1.1;
    }

    function updateLyrics() {
        const elapsed = bgMusic.currentTime - LYRICS_INTRO_DELAY;
        if (elapsed < 0) {
            if (lastLyricsIndex !== -1) {
                lastLyricsIndex = -1;
                lyricsPrevEl.textContent = '';
                lyricsCurrentEl.textContent = '';
                lyricsNextEl.textContent = LYRICS[0];
            }
            return;
        }

        const lineDur = getLyricsLineDuration();
        const index = Math.min(LYRICS.length - 1, Math.floor(elapsed / lineDur));

        if (index === lastLyricsIndex) return;
        lastLyricsIndex = index;

        lyricsPrevEl.textContent = LYRICS[index - 1] || '';
        lyricsCurrentEl.textContent = LYRICS[index] || '';
        lyricsNextEl.textContent = LYRICS[index + 1] || '';

        lyricsCurrentEl.classList.remove('pulse');
        void lyricsCurrentEl.offsetWidth;
        lyricsCurrentEl.classList.add('pulse');
    }

    bgMusic.addEventListener('timeupdate', updateLyrics);
    lyricsNextEl.textContent = LYRICS[0];

    // الباقة: كل وردة لها ساق مائل (lean) وطبقات بتلات خاصة فيها.
    // z = ترتيب الظهور (الأكبر قدّام).
    const FLOWERS = [
        {
            type: 'sunflower', lean: -8, stemH: 300, stemW: 8, z: 1,
            growDelay: 0, bloomDelay: 0, glow: 'rgba(255, 190, 40, 0.22)',
            leaves: [{ side: 'left', at: '52%' }, { side: 'right', at: '30%' }],
            layers: [
                { count: 12, w: 16, h: 50, angleOffset: 15, scale: 0.88, delayBase: 0, cls: 'sf-inner' },
                { count: 13, w: 20, h: 68, angleOffset: 0, scale: 1, delayBase: 0.2, cls: 'sf-outer' },
            ],
            center: 'sf-disc',
        },
        {
            type: 'lily', lean: -30, stemH: 245, stemW: 6, z: 2,
            growDelay: 0.3, bloomDelay: 0.35, glow: 'rgba(255, 150, 200, 0.2)',
            leaves: [{ side: 'left', at: '38%' }],
            layers: [
                { count: 3, w: 32, h: 74, angleOffset: 0, scale: 1, delayBase: 0, cls: 'lily-petal' },
                { count: 3, w: 28, h: 68, angleOffset: 60, scale: 1, delayBase: 0.15, cls: 'lily-petal lily-front' },
            ],
            center: 'lily-center',
            stamens: 6,
        },
        {
            type: 'peony', lean: 30, stemH: 240, stemW: 6, z: 3,
            growDelay: 0.45, bloomDelay: 0.6, glow: 'rgba(255, 140, 190, 0.22)',
            leaves: [{ side: 'right', at: '40%' }],
            layers: [
                { count: 9, w: 44, h: 50, angleOffset: 0, scale: 1, delayBase: 0, cls: 'peony-petal peony-outer' },
                { count: 8, w: 36, h: 40, angleOffset: 22, scale: 1, delayBase: 0.15, cls: 'peony-petal peony-mid' },
                { count: 7, w: 26, h: 28, angleOffset: 10, scale: 1, delayBase: 0.3, cls: 'peony-petal peony-inner' },
            ],
            center: 'peony-center',
        },
        {
            type: 'rose', lean: 11, stemH: 275, stemW: 7, z: 4,
            growDelay: 0.15, bloomDelay: 0.2, glow: 'rgba(255, 50, 70, 0.22)',
            leaves: [{ side: 'right', at: '46%' }],
            thorns: [{ side: 'l', at: '60%' }, { side: 'r', at: '36%' }],
            layers: [
                { count: 5, w: 50, h: 48, angleOffset: 0, scale: 1, delayBase: 0, cls: 'rose-petal rose-outer' },
                { count: 5, w: 40, h: 36, angleOffset: 36, scale: 1, delayBase: 0.2, cls: 'rose-petal rose-mid' },
                { count: 4, w: 30, h: 24, angleOffset: 20, scale: 1, delayBase: 0.4, cls: 'rose-petal rose-inner' },
            ],
            center: 'rose-bud',
        },
    ];

    const FALLING_PETAL_COLORS = [
        ['#e0283f', '#7a0619'],   // روز أحمر
        ['#ffc9de', '#e0608f'],   // بيوني
        ['#fff5f8', '#f08cb0'],   // ليليوم
        ['#ffcb1f', '#a3690a'],   // دوار الشمس
    ];

    let fallingPetalInterval = null;


    function startCardLoader() {
        const duration = 900;
        const steps = [
            { threshold: 20, text: 'جارٍ تحميل Love.css...' },
            { threshold: 50, text: 'تنمو البتلات الرقمية...' },
            { threshold: 80, text: 'إضافة ملمس مخملي...' },
            { threshold: 95, text: 'تحسين العرض ثلاثي الأبعاد...' },
            { threshold: 100, text: 'جاهزة للتفتح!' }
        ];

        let startTimestamp = null;

        function animateLoader(timestamp) {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const percent = Math.floor(progress * 100);

            loadingBar.style.width = `${percent}%`;
            const activeStep = steps.find(s => percent <= s.threshold) || steps[steps.length - 1];
            statusText.textContent = activeStep.text;

            if (progress < 1) {
                requestAnimationFrame(animateLoader);
            } else {
                startButton.removeAttribute('disabled');
            }
        }

        requestAnimationFrame(animateLoader);
    }


    function el(tag, className) {
        const node = document.createElement(tag);
        node.className = className;
        return node;
    }

    function makePetal(head, cls, { w, h, angle, scale, delay, bloomDur }) {
        const petal = el('div', `petal ${cls}`);
        if (w) petal.style.width = `${w}px`;
        if (h) petal.style.height = `${h}px`;
        petal.style.setProperty('--angle', `${angle}deg`);
        petal.style.setProperty('--scale', scale);
        petal.style.setProperty('--delay', `${delay}s`);
        petal.style.setProperty('--bloom-dur', `${bloomDur}s`);
        head.appendChild(petal);
    }

    function buildBouquet() {
        FLOWERS.forEach((cfg) => {
            const flower = el('div', `flower flower-${cfg.type}`);
            flower.style.setProperty('--lean', `${cfg.lean}deg`);
            flower.style.setProperty('--stem-h', `${cfg.stemH}px`);
            flower.style.setProperty('--stem-w', `${cfg.stemW}px`);
            flower.style.setProperty('--grow-delay', `${cfg.growDelay}s`);
            flower.style.zIndex = cfg.z;

            flower.appendChild(el('div', 'f-stem'));

            (cfg.thorns || []).forEach((t) => {
                const thorn = el('div', `thorn thorn-${t.side}`);
                thorn.style.bottom = t.at;
                flower.appendChild(thorn);
            });

            (cfg.leaves || []).forEach((l) => {
                const leaf = el('div', `leaf leaf-${l.side}`);
                leaf.style.bottom = l.at;
                leaf.appendChild(el('div', 'leaf-vein'));
                flower.appendChild(leaf);
            });

            const head = el('div', 'f-head');
            const glow = el('div', 'f-glow');
            glow.style.setProperty('--glow', cfg.glow);
            head.appendChild(glow);

            cfg.layers.forEach((layer) => {
                const step = 360 / layer.count;
                for (let i = 0; i < layer.count; i++) {
                    makePetal(head, layer.cls, {
                        w: layer.w,
                        h: layer.h,
                        angle: layer.angleOffset + i * step + (Math.random() - 0.5) * 4,
                        scale: layer.scale + (Math.random() - 0.5) * 0.08,
                        delay: layer.delayBase + i * 0.035,
                        bloomDur: 0.7 + Math.random() * 0.3,
                    });
                }
            });

            head.appendChild(el('div', `f-center ${cfg.center}`));

            for (let i = 0; i < (cfg.stamens || 0); i++) {
                makePetal(head, 'stamen', {
                    angle: 30 + i * 60 + (Math.random() - 0.5) * 16,
                    scale: 0.9 + Math.random() * 0.2,
                    delay: 0.45 + i * 0.04,
                    bloomDur: 0.8,
                });
            }

            flower.appendChild(head);
            roseWrapper.appendChild(flower);
            cfg.flowerEl = flower;
            cfg.headEl = head;
        });
    }

    function growStem() {
        return new Promise(resolve => {
            roseWrapper.classList.add('tied');
            FLOWERS.forEach((cfg) => cfg.flowerEl.classList.add('grown'));
            const maxDelay = Math.max(...FLOWERS.map((f) => f.growDelay));
            setTimeout(resolve, 2000 + maxDelay * 1000);
        });
    }

    function bloom() {
        ambientLight.classList.add('visible');
        FLOWERS.forEach((cfg) => {
            setTimeout(() => cfg.headEl.classList.add('blooming'), cfg.bloomDelay * 1000);
        });
    }

    function spawnFallingPetal() {
        if (fallingPetalsEl.childElementCount > 10) return;

        const petal = document.createElement('div');
        petal.className = 'falling-petal';

        const w = 10 + Math.random() * 12;
        const h = w * (1.25 + Math.random() * 0.15);
        const x = 20 + Math.random() * 60;
        const y = 3 + Math.random() * 10;
        const dur = 5.5 + Math.random() * 3.5;
        const delay = Math.random() * 0.6;

        const colors = FALLING_PETAL_COLORS[Math.floor(Math.random() * FALLING_PETAL_COLORS.length)];

        const sign = () => (Math.random() > 0.5 ? 1 : -1);
        const s1 = sign() * (15 + Math.random() * 25);
        const s2 = sign() * (10 + Math.random() * 20);
        const s3 = sign() * (20 + Math.random() * 30);
        const s4 = sign() * (10 + Math.random() * 15);

        petal.style.left = `${x}vw`;
        petal.style.top = `${y}vh`;
        petal.style.setProperty('--fp-w', `${w}px`);
        petal.style.setProperty('--fp-h', `${h}px`);
        petal.style.setProperty('--fp-c1', colors[0]);
        petal.style.setProperty('--fp-c2', colors[1]);
        petal.style.setProperty('--f-dur', `${dur}s`);
        petal.style.setProperty('--f-delay', `${delay}s`);
        petal.style.setProperty('--s1', `${s1}px`);
        petal.style.setProperty('--s2', `${s2}px`);
        petal.style.setProperty('--s3', `${s3}px`);
        petal.style.setProperty('--s4', `${s4}px`);

        fallingPetalsEl.appendChild(petal);

        setTimeout(() => {
            if (petal.parentNode) petal.remove();
        }, (dur + delay) * 1000 + 300);
    }

    function startFallingPetals() {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => spawnFallingPetal(), i * 300);
        }

        fallingPetalInterval = setInterval(() => {
            spawnFallingPetal();
        }, 2200);
    }


    async function startAnimationSequence() {
        await growStem();
        await delay(100);
        bloom();

        setTimeout(() => {
            roseWrapper.classList.add('rotating');
        }, 2600);

        setTimeout(() => startFallingPetals(), 3400);

        setTimeout(() => {
            endText.classList.add('visible');
            lyricsPanel.classList.add('visible');
        }, 2000);
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    startButton.addEventListener('click', () => {
        triggerOverlay.classList.add('fade-out');
        bgMusic.play().catch(() => {});

        setTimeout(() => {
            startAnimationSequence();
        }, 800);
    });
    buildBouquet();

    setTimeout(() => {
        startCardLoader();
    }, 100);

});
