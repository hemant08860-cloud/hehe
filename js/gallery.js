/* =========================================================
   PROJECT AYE AYE MADAM — LETTERS & PHOTO LIGHTBOX
   Version 2.0.0
========================================================= */

(() => {
    const reducedMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let activeEnvelope = null;
    let activeLetter = null;
    let openingTimer = null;

    /* ---------------- LETTER ENVELOPES ---------------- */

    function getCollection() {
        return document.getElementById("letter-collection");
    }

    function closeLetter(restoreFocus = true) {
        const collection = getCollection();

        if (openingTimer) {
            window.clearTimeout(openingTimer);
            openingTimer = null;
        }

        if (activeLetter) activeLetter.hidden = true;

        if (activeEnvelope) {
            activeEnvelope.classList.remove("is-opening");
            activeEnvelope.setAttribute("aria-expanded", "false");
            if (restoreFocus) activeEnvelope.focus();
        }

        activeLetter = null;
        activeEnvelope = null;

        if (collection) {
            collection.hidden = false;
            collection.scrollIntoView({
                behavior: reducedMotion ? "auto" : "smooth",
                block: "start"
            });
        }
    }

    function openLetter(envelope) {
        const collection = getCollection();
        const letterId = envelope.getAttribute("data-letter");
        const letter = document.getElementById(letterId);

        if (!collection || !letter || !letter.classList.contains("letter-paper")) {
            return;
        }

        if (openingTimer) window.clearTimeout(openingTimer);
        if (activeLetter) activeLetter.hidden = true;

        if (activeEnvelope) {
            activeEnvelope.classList.remove("is-opening");
            activeEnvelope.setAttribute("aria-expanded", "false");
        }

        activeEnvelope = envelope;
        activeLetter = letter;

        envelope.setAttribute("aria-expanded", "true");
        envelope.classList.remove("is-opening");
        void envelope.offsetWidth;
        envelope.classList.add("is-opening");

        const revealPaper = () => {
            envelope.classList.remove("is-opening");
            collection.hidden = true;
            letter.hidden = false;

            letter.scrollIntoView({
                behavior: reducedMotion ? "auto" : "smooth",
                block: "start"
            });

            const closeButton = letter.querySelector(".letter-close");
            if (closeButton) closeButton.focus({ preventScroll: true });

            openingTimer = null;
        };

        if (reducedMotion) {
            revealPaper();
        } else {
            openingTimer = window.setTimeout(revealPaper, 560);
        }
    }

    /* ---------------- PHOTO LIGHTBOX ---------------- */

    const lightbox = document.getElementById("photo-lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxCaption = document.getElementById("lightbox-caption");
    const lightboxClose = lightbox ? lightbox.querySelector(".lightbox-close") : null;
    let lastFocusedFrame = null;

    function openLightbox(frame) {
        if (!lightbox || !lightboxImg) return;
        const img = frame.querySelector("img");
        const caption = frame.querySelector("figcaption");
        if (!img) return;

        lastFocusedFrame = frame;
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || "";
        if (lightboxCaption) {
            lightboxCaption.textContent = caption ? caption.textContent : "";
        }

        lightbox.hidden = false;
        if (lightboxClose) lightboxClose.focus();
    }

    function closeLightbox() {
        if (!lightbox || lightbox.hidden) return;
        lightbox.hidden = true;
        if (lastFocusedFrame) {
            lastFocusedFrame.focus();
            lastFocusedFrame = null;
        }
    }

    /* ---------------- EVENT DELEGATION ---------------- */

    document.addEventListener("click", (event) => {
        const envelope = event.target.closest(".letter-envelope[data-letter]");
        if (envelope) {
            event.preventDefault();
            openLetter(envelope);
            return;
        }

        const closeButton = event.target.closest(".letter-paper .letter-close");
        if (closeButton && activeLetter) {
            event.preventDefault();
            closeLetter(true);
            return;
        }

        const frame = event.target.closest(".hanging-frame");
        if (frame) {
            event.preventDefault();
            openLightbox(frame);
            return;
        }

        if (lightbox && !lightbox.hidden) {
            if (event.target === lightbox || event.target.closest(".lightbox-close")) {
                event.preventDefault();
                closeLightbox();
            }
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            if (lightbox && !lightbox.hidden) {
                event.preventDefault();
                closeLightbox();
                return;
            }
            if (activeLetter && !activeLetter.hidden) {
                event.preventDefault();
                closeLetter(true);
            }
        }

        if ((event.key === "Enter" || event.key === " ") && document.activeElement) {
            const frame = document.activeElement.closest(".hanging-frame");
            if (frame) {
                event.preventDefault();
                openLightbox(frame);
            }
        }
    });
})();
