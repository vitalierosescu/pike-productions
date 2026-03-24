const initAnimateItems = () => {
    // --- Tweakables ---
    const SELECTOR = ".case_item";
    const START_Y = "2rem";
    const END_Y = "0rem";
    const DURATION = 0.6;
    const EASE = "power2.out";
    const TRIGGER_START = "top 85%";
    const STAGGER_DELAY = 0.15;
    const BATCH_MAX = 2;
    const BATCH_INTERVAL = 0.1;
    const TABLET_BP = 768;

    const items = gsap.utils.toArray(SELECTOR);

    gsap.set(items, { autoAlpha: 0, y: START_Y, force3d: true });

    ScrollTrigger.matchMedia({
        // Tablet and above — batch in pairs (single scroll listener)
        [`(min-width: ${TABLET_BP}px)`]: function () {
            ScrollTrigger.batch(items, {
                interval: BATCH_INTERVAL,
                batchMax: BATCH_MAX,
                start: TRIGGER_START,
                onEnter: (batch) => {
                    gsap.to(batch, {
                        autoAlpha: 1,
                        y: END_Y,
                        duration: DURATION,
                        stagger: STAGGER_DELAY,
                        ease: EASE,
                        overwrite: true,
                    });
                },
            });
        },

        // Mobile landscape and below — one at a time
        [`(max-width: ${TABLET_BP - 1}px)`]: function () {
            ScrollTrigger.batch(items, {
                interval: BATCH_INTERVAL,
                batchMax: 1,
                start: TRIGGER_START,
                onEnter: (batch) => {
                    gsap.to(batch, {
                        autoAlpha: 1,
                        y: END_Y,
                        duration: DURATION,
                        ease: EASE,
                        overwrite: true,
                    });
                },
            });
        },
    });
}

export function initCaseOverview() {
    initAnimateItems()
};
