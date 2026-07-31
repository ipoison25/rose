document.addEventListener('DOMContentLoaded', () => {

    const triggerOverlay = document.getElementById('triggerOverlay');
    const startButton = document.getElementById('startButton');
    const loadingBar = document.getElementById('loadingBar');
    const statusText = document.getElementById('statusText');
    const ambientLight = document.getElementById('ambientLight');
    const roseWrapper = document.getElementById('roseWrapper');
    const roseHead = document.getElementById('roseHead');
    const calyx = document.getElementById('calyx');
    const stem = document.getElementById('stem');
    const leafLeft = document.getElementById('leafLeft');
    const leafRight = document.getElementById('leafRight');
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
        return Math.max(1, (total - LYRICS_INTRO_DELAY) / LYRICS.length);
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

    const PETAL_LAYERS = [
        { count: 11, w: 24, h: 86, delayBase: 0, angleOffset: 16, scaleFinal: 0.82, cls: 'petal-inner' },
        { count: 12, w: 30, h: 122, delayBase: 0.2, angleOffset: 0, scaleFinal: 1, cls: 'petal-blush' },
    ];

    const SEPALS_COUNT = 5;

    const FALLING_PETAL_COLORS = [
        ['#ffcb1f', '#a3690a'],
        ['#ffd83d', '#95530a'],
        ['#f5bc0a', '#875600'],
        ['#ffe066', '#b3740f'],
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


    function createSepals() {
        const step = 360 / SEPALS_COUNT;
        for (let i = 0; i < SEPALS_COUNT; i++) {
            const sepal = document.createElement('div');
            sepal.className = 'sepal';
            const angle = i * step + (Math.random() - 0.5) * 5;
            const delay = 0.15 + i * 0.04;

            sepal.style.setProperty('--sepal-angle', `${angle}deg`);
            sepal.style.setProperty('--sepal-delay', `${delay}s`);
            calyx.appendChild(sepal);
        }
    }

    function createPetals() {
        PETAL_LAYERS.forEach((layer) => {
            const angleStep = 360 / layer.count;

            for (let i = 0; i < layer.count; i++) {
                const petal = document.createElement('div');
                petal.className = `petal ${layer.cls}`;

                const angle = layer.angleOffset + i * angleStep + (Math.random() - 0.5) * 3;
                const delay = layer.delayBase + i * 0.035;
                const scaleJitter = layer.scaleFinal + (Math.random() - 0.5) * 0.08;
                const bloomDur = 0.7 + Math.random() * 0.3;

                petal.style.width = `${layer.w}px`;
                petal.style.height = `${layer.h}px`;
                petal.style.setProperty('--angle', `${angle}deg`);
                petal.style.setProperty('--scale', scaleJitter);
                petal.style.setProperty('--delay', `${delay}s`);
                petal.style.setProperty('--bloom-dur', `${bloomDur}s`);

                roseHead.appendChild(petal);
            }
        });
    }

    function growStem() {
        return new Promise(resolve => {
            stem.classList.add('grow');

            setTimeout(() => {
                leafLeft.classList.add('visible');
            }, 800);

            setTimeout(() => {
                leafRight.classList.add('visible');
            }, 1100);

            setTimeout(resolve, 2200);
        });
    }

    function bloom() {
        calyx.classList.add('visible');
        ambientLight.classList.add('visible');
        roseHead.classList.add('blooming');
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
        }, 4600);
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
    createSepals();
    createPetals();

    setTimeout(() => {
        startCardLoader();
    }, 100);

});
