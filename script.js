document.addEventListener('DOMContentLoaded', () => {

    const triggerOverlay = document.getElementById('triggerOverlay');
    const startButton = document.getElementById('startButton');
    const loadingBar = document.getElementById('loadingBar');
    const statusText = document.getElementById('statusText');
    const ambientLight = document.getElementById('ambientLight');
    const endText = document.getElementById('endText');
    const lyricsPanel = document.getElementById('lyricsPanel');
    const lyricsPrevEl = document.getElementById('lyricsPrev');
    const lyricsCurrentEl = document.getElementById('lyricsCurrent');
    const lyricsNextEl = document.getElementById('lyricsNext');
    const bgMusic = document.getElementById('bgMusic');
    bgMusic.volume = 0.35;

    // ---------------------------------------------------------------
    // كلمات الأغنية
    // ---------------------------------------------------------------

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

    // ---------------------------------------------------------------
    // بطاقة التحميل
    // ---------------------------------------------------------------

    function startCardLoader() {
        const duration = 900;
        const steps = [
            { threshold: 20, text: 'جارٍ تحميل Love.css...' },
            { threshold: 50, text: 'تنمو البتلات الرقمية...' },
            { threshold: 80, text: 'لف الباقة وربط الشريطة...' },
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

    if (!window.THREE || !THREE.OrbitControls) {
        statusText.textContent = 'تحتاج اتصال بالإنترنت لتحميل الباقة ثلاثية الأبعاد';
        return;
    }

    // ---------------------------------------------------------------
    // الباقة ثلاثية الأبعاد
    // ---------------------------------------------------------------

    const bouquet3D = createBouquet3D(document.getElementById('bouquetCanvas'));

    async function startAnimationSequence() {
        bouquet3D.start();
        ambientLight.classList.add('visible');

        setTimeout(() => {
            endText.classList.add('visible');
            lyricsPanel.classList.add('visible');
        }, 2600);
    }

    startButton.addEventListener('click', () => {
        triggerOverlay.classList.add('fade-out');
        bgMusic.play().catch(() => {});
        setTimeout(startAnimationSequence, 500);
    });

    setTimeout(startCardLoader, 100);
});


function createBouquet3D(canvas) {
    const UP = new THREE.Vector3(0, 1, 0);
    const GOLDEN = 2.39996323;
    const rand = (a, b) => a + Math.random() * (b - a);
    const clamp01 = (x) => Math.min(1, Math.max(0, x));
    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
    const easeOutBack = (x) => {
        const c1 = 1.4, c3 = c1 + 1;
        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    };

    // ---------- المشهد ----------
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
    const target = new THREE.Vector3(0, 1.6, 0);
    const camDir = new THREE.Vector3(0, 0.3, 1).normalize();

    const controls = new THREE.OrbitControls(camera, canvas);
    controls.target.copy(target);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = 1.95;
    controls.autoRotateSpeed = 1.1;

    scene.add(new THREE.HemisphereLight(0xffe8f0, 0x2a1020, 0.75));
    const key = new THREE.DirectionalLight(0xfff1e0, 1.5);
    key.position.set(5, 10, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xff9ec0, 0.7);
    rim.position.set(-7, 4, -6);
    scene.add(rim);
    const fill = new THREE.PointLight(0xffd6a0, 0.6, 40);
    fill.position.set(0, 7, 7);
    scene.add(fill);

    function fitCamera() {
        const w = window.innerWidth, h = window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        const distV = (13 / 2) / t;
        const distH = (12 / 2) / (t * camera.aspect);
        const dist = Math.max(distV, distH) * 1.05;
        controls.minDistance = dist * 0.45;
        controls.maxDistance = dist * 1.6;
        const dir = camera.position.lengthSq() > 0
            ? camera.position.clone().sub(controls.target).normalize()
            : camDir;
        camera.position.copy(controls.target).addScaledVector(dir, dist);
        camera.updateProjectionMatrix();
    }

    // ---------- خامات مرسومة بالكانفس ----------
    function canvasTexture(w, h, draw) {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        draw(c.getContext('2d'), w, h);
        const tex = new THREE.CanvasTexture(c);
        tex.encoding = THREE.sRGBEncoding;
        tex.anisotropy = 4;
        return tex;
    }

    // canvas y=h هي قاعدة البتلة، y=0 هي طرفها
    function petalTexture(stops, opts = {}) {
        return canvasTexture(128, 256, (ctx, w, h) => {
            const g = ctx.createLinearGradient(0, h, 0, 0);
            stops.forEach(([o, c]) => g.addColorStop(o, c));
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);

            const e = ctx.createLinearGradient(0, 0, w, 0);
            e.addColorStop(0, 'rgba(0,0,0,0.22)');
            e.addColorStop(0.3, 'rgba(0,0,0,0)');
            e.addColorStop(0.7, 'rgba(0,0,0,0)');
            e.addColorStop(1, 'rgba(0,0,0,0.22)');
            ctx.fillStyle = e;
            ctx.fillRect(0, 0, w, h);

            if (opts.stripe) {
                const s = ctx.createLinearGradient(0, 0, w, 0);
                s.addColorStop(0.42, 'rgba(255,255,255,0)');
                s.addColorStop(0.5, opts.stripe);
                s.addColorStop(0.58, 'rgba(255,255,255,0)');
                ctx.fillStyle = s;
                ctx.fillRect(0, 0, w, h);
            }

            ctx.lineWidth = 1;
            for (let k = 0; k < 11; k++) {
                ctx.strokeStyle = `rgba(0,0,0,${opts.veins ?? 0.08})`;
                ctx.beginPath();
                ctx.moveTo(w / 2, h);
                ctx.quadraticCurveTo(w / 2, h * 0.5, w * (0.08 + 0.84 * k / 10), 0);
                ctx.stroke();
            }

            for (let n = 0; n < (opts.spots || 0); n++) {
                const x = w / 2 + (Math.random() - 0.5) * w * 0.55;
                const y = h * (0.5 + Math.random() * 0.42);
                ctx.fillStyle = opts.spotColor || 'rgba(120,10,55,0.85)';
                ctx.beginPath();
                ctx.ellipse(x, y, rand(1.4, 2.8), rand(2, 4), 0, 0, Math.PI * 2);
                ctx.fill();
            }

            if (opts.midrib) {
                ctx.strokeStyle = opts.midrib;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(w / 2, h);
                ctx.lineTo(w / 2, 0);
                ctx.stroke();
            }
        });
    }

    const seedTexture = canvasTexture(256, 256, (ctx, w, h) => {
        const g = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
        g.addColorStop(0, '#6b5a12');
        g.addColorStop(0.35, '#4a2a08');
        g.addColorStop(1, '#1e0f02');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        const N = 700;
        for (let i = 0; i < N; i++) {
            const r = Math.sqrt(i / N) * (w / 2 - 6);
            const a = i * GOLDEN;
            const x = w / 2 + r * Math.cos(a);
            const y = h / 2 + r * Math.sin(a);
            const s = 1.4 + 2.2 * (r / (w / 2));
            ctx.fillStyle = i % 3 === 0 ? '#2a1503' : '#5a3510';
            ctx.beginPath();
            ctx.arc(x, y, s, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,200,120,0.18)';
            ctx.beginPath();
            ctx.arc(x - s * 0.3, y - s * 0.3, s * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    function paperTexture(base, light, dark) {
        return canvasTexture(512, 64, (ctx, w, h) => {
            ctx.fillStyle = base;
            ctx.fillRect(0, 0, w, h);
            for (let k = 0; k < 22; k++) {
                const x = (k / 22) * w + rand(-6, 6);
                const gw = rand(10, 26);
                const g = ctx.createLinearGradient(x - gw, 0, x + gw, 0);
                g.addColorStop(0, 'rgba(0,0,0,0)');
                g.addColorStop(0.45, dark);
                g.addColorStop(0.55, light);
                g.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = g;
                ctx.fillRect(x - gw, 0, gw * 2, h);
            }
        });
    }

    const std = (opts) => new THREE.MeshStandardMaterial(Object.assign({
        side: THREE.DoubleSide, roughness: 0.6, metalness: 0,
    }, opts));

    const MAT = {
        rose: std({ map: petalTexture([[0, '#3d020c'], [0.35, '#8e0a20'], [0.75, '#c8162f'], [1, '#dc2a42']], { veins: 0.1 }), roughness: 0.5 }),
        peony: std({ map: petalTexture([[0, '#c2457a'], [0.3, '#f07aa8'], [0.7, '#ffb6d0'], [1, '#ffe4ee']], { veins: 0.06 }), roughness: 0.65 }),
        lily: std({ map: petalTexture([[0, '#9e1448'], [0.25, '#e0457f'], [0.55, '#f9a8c6'], [0.85, '#fff0f6'], [1, '#ffffff']], { veins: 0.05, spots: 70, stripe: 'rgba(255,255,255,0.55)' }), roughness: 0.45 }),
        sunflower: std({ map: petalTexture([[0, '#8a4e00'], [0.22, '#ee9e00'], [0.7, '#ffc81e'], [1, '#ffd84a']], { veins: 0.12 }) }),
        leaf: std({ map: petalTexture([[0, '#0e3d1a'], [0.5, '#1f6b33'], [1, '#2e8a45']], { veins: 0.12, midrib: 'rgba(170,230,160,0.35)' }), roughness: 0.55 }),
        stem: std({ color: 0x1f5e2c, roughness: 0.7 }),
        seeds: std({ map: seedTexture, roughness: 0.9, side: THREE.FrontSide }),
        diskSide: std({ color: 0x3a2206, roughness: 0.9, side: THREE.FrontSide }),
        diskBack: std({ color: 0x2c5a1e, roughness: 0.8, side: THREE.FrontSide }),
        filament: std({ color: 0xd9efb8, roughness: 0.5 }),
        anther: std({ color: 0xa8461a, roughness: 0.8 }),
        pistil: std({ color: 0x9cc96a, roughness: 0.5 }),
        paperOuter: std({ map: paperTexture('#e6b2ad', 'rgba(255,255,255,0.22)', 'rgba(90,30,40,0.25)'), roughness: 0.85 }),
        paperInner: std({ map: paperTexture('#fbeee6', 'rgba(255,255,255,0.35)', 'rgba(120,80,70,0.18)'), roughness: 0.9 }),
        ribbon: std({ color: 0xb3123a, roughness: 0.3, metalness: 0.15 }),
    };

    // ---------- شكل البتلة ----------
    // البتلة واقفة على محور Y، و+Z هو اتجاه مركز الوردة (للداخل).
    function petalGeometry(o) {
        const {
            length = 1, width = 0.5, shape = 'round', segU = 8, segV = 12,
            cup = 0.3, bend = 0, reflex = 0, ruffle = 0, ruffleFreq = 6, seed = 0,
        } = o;

        const pos = [], uv = [], idx = [];
        for (let j = 0; j <= segV; j++) {
            const v = j / segV;
            let w;
            if (shape === 'round') w = width * Math.pow(Math.sin(Math.PI * (0.1 + 0.9 * v)), 0.45) * (0.3 + 0.7 * v);
            else if (shape === 'pointed') w = width * Math.pow(Math.sin(Math.PI * v), 0.9) * (1 - 0.25 * v);
            else w = width * Math.pow(Math.sin(Math.PI * v), 0.6);

            for (let i = 0; i <= segU; i++) {
                const u = -1 + 2 * i / segU;
                const x = u * w;
                const y = v * length;
                const z = cup * u * u * w
                    + bend * v * v * length
                    - reflex * Math.pow(v, 3) * length
                    + ruffle * Math.sin(u * ruffleFreq + seed + v * 3) * v * v * width * 0.3;
                pos.push(x, y, z);
                uv.push((u + 1) / 2, v);
            }
        }
        for (let j = 0; j < segV; j++) {
            for (let i = 0; i < segU; i++) {
                const a = j * (segU + 1) + i, b = a + 1, c = a + segU + 1, d = c + 1;
                idx.push(a, c, b, b, c, d);
            }
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        g.setIndex(idx);
        g.computeVertexNormals();
        return g;
    }

    // كل وردة: head (محورها +Y) + قائمة حركات التفتح
    function addPetal(flower, mat, geoOpts, { angle, r = 0, y = 0, open, closed = 0.06, delay = 0, dur = 1.4 }) {
        const holder = new THREE.Group();
        holder.rotation.y = angle;
        const mesh = new THREE.Mesh(petalGeometry(geoOpts), mat);
        mesh.position.set(0, y, -r);
        holder.add(mesh);
        flower.head.add(holder);
        flower.anims.push({
            delay, dur, ease: easeOutBack,
            apply: (e) => {
                mesh.rotation.x = -(closed + (open - closed) * e);
                mesh.scale.setScalar(Math.max(0.001, 0.3 + 0.7 * e));
            },
        });
    }

    function addGrow(flower, obj, delay, dur, from = 0) {
        flower.anims.push({
            delay, dur, ease: easeOutBack,
            apply: (e) => obj.scale.setScalar(Math.max(0.001, from + (1 - from) * e)),
        });
    }

    function newFlower() {
        return { head: new THREE.Group(), anims: [], start: 0, done: false };
    }

    function buildRose(s) {
        const f = newFlower();
        const N = 24;
        for (let i = 0; i < N; i++) {
            const t = i / (N - 1);
            addPetal(f, MAT.rose, {
                shape: 'round', length: s * (0.42 + 0.72 * t), width: s * (0.62 + 0.55 * t),
                cup: 0.75 - 0.35 * t, bend: 0.55 * Math.pow(1 - t, 2), reflex: 0.35 * t * t,
            }, {
                angle: i * GOLDEN, r: s * 0.04 * t, open: 0.12 + 1.2 * Math.pow(t, 1.5) + rand(-0.05, 0.05),
                delay: (1 - t) * 0.7,
            });
        }
        return f;
    }

    function buildPeony(s) {
        const f = newFlower();
        const N = 48;
        for (let i = 0; i < N; i++) {
            const t = i / (N - 1);
            addPetal(f, MAT.peony, {
                shape: 'round', length: s * (0.38 + 0.62 * t), width: s * (0.7 + 0.5 * t),
                cup: 0.55, bend: 0.25 * (1 - t), reflex: 0.15 * t * t,
                ruffle: 0.6, ruffleFreq: 7, seed: rand(0, 6),
            }, {
                angle: i * GOLDEN, r: s * 0.06 * t, open: 0.2 + 1.15 * Math.pow(t, 1.3) + rand(-0.08, 0.08),
                delay: (1 - t) * 0.8, dur: 1.6,
            });
        }
        return f;
    }

    function buildLily(s) {
        const f = newFlower();
        for (let k = 0; k < 6; k++) {
            const inner = k % 2;
            addPetal(f, MAT.lily, {
                shape: 'pointed', length: s * (1.45 - inner * 0.08), width: s * (0.42 - inner * 0.06),
                cup: 0.35, reflex: 0.6, ruffle: 0.12, ruffleFreq: 9, seed: rand(0, 6),
            }, {
                angle: k * Math.PI / 3, open: 1.0 - inner * 0.08, closed: 0.1,
                delay: k * 0.06, dur: 1.6,
            });
        }

        const filGeo = new THREE.CylinderGeometry(s * 0.012, s * 0.016, s * 0.95, 6);
        filGeo.translate(0, s * 0.475, 0);
        const antherGeo = new THREE.SphereGeometry(s * 0.05, 10, 8);
        for (let k = 0; k < 6; k++) {
            const holder = new THREE.Group();
            holder.rotation.y = k * Math.PI / 3 + Math.PI / 6 + rand(-0.15, 0.15);
            const stamen = new THREE.Group();
            stamen.add(new THREE.Mesh(filGeo, MAT.filament));
            const anther = new THREE.Mesh(antherGeo, MAT.anther);
            anther.position.y = s * 0.96;
            anther.scale.set(0.6, 0.5, 1.9);
            stamen.add(anther);
            stamen.rotation.x = -rand(0.3, 0.45);
            holder.add(stamen);
            f.head.add(holder);
            addGrow(f, stamen, 0.5 + k * 0.05, 1.2);
        }

        const pistil = new THREE.Group();
        const pGeo = new THREE.CylinderGeometry(s * 0.018, s * 0.025, s * 1.05, 6);
        pGeo.translate(0, s * 0.525, 0);
        pistil.add(new THREE.Mesh(pGeo, MAT.pistil));
        const tip = new THREE.Mesh(new THREE.SphereGeometry(s * 0.045, 10, 8), MAT.pistil);
        tip.position.y = s * 1.06;
        pistil.add(tip);
        pistil.rotation.x = -0.08;
        f.head.add(pistil);
        addGrow(f, pistil, 0.55, 1.2);
        return f;
    }

    function buildSunflower(s) {
        const f = newFlower();
        const diskR = 0.48 * s;

        for (let i = 0; i < 14; i++) {
            addPetal(f, MAT.leaf, {
                shape: 'pointed', length: s * 0.5, width: s * 0.16, cup: 0.3,
            }, { angle: i * (Math.PI * 2 / 14), r: diskR * 0.8, y: -0.06 * s, open: 1.62, delay: 0, dur: 1.0 });
        }
        for (let ring = 0; ring < 2; ring++) {
            for (let i = 0; i < 20; i++) {
                addPetal(f, MAT.sunflower, {
                    shape: 'narrow', length: s * (0.85 - ring * 0.07), width: s * 0.2,
                    cup: 0.35, reflex: 0.1, ruffle: 0.08, seed: rand(0, 6),
                }, {
                    angle: (i + ring * 0.5) * (Math.PI * 2 / 20), r: diskR * 0.86,
                    open: 1.42 - ring * 0.14 + rand(-0.05, 0.05), delay: 0.1 + ring * 0.15 + i * 0.015, dur: 1.2,
                });
            }
        }

        const disk = new THREE.Mesh(
            new THREE.CylinderGeometry(diskR, diskR * 0.9, 0.16 * s, 48),
            [MAT.diskSide, MAT.seeds, MAT.diskBack]
        );
        disk.position.y = 0.02 * s;
        f.head.add(disk);
        addGrow(f, disk, 0.3, 1.0, 0.4);
        return f;
    }

    const BUILDERS = { rose: buildRose, peony: buildPeony, lily: buildLily, sunflower: buildSunflower };
    const SIZES = { rose: 1.0, peony: 1.05, lily: 0.95, sunflower: 1.25 };

    // ---------- ترتيب الباقة ----------
    // tilt = ميلان الوردة عن الوسط، az = الزاوية حول الباقة، R = بُعدها عن نقطة الربط
    const LAYOUT = [
        { type: 'rose', tilt: 0, az: 0, R: 6.3, ring: 0 },
    ];
    ['peony', 'lily', 'rose', 'sunflower', 'peony', 'rose'].forEach((type, i) => {
        LAYOUT.push({ type, tilt: 0.42, az: i * Math.PI / 3 + 0.3, R: 6.0, ring: 1 });
    });
    ['sunflower', 'rose', 'lily', 'peony', 'rose', 'sunflower', 'lily', 'peony'].forEach((type, i) => {
        LAYOUT.push({ type, tilt: 0.86, az: i * Math.PI / 4 + 0.1, R: 5.6, ring: 2 });
    });

    const bouquet = new THREE.Group();
    scene.add(bouquet);
    const flowers = [];
    const extras = [];

    LAYOUT.forEach((L) => {
        const tilt = L.tilt + (L.tilt ? rand(-0.05, 0.05) : 0);
        const az = L.az + rand(-0.06, 0.06);
        const dir = new THREE.Vector3(Math.sin(tilt) * Math.cos(az), Math.cos(tilt), Math.sin(tilt) * Math.sin(az));
        const headPos = dir.clone().multiplyScalar(L.R);

        const f = BUILDERS[L.type](SIZES[L.type] * rand(0.92, 1.06));
        f.head.position.copy(headPos);
        f.head.quaternion.setFromUnitVectors(UP, dir);
        f.head.rotateY(rand(0, Math.PI * 2));
        f.start = 1.0 + L.ring * 0.35 + rand(0, 0.3);
        bouquet.add(f.head);
        flowers.push(f);

        // الساق
        const ba = rand(0, Math.PI * 2), br = rand(0.05, 0.28);
        const bx = Math.cos(ba) * br, bz = Math.sin(ba) * br;
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(bx, -4.3, bz),
            new THREE.Vector3(bx * 0.6, -1.6, bz * 0.6),
            new THREE.Vector3(bx * 0.3, 0, bz * 0.3),
            dir.clone().multiplyScalar(L.R * 0.5),
            headPos.clone().addScaledVector(dir, -0.2),
        ]);
        bouquet.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 28, 0.055, 6, false), MAT.stem));
    });

    // أوراق خضراء بين الورد
    for (let k = 0; k < 12; k++) {
        const az = (k / 12) * Math.PI * 2 + rand(-0.15, 0.15);
        const tilt = rand(0.95, 1.2);
        const dir = new THREE.Vector3(Math.sin(tilt) * Math.cos(az), Math.cos(tilt), Math.sin(tilt) * Math.sin(az));
        const leaf = new THREE.Mesh(petalGeometry({
            shape: 'pointed', length: rand(1.9, 2.5), width: rand(0.45, 0.6), cup: 0.3, reflex: 0.3, bend: -0.05,
        }), MAT.leaf);
        leaf.position.set(Math.cos(az) * 2.4, 2.4, Math.sin(az) * 2.4);
        leaf.quaternion.setFromUnitVectors(UP, dir);
        leaf.rotateY(rand(0, Math.PI * 2));
        leaf.scale.setScalar(0.001);
        bouquet.add(leaf);
        extras.push({ obj: leaf, delay: 0.9 + rand(0, 0.5), dur: 1.3 });
    }

    // ---------- ورق التغليف ----------
    const PROFILE = [
        [0.42, -3.4], [0.39, -2.2], [0.37, -1.0], [0.36, -0.2], [0.42, 0.15], [0.75, 0.6],
        [1.35, 1.2], [2.0, 1.75], [2.65, 2.25], [3.3, 2.75], [4.0, 3.2],
    ];

    function wrapGeometry(thetaStart, thetaLen, scale, phase) {
        const seg = 96;
        const pos = [], uv = [], idx = [];
        PROFILE.forEach(([r0, y0], k) => {
            const s = Math.pow(clamp01(y0 / 3.2), 3);
            const pleat = clamp01(y0 / 3.2);
            for (let i = 0; i <= seg; i++) {
                const th = thetaStart + thetaLen * i / seg;
                const r = r0 * scale * (1 + 0.07 * s * Math.sin(th * 6 + phase) + 0.04 * pleat * Math.sin(th * 13 + phase * 2));
                const y = y0 + 0.35 * s * Math.sin(th * 5 + phase * 1.3);
                pos.push(r * Math.cos(th), y, r * Math.sin(th));
                uv.push(i / seg, k / (PROFILE.length - 1));
            }
        });
        for (let k = 0; k < PROFILE.length - 1; k++) {
            for (let i = 0; i < seg; i++) {
                const a = k * (seg + 1) + i, b = a + 1, c = a + seg + 1, d = c + 1;
                idx.push(a, c, b, b, c, d);
            }
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        g.setIndex(idx);
        g.computeVertexNormals();
        return g;
    }

    bouquet.add(new THREE.Mesh(wrapGeometry(0, Math.PI * 2, 0.97, 1.7), MAT.paperInner));
    bouquet.add(new THREE.Mesh(wrapGeometry(Math.PI / 2 + 0.55, Math.PI * 2 - 1.1, 1.03, 0.4), MAT.paperOuter));

    // ---------- الشريطة ----------
    const ribbon = new THREE.Group();
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.09, 12, 40), MAT.ribbon);
    band.rotation.x = Math.PI / 2;
    ribbon.add(band);
    [-1, 1].forEach((side) => {
        const loop = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.08, 10, 32), MAT.ribbon);
        loop.scale.set(1, 0.55, 1);
        loop.position.set(side * 0.36, 0.05, 0.5);
        loop.rotation.z = side * 0.35;
        ribbon.add(loop);
        const tail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.2, 0.03), MAT.ribbon);
        tail.position.set(side * 0.2, -0.6, 0.5);
        tail.rotation.z = side * 0.28;
        ribbon.add(tail);
    });
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), MAT.ribbon);
    knot.position.set(0, 0.03, 0.5);
    ribbon.add(knot);
    ribbon.scale.setScalar(0.001);
    bouquet.add(ribbon);
    extras.push({ obj: ribbon, delay: 0.6, dur: 1.0 });

    // ---------- بتلات تتساقط (3D) ----------
    const fallGeo = {
        rose: petalGeometry({ length: 0.36, width: 0.34, cup: 0.4, segU: 4, segV: 5 }),
        peony: petalGeometry({ length: 0.34, width: 0.36, cup: 0.35, ruffle: 0.5, segU: 4, segV: 5 }),
        lily: petalGeometry({ shape: 'pointed', length: 0.5, width: 0.16, cup: 0.3, segU: 4, segV: 5 }),
        sunflower: petalGeometry({ shape: 'narrow', length: 0.42, width: 0.1, cup: 0.3, segU: 4, segV: 5 }),
    };
    const fallTypes = Object.keys(fallGeo);
    const falling = [];
    for (let i = 0; i < 26; i++) {
        const type = fallTypes[i % fallTypes.length];
        const mesh = new THREE.Mesh(fallGeo[type], MAT[type]);
        mesh.visible = false;
        scene.add(mesh);
        falling.push({ mesh, vy: 0, phase: 0, spin: new THREE.Vector3() });
    }

    function respawn(p, initial) {
        p.mesh.position.set(rand(-7, 7), initial ? rand(9, 20) : rand(9.5, 11.5), rand(-4, 5));
        p.vy = rand(0.5, 0.9);
        p.phase = rand(0, Math.PI * 2);
        p.spin.set(rand(-1.5, 1.5), rand(-1.5, 1.5), rand(-1.5, 1.5));
        p.mesh.visible = true;
    }

    // ---------- الحركة ----------
    let started = false, startTime = 0, lastTime = 0, fallingOn = false;

    function setBloom(t) {
        flowers.forEach((f) => {
            if (f.done) return;
            const local = t - f.start;
            let allDone = true;
            f.anims.forEach((a) => {
                const x = clamp01((local - a.delay) / a.dur);
                if (x < 1) allDone = false;
                a.apply(a.ease(x));
            });
            f.done = allDone;
        });
        extras.forEach((x) => {
            const e = easeOutBack(clamp01((t - x.delay) / x.dur));
            x.obj.scale.setScalar(Math.max(0.001, e));
        });
    }

    function frame(now) {
        requestAnimationFrame(frame);
        const sec = now / 1000;
        const dt = Math.min(0.05, sec - (lastTime || sec));
        lastTime = sec;

        if (started) {
            const t = sec - startTime;
            const rise = easeOutCubic(clamp01(t / 1.8));
            bouquet.position.y = -1.4 * (1 - rise);
            bouquet.scale.setScalar(0.9 + 0.1 * rise);
            setBloom(t);

            if (t > 3.2 && !controls.autoRotate) controls.autoRotate = true;
            if (t > 3.4 && !fallingOn) {
                fallingOn = true;
                falling.forEach((p) => respawn(p, true));
            }
            if (fallingOn) {
                falling.forEach((p) => {
                    const m = p.mesh;
                    m.position.y -= p.vy * dt;
                    m.position.x += Math.sin(sec * 0.9 + p.phase) * 0.45 * dt;
                    m.position.z += Math.cos(sec * 0.7 + p.phase) * 0.25 * dt;
                    m.rotation.x += p.spin.x * dt;
                    m.rotation.y += p.spin.y * dt;
                    m.rotation.z += p.spin.z * dt;
                    if (m.position.y < -7) respawn(p, false);
                });
            }
        }

        controls.update();
        renderer.render(scene, camera);
    }

    setBloom(-10);
    camera.position.copy(target).addScaledVector(camDir, 20);
    fitCamera();
    window.addEventListener('resize', fitCamera);
    requestAnimationFrame(frame);

    return {
        start() {
            started = true;
            startTime = performance.now() / 1000;
        },
    };
}
