console.log('home')

const initHomeLoader = () => {
  const loaderShown = localStorage.getItem('loaderShown')

  CustomEase.create('vitalie-ease', '0.65, 0.01, 0.05, 0.99')

  let logoToFlip = document.querySelector('.nav_logo.to-flip')
  let videoToFlip = document.querySelector('.home-load_video-parent')
  let videoDestination = document.querySelector('.scaling-element__small-box')
  let menuIconToFlip = document.querySelector('.home-load_icon-wrap')
  let wrapperElements = document.querySelectorAll("[data-flip-element='wrapper']")
  let targetEl = document.querySelector("[data-flip-element='target']")

  //lenis.stop()

  gsap.defaults({ ease: 'vitalie-ease', duration: 1 })

  // --- Flip on scroll logic ---
  let flipTl

  function flipTimeline() {
    if (flipTl) {
      flipTl.kill()
      gsap.set(targetEl, { clearProps: 'all' })
    }

    flipTl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapperElements[0],
        start: 'center center',
        endTrigger: wrapperElements[wrapperElements.length - 1],
        end: 'center center',
        scrub: 0.25,
      },
    })

    wrapperElements.forEach(function (element, index) {
      let nextIndex = index + 1
      if (nextIndex < wrapperElements.length) {
        let nextWrapperEl = wrapperElements[nextIndex]
        let nextRect = nextWrapperEl.getBoundingClientRect()
        let thisRect = element.getBoundingClientRect()
        let nextDistance = nextRect.top + window.pageYOffset + nextWrapperEl.offsetHeight / 2
        let thisDistance = thisRect.top + window.pageYOffset + element.offsetHeight / 2
        let offset = nextDistance - thisDistance
        flipTl.add(
          Flip.fit(targetEl, nextWrapperEl, {
            duration: offset,
            ease: 'none',
          })
        )
      }
    })
  }

  let resizeTimer
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(function () {
      flipTimeline()
    }, 100)
  })

  // --- On loader complete ---
  function onLoaderComplete() {
    //lenis.start()
    localStorage.setItem('loaderShown', 'true')
    flipTimeline()
  }


  const defaultTl = gsap.timeline({
    scrollTrigger: {
      trigger: wrapperElements[0],
      start: 'center center',
      endTrigger: wrapperElements[wrapperElements.length - 1],
      end: 'center center',
      scrub: true
    },
  })

  defaultTl.to('.home--hero_content', { y: '-4rem', opacity: "0" })
    .to('[data-flip-element="target"]', { borderRadius: '200px' }, 0)

  // --- Skip loader if already shown ---
  if (loaderShown) {
    gsap.set('.nav_logo_svg-wrap', { yPercent: 0 })
    gsap.set('.scaling-element__bg', { opacity: 1 })
    gsap.set('.nav_logo.is--left', { x: '-1rem' })
    gsap.set('.nav_logo.is--right', { x: '1rem' })
    gsap.set('.nav_logo-svg.is--left', { yPercent: 110 })
    gsap.set('.nav_logo-svg.is--right', { yPercent: -110 })
    gsap.set('.hero_bg', { display: 'none' })
    videoDestination.appendChild(videoToFlip)

    onLoaderComplete()
    return
  }


  // --- Full loader animation ---
  const tl = gsap.timeline()

  tl.from(logoToFlip, { y: '100%' })
  tl.from(menuIconToFlip, { y: '100%', rotate: '360deg' }, '<')

  gsap.set('.nav_logo_svg-wrap', { yPercent: -100 })
  gsap.set('.scaling-element__bg', { opacity: 0 })

  tl.from(
    '.home-load_video-wrap',
    {
      delay: 0.6,
      width: '0rem',
      onComplete: () => {
        moveVideoInto(videoDestination)
        gsap.to('.nav_logo-svg.is--left', { yPercent: 110, duration: 0.9, ease: 'vitalie-ease' })
        gsap.to('.nav_logo-svg.is--right', { yPercent: -110, duration: 0.9, delay: 0.1, ease: 'vitalie-ease' })
        gsap.to('.nav_logo_svg-wrap', { yPercent: 0, duration: 0.6, delay: 1.2, ease: 'vitalie-ease' })
        gsap.to('.scaling-element__bg', { opacity: 1, duration: 1.5, delay: 1.2, ease: 'vitalie-ease' })
      },
    },
    0
  )
    .to('.nav_logo.is--left', { delay: 0.6, x: '-1rem' }, 0)
    .to('.nav_logo.is--right', { delay: 0.6, x: '1rem' }, 0)
    .from('.menu-button-text', {
      y: '100%',
      delay: 1.2,
      onComplete: onLoaderComplete,
    })
    .set('.hero_bg', { display: 'none' })

  function moveVideoInto(element) {
    let state = Flip.getState(videoToFlip)
    element.appendChild(videoToFlip)
    Flip.from(state, {
      duration: 1.5,
      delay: 0.3,
      absoluteOnLeave: true,
    })
  }
}

const initNewLoader = () => {
  const logoWrap = document.querySelector(".loader__logo-wrap");
  const videoWrap = document.querySelector(".l-video-wrap");
  const video = document.querySelector(".l-video");
  const logoWrapOuter = document.querySelector(".l-logo-wrap");

  if (!logoWrap || !video) return;

  // Skip loader entirely on low power mode / reduced motion
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    gsap.set(videoWrap, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      width: "100vw",
      height: "100vh",
    });
    return;
  }

  const outDuration = 1.8;
  const pulseDuration = 0.8;
  const minCycles = 2;

  // One timeline: pulse phase → reveal phase
  const tl = gsap.timeline();

  // Pulse phase: 2 full cycles (0.6 → 1 → 0.6 → 1 → 0.6)
  // repeat: 3 with yoyo = 4 direction changes = 2 full cycles, ending at 0.6
  tl.fromTo(
    logoWrap,
    { scale: 0.6 },
    {
      scale: 1,
      duration: pulseDuration,
      ease: "sine.inOut",
      repeat: 3,
      yoyo: true,
    }
  );

  // Add a "waitForVideo" label where the timeline pauses if video isn't ready
  tl.addLabel("reveal");

  // Reveal phase: clip-path + scale (logoWrap resets to 1 as part of this)
  tl.to(
    logoWrap,
    {
      scale: 1,
      duration: outDuration * 0.4,
      ease: "power4.inOut",
    },
    "reveal"
  );

  tl.fromTo(
    videoWrap,
    {
      clipPath:
        "polygon(96.779% 45.237%,96.779% 45.237%,97.868% 45.937%,98.715% 46.784%,99.32% 47.742%,99.683% 48.773%,99.804% 49.842%,99.683% 50.91%,99.32% 51.941%,98.715% 52.899%,97.868% 53.747%,96.779% 54.447%,9.073% 98.963%,9.073% 98.963%,7.839% 99.442%,6.581% 99.663%,5.335% 99.644%,4.137% 99.405%,3.024% 98.963%,2.032% 98.337%,1.198% 97.544%,0.556% 96.605%,0.145% 95.537%,0% 94.358%,0% 5.325%,0% 5.325%,0.145% 4.147%,0.556% 3.078%,1.198% 2.139%,2.032% 1.347%,3.024% 0.72%,4.137% 0.278%,5.335% 0.039%,6.581% 0.02%,7.839% 0.241%,9.073% 0.72%,96.779% 45.237%)",
    },
    {
      clipPath:
        "polygon(100% 0%,100% 0%,100% 0%,100% 0%,100% 0%,100% 0%,100% 0%,100% 0%,100% 100%,100% 100%,100% 100%,100% 100%,0% 100%,0% 100%,0% 100%,0% 100%,0% 100%,0% 100%,0% 100%,0% 100%,0% 100%,0% 100%,0% 100%,0% 0%,0% 0%,0% 0%,0% 0%,0% 0%,0% 0%,0% 0%,0% 0%,0% 0%,0% 0%,0% 0%,0% 0%,0% 0%,100% 0%)",
      width: "100vw",
      height: "100vh",
      duration: outDuration,
      ease: "power4.inOut",
    },
    "reveal"
  );

  tl.to(
    logoWrapOuter,
    {
      scale: 30,
      opacity: 0,
      duration: outDuration,
      ease: "power4.inOut",
    },
    "reveal"
  );

  // Pause at the reveal label; resume when video is ready
  tl.addPause("reveal", () => {
    let resumed = false;
    const resume = () => {
      if (resumed) return;
      resumed = true;
      tl.resume();
    };

    // Already loaded
    if (video.readyState >= 4) {
      resume();
      return;
    }

    // Force autoplay-friendly attributes (required for iOS low power mode)
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("muted", "");

    // If src is lazy-loaded via data attribute, set it now
    const lazySrc = video.getAttribute("data-video-src") || video.getAttribute("data-src");
    if (lazySrc && !video.src) {
      video.src = lazySrc;
    }

    // Listen for load
    video.addEventListener("canplaythrough", resume, { once: true });

    // Force play attempt
    video.load();
    const playAttempt = video.play();
    if (playAttempt) {
      playAttempt.catch(() => {});
    }

    // Fallback: never wait longer than 5s
    setTimeout(resume, 5000);
  });
};


const initSlider = () => {
  let rafs = [];

  {
    const sliderWrapper = document.querySelector('[data-smooothy="1"]');

    if (sliderWrapper) {
      const slider = new Smooothy(sliderWrapper, {
        infinite: false,
      });

      // Arrows
      const arrows = document.querySelectorAll('[data-arrows] > *');
      if (arrows.length >= 2) {
        arrows[0].onclick = () => slider.goToPrev();
        arrows[1].onclick = () => slider.goToNext();
      }

      // Dots
      const dots = [...document.querySelectorAll('[data-dots] > *')];
      if (dots.length) {
        dots.forEach((dot, i) => {
          dot.onclick = () => slider.goToIndex(i);
        });

        slider.onSlideChange = (newIndex) => {
          dots.forEach((dot, i) => {
            dot.classList.toggle('is-active', i === newIndex);
          });
        };
        // Set initial active dot
        dots[0]?.classList.add('is-active');
      }

      rafs.push(() => slider.update());
    }
  }

  function animate() {
    rafs.forEach((raf) => raf());
    requestAnimationFrame(animate);
  }

  animate();
};

export function initHome() {
    //initHomeLoader()
    console.log('hi')
  initNewLoader()
  initSlider()
}
