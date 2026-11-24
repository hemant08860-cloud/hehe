/* ========================================================
   PROJECT AYE AYE MADAM 🫡
   Version 2.0.0 — Countdown, Unlock, Petal Physics & Interactions
======================================================== */

/* ========================================================
   COUNTDOWN
======================================================== */

const unlockDate = new Date("November 16, 2026 00:00:00").getTime();

const dayBox = document.getElementById("days");
const hourBox = document.getElementById("hours");
const minuteBox = document.getElementById("minutes");
const secondBox = document.getElementById("seconds");

const reducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animateNumber(element) {
    if (!element || reducedMotion || !element.animate) return;

    element.animate(
        [
            { opacity: 0.45, transform: "translateY(-3px) scale(0.97)" },
            { opacity: 1, transform: "translateY(0) scale(1)" }
        ],
        {
            duration: 240,
            easing: "ease-out"
        }
    );
}

let countdownTimer = null;

function updateCountdown() {
    const distance = unlockDate - Date.now();

    if (distance <= 0) {
        if (countdownTimer) clearInterval(countdownTimer);
        unlockWebsite();
        return;
    }

    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);

    // Show natural day count (e.g., "52" instead of "052")
    const values = [
        [dayBox, String(days)],
        [hourBox, String(hours).padStart(2, "0")],
        [minuteBox, String(minutes).padStart(2, "0")],
        [secondBox, String(seconds).padStart(2, "0")]
    ];

    values.forEach(([element, value]) => {
        if (element && element.textContent !== value) {
            element.textContent = value;
            animateNumber(element);
        }
    });
}

/* ========================================================
   INTERACTIVE UNLOCK PILL (PLAYFUL SHAKE + TOAST)
======================================================== */

const lockedMessages = [
    "No peeking until 16 January! 🤫",
    "Patience, Madam — your HERO is still wrapping it 🎁",
    "Nice try! Some moments are worth the wait 💗",
    "Mission AAM-1601 unlocks on 16 January 🫡"
];

function initUnlockPill() {
    const pill = document.getElementById("unlock-pill");
    const toast = document.getElementById("unlock-toast");
    if (!pill || !toast) return;

    let msgIndex = 0;
    let hideTimer = null;

    pill.addEventListener("click", () => {
        // Trigger shake animation
        pill.classList.remove("is-shaking");
        void pill.offsetWidth;
        pill.classList.add("is-shaking");

        // Show cycling playful message
        toast.textContent = lockedMessages[msgIndex % lockedMessages.length];
        msgIndex++;
        toast.classList.add("is-visible");

        if (hideTimer) window.clearTimeout(hideTimer);
        hideTimer = window.setTimeout(() => {
            toast.classList.remove("is-visible");
        }, 2800);
    });
}

/* ========================================================
   DEVICE & PERFORMANCE PROFILE (PETAL PHYSICS)
======================================================== */

const petalLayer = document.getElementById("petal-layer");
const sparkleLayer = document.getElementById("sparkle-layer");

const userAgent = navigator.userAgent || "";
const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent) || window.innerWidth <= 600;
const isRedmi = /Redmi|Miui|Xiaomi/i.test(userAgent);
const cores = navigator.hardwareConcurrency || 4;
const memory = navigator.deviceMemory || 4;

const MOBILE_MODE = isMobile || isRedmi;

const PERFORMANCE = {
    desktop: { petals: 9, physicsFPS: 30, textureSize: 20, rotation: true, interpolation: true },
    mobile:  { petals: 5, physicsFPS: 24, textureSize: 14, rotation: false, interpolation: false },
    low:     { petals: 3, physicsFPS: 20, textureSize: 12, rotation: false, interpolation: false }
};

let profile = PERFORMANCE.desktop;
if (MOBILE_MODE) {
    profile = cores <= 4 && memory <= 3 ? PERFORMANCE.low : PERFORMANCE.mobile;
}
if (reducedMotion) {
    profile = { petals: 0, physicsFPS: 15, textureSize: 12, rotation: false, interpolation: false };
}

const PHYSICS = {
    petalCount: profile.petals,
    physicsFPS: profile.physicsFPS,
    gravity: MOBILE_MODE ? 9 : 11,
    initialFallSpeed: MOBILE_MODE ? 15 : 18,
    maxFallSpeed: MOBILE_MODE ? 52 : 62,
    wind: MOBILE_MODE ? 0.8 : 1.4,
    airResistance: 0.997,
    deflection: MOBILE_MODE ? 13 : 19,
    bounce: MOBILE_MODE ? 0.04 : 0.08
};

const PHYSICS_STEP = 1 / PHYSICS.physicsFPS;
const petals = [];
const surfaces = [];

let canvas = null;
let ctx = null;
let canvasWidth = 0;
let canvasHeight = 0;
let petalTexture = null;
let accumulator = 0;
let lastTime = performance.now();
let rafId = null;

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function createPetalTexture() {
    const size = profile.textureSize;
    const texture = document.createElement("canvas");
    texture.width = size;
    texture.height = size;
    const tctx = texture.getContext("2d");

    tctx.beginPath();
    tctx.moveTo(size * 0.50, size * 0.08);
    tctx.quadraticCurveTo(size * 0.84, size * 0.28, size * 0.70, size * 0.68);
    tctx.quadraticCurveTo(size * 0.58, size * 0.90, size * 0.50, size * 0.94);
    tctx.quadraticCurveTo(size * 0.42, size * 0.90, size * 0.30, size * 0.68);
    tctx.quadraticCurveTo(size * 0.16, size * 0.28, size * 0.50, size * 0.08);
    tctx.closePath();

    tctx.fillStyle = "rgba(255, 174, 204, 0.84)";
    tctx.fill();

    petalTexture = texture;
}

function setupCanvas() {
    if (!petalLayer || PHYSICS.petalCount === 0) return;

    petalLayer.innerHTML = "";
    canvas = document.createElement("canvas");
    canvas.id = "petal-canvas";
    petalLayer.appendChild(canvas);
    ctx = canvas.getContext("2d");

    createPetalTexture();
    resizeCanvas();
}

function updateSurfaceCache() {
    surfaces.length = 0;
    const elements = document.querySelectorAll(".envelope, .hero-note");
    for (let i = 0; i < elements.length; i++) {
        const rect = elements[i].getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        surfaces.push({
            element: elements[i],
            left: rect.left,
            right: rect.right,
            top: rect.top
        });
    }
}

function resizeCanvas() {
    if (!canvas) return;
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = canvasWidth + "px";
    canvas.style.height = canvasHeight + "px";
    updateSurfaceCache();
}

function createPetal() {
    const x = random(0, canvasWidth);
    const y = random(-canvasHeight, -20);
    const size = random(0.75, 1.05);
    const rotation = random(0, Math.PI * 2);

    petals.push({
        x,
        y,
        previousX: x,
        previousY: y,
        vx: random(-1.2, 1.2),
        vy: random(9, PHYSICS.initialFallSpeed),
        width: 13 * size,
        height: 17 * size,
        rotation,
        previousRotation: rotation,
        spin: random(-0.55, 0.55),
        opacity: random(0.46, 0.68),
        age: random(0, 10),
        cooldown: 0,
        lastSurface: null
    });
}

function initializePetals() {
    petals.length = 0;
    for (let i = 0; i < PHYSICS.petalCount; i++) {
        createPetal();
    }
}

function checkCollision(petal, previousY) {
    if (petal.vy <= 0) return;

    const previousBottom = previousY + petal.height * 0.5;
    const currentBottom = petal.y + petal.height * 0.5;

    for (let i = 0; i < surfaces.length; i++) {
        const surface = surfaces[i];
        if (petal.lastSurface === surface.element) continue;
        if (previousBottom > surface.top || currentBottom < surface.top) continue;
        if (petal.x < surface.left || petal.x > surface.right) continue;

        const center = (surface.left + surface.right) * 0.5;
        const direction = petal.x < center ? -1 : 1;

        petal.vx += direction * PHYSICS.deflection;
        petal.vy = -Math.abs(petal.vy * PHYSICS.bounce);
        petal.y = surface.top - petal.height * 0.5 - 1;

        if (profile.rotation) {
            petal.spin += direction * 0.15;
        }

        petal.cooldown = 0.2;
        petal.lastSurface = surface.element;
        return;
    }
}

function respawnPetal(petal) {
    const x = random(0, canvasWidth);
    const y = random(-100, -20);
    petal.x = x;
    petal.previousX = x;
    petal.y = y;
    petal.previousY = y;
    petal.vx = random(-1.2, 1.2);
    petal.vy = random(9, PHYSICS.initialFallSpeed);
    if (profile.rotation) {
        petal.rotation = random(0, Math.PI * 2);
        petal.previousRotation = petal.rotation;
    }
    petal.age = random(0, 5);
    petal.cooldown = 0;
    petal.lastSurface = null;
}

function updatePetal(petal, delta) {
    petal.previousX = petal.x;
    petal.previousY = petal.y;
    if (profile.rotation) petal.previousRotation = petal.rotation;

    petal.age += delta;
    if (petal.cooldown > 0) {
        petal.cooldown -= delta;
    } else {
        petal.lastSurface = null;
    }

    petal.vx += Math.sin(petal.age * 0.6) * PHYSICS.wind * delta;
    petal.vy += PHYSICS.gravity * delta;
    petal.vx *= Math.pow(PHYSICS.airResistance, delta * 60);
    petal.vy = Math.min(petal.vy, PHYSICS.maxFallSpeed);

    petal.x += petal.vx * delta;
    petal.y += petal.vy * delta;

    if (profile.rotation) {
        petal.rotation += petal.spin * delta;
    }

    if (petal.cooldown <= 0) {
        checkCollision(petal, petal.previousY);
    }

    if (petal.x < -40) {
        petal.x = canvasWidth + 20;
        petal.previousX = petal.x;
    } else if (petal.x > canvasWidth + 40) {
        petal.x = -20;
        petal.previousX = petal.x;
    }

    if (petal.y > canvasHeight + 40) {
        respawnPetal(petal);
    }
}

function drawPetals(interpolation) {
    if (!ctx || !petalTexture) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    for (let i = 0; i < petals.length; i++) {
        const petal = petals[i];
        const x = profile.interpolation
            ? petal.previousX + (petal.x - petal.previousX) * interpolation
            : petal.x;
        const y = profile.interpolation
            ? petal.previousY + (petal.y - petal.previousY) * interpolation
            : petal.y;

        ctx.globalAlpha = petal.opacity;

        if (profile.rotation) {
            const rot = petal.previousRotation + (petal.rotation - petal.previousRotation) * interpolation;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rot);
            ctx.drawImage(petalTexture, -petal.width * 0.5, -petal.height * 0.5, petal.width, petal.height);
            ctx.restore();
        } else {
            ctx.drawImage(petalTexture, x - petal.width * 0.5, y - petal.height * 0.5, petal.width, petal.height);
        }
    }

    ctx.globalAlpha = 1;
}

function petalLoop(currentTime) {
    const elapsed = Math.min((currentTime - lastTime) / 1000, 0.1);
    lastTime = currentTime;
    accumulator += elapsed;

    while (accumulator >= PHYSICS_STEP) {
        for (let i = 0; i < petals.length; i++) {
            updatePetal(petals[i], PHYSICS_STEP);
        }
        accumulator -= PHYSICS_STEP;
    }

    drawPetals(accumulator / PHYSICS_STEP);
    rafId = requestAnimationFrame(petalLoop);
}

/* ========================================================
   MISSION LOADER & UNLOCK SEQUENCE
======================================================== */

const loadingMessages = [
    "🌸 Preparing birthday surprise...",
    "💌 Writing your letter...",
    "✨ Decorating memories...",
    "🎁 Wrapping happiness...",
    "🫡 Mission Ready!"
];

function showBirthdayHero() {
    const screen = document.getElementById("countdown-screen");
    const loader = document.getElementById("loader");
    const hero = document.getElementById("hero");

    if (screen) screen.style.display = "none";
    if (loader) loader.style.display = "none";
    if (hero) hero.style.display = "flex";
    document.body.style.overflowY = "auto";
}

function startLoader() {
    const loader = document.getElementById("loader");
    const progressBar = document.querySelector(".progress-bar");
    const loadingMessage = document.getElementById("loadingMessage");

    if (!loader) {
        showBirthdayHero();
        return;
    }

    loader.style.display = "flex";
    let progress = 0;
    let messageIndex = 0;

    const loading = setInterval(() => {
        progress++;
        if (progressBar) progressBar.style.width = progress + "%";

        if (progress % 20 === 0 && messageIndex < loadingMessages.length) {
            if (loadingMessage) loadingMessage.textContent = loadingMessages[messageIndex];
            messageIndex++;
        }

        if (progress >= 100) {
            clearInterval(loading);
            setTimeout(() => {
                showBirthdayHero();
            }, 450);
        }
    }, 35);
}

function unlockWebsite() {
    const screen = document.getElementById("countdown-screen");
    if (!screen) {
        startLoader();
        return;
    }

    document.body.classList.add("unlocking");
    screen.classList.add("unlocking");

    const transition = document.createElement("div");
    transition.id = "unlock-transition";
    transition.innerHTML = `
        <div class="unlock-heart">
            <span class="unlock-ring"></span>
            <span class="unlock-ring"></span>
            ♥
        </div>
    `;
    document.body.appendChild(transition);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            transition.classList.add("active");
        });
    });

    screen.style.transition = "opacity 1s ease";
    screen.style.opacity = "0";

    setTimeout(() => {
        screen.style.display = "none";
        startLoader();
    }, 1150);

    setTimeout(() => {
        transition.classList.remove("active");
        setTimeout(() => {
            transition.remove();
            document.body.classList.remove("unlocking");
        }, 1000);
    }, 2050);
}

/* ========================================================
   INITIALIZE
======================================================== */

window.addEventListener("resize", () => {
    resizeCanvas();
});

window.addEventListener("load", () => {
    if (sparkleLayer) sparkleLayer.innerHTML = "";

    initUnlockPill();

    // Optional preview helper: add ?preview=birthday or ?preview=loader to test anytime
    const params = new URLSearchParams(window.location.search);
    const previewMode = params.get("preview");

    if (previewMode === "birthday") {
        showBirthdayHero();
    } else if (previewMode === "loader") {
        const screen = document.getElementById("countdown-screen");
        if (screen) screen.style.display = "none";
        startLoader();
    } else {
        updateCountdown();
        countdownTimer = setInterval(updateCountdown, 1000);
    }

    if (PHYSICS.petalCount > 0) {
        setupCanvas();
        updateSurfaceCache();
        initializePetals();
        lastTime = performance.now();
        accumulator = 0;
        rafId = requestAnimationFrame(petalLoop);
    }
});

// Pause petal animation when tab is hidden to save battery
document.addEventListener("visibilitychange", () => {
    if (document.hidden && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    } else if (!document.hidden && !rafId && PHYSICS.petalCount > 0 && ctx) {
        lastTime = performance.now();
        accumulator = 0;
        rafId = requestAnimationFrame(petalLoop);
    }
});
