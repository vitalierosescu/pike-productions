console.log('home')

// const initHomeLoader = () => {
//   const loaderShown = localStorage.getItem('loaderShown')

//   CustomEase.create('vitalie-ease', '0.65, 0.01, 0.05, 0.99')

//   let logoToFlip = document.querySelector('.nav_logo.to-flip')
//   let videoToFlip = document.querySelector('.home-load_video-parent')
//   let videoDestination = document.querySelector('.scaling-element__small-box')
//   let menuIconToFlip = document.querySelector('.home-load_icon-wrap')
//   let wrapperElements = document.querySelectorAll("[data-flip-element='wrapper']")
//   let targetEl = document.querySelector("[data-flip-element='target']")

//   //lenis.stop()

//   gsap.defaults({ ease: 'vitalie-ease', duration: 1 })

//   // --- Flip on scroll logic ---
//   let flipTl

//   function flipTimeline() {
//     if (flipTl) {
//       flipTl.kill()
//       gsap.set(targetEl, { clearProps: 'all' })
//     }

//     flipTl = gsap.timeline({
//       scrollTrigger: {
//         trigger: wrapperElements[0],
//         start: 'center center',
//         endTrigger: wrapperElements[wrapperElements.length - 1],
//         end: 'center center',
//         scrub: 0.25,
//       },
//     })

//     wrapperElements.forEach(function (element, index) {
//       let nextIndex = index + 1
//       if (nextIndex < wrapperElements.length) {
//         let nextWrapperEl = wrapperElements[nextIndex]
//         let nextRect = nextWrapperEl.getBoundingClientRect()
//         let thisRect = element.getBoundingClientRect()
//         let nextDistance = nextRect.top + window.pageYOffset + nextWrapperEl.offsetHeight / 2
//         let thisDistance = thisRect.top + window.pageYOffset + element.offsetHeight / 2
//         let offset = nextDistance - thisDistance
//         flipTl.add(
//           Flip.fit(targetEl, nextWrapperEl, {
//             duration: offset,
//             ease: 'none',
//           })
//         )
//       }
//     })
//   }

//   let resizeTimer
//   window.addEventListener('resize', function () {
//     clearTimeout(resizeTimer)
//     resizeTimer = setTimeout(function () {
//       flipTimeline()
//     }, 100)
//   })

//   // --- On loader complete ---
//   function onLoaderComplete() {
//     //lenis.start()
//     localStorage.setItem('loaderShown', 'true')
//     flipTimeline()
//   }


//   const defaultTl = gsap.timeline({
//     scrollTrigger: {
//       trigger: wrapperElements[0],
//       start: 'center center',
//       endTrigger: wrapperElements[wrapperElements.length - 1],
//       end: 'center center',
//       scrub: true
//     },
//   })

//   defaultTl.to('.home--hero_content', { y: '-4rem', opacity: "0" })
//     .to('[data-flip-element="target"]', { borderRadius: '200px' }, 0)

//   // --- Skip loader if already shown ---
//   if (loaderShown) {
//     gsap.set('.nav_logo_svg-wrap', { yPercent: 0 })
//     gsap.set('.scaling-element__bg', { opacity: 1 })
//     gsap.set('.nav_logo.is--left', { x: '-1rem' })
//     gsap.set('.nav_logo.is--right', { x: '1rem' })
//     gsap.set('.nav_logo-svg.is--left', { yPercent: 110 })
//     gsap.set('.nav_logo-svg.is--right', { yPercent: -110 })
//     gsap.set('.hero_bg', { display: 'none' })
//     videoDestination.appendChild(videoToFlip)

//     onLoaderComplete()
//     return
//   }


//   // --- Full loader animation ---
//   const tl = gsap.timeline()

//   tl.from(logoToFlip, { y: '100%' })
//   tl.from(menuIconToFlip, { y: '100%', rotate: '360deg' }, '<')

//   gsap.set('.nav_logo_svg-wrap', { yPercent: -100 })
//   gsap.set('.scaling-element__bg', { opacity: 0 })

//   tl.from(
//     '.home-load_video-wrap',
//     {
//       delay: 0.6,
//       width: '0rem',
//       onComplete: () => {
//         moveVideoInto(videoDestination)
//         gsap.to('.nav_logo-svg.is--left', { yPercent: 110, duration: 0.9, ease: 'vitalie-ease' })
//         gsap.to('.nav_logo-svg.is--right', { yPercent: -110, duration: 0.9, delay: 0.1, ease: 'vitalie-ease' })
//         gsap.to('.nav_logo_svg-wrap', { yPercent: 0, duration: 0.6, delay: 1.2, ease: 'vitalie-ease' })
//         gsap.to('.scaling-element__bg', { opacity: 1, duration: 1.5, delay: 1.2, ease: 'vitalie-ease' })
//       },
//     },
//     0
//   )
//     .to('.nav_logo.is--left', { delay: 0.6, x: '-1rem' }, 0)
//     .to('.nav_logo.is--right', { delay: 0.6, x: '1rem' }, 0)
//     .from('.menu-button-text', {
//       y: '100%',
//       delay: 1.2,
//       onComplete: onLoaderComplete,
//     })
//     .set('.hero_bg', { display: 'none' })

//   function moveVideoInto(element) {
//     let state = Flip.getState(videoToFlip)
//     element.appendChild(videoToFlip)
//     Flip.from(state, {
//       duration: 1.5,
//       delay: 0.3,
//       absoluteOnLeave: true,
//     })
//   }
// }

const initNewLoader = () => {
  const logoWrap = document.querySelector(".loader__logo-wrap");
  const videoWrap = document.querySelector(".l-video-wrap");
  const video = document.querySelector(".l-video");
  const logoWrapOuter = document.querySelector(".l-logo-wrap");
  const wrapperElements = document.querySelectorAll("[data-flip-element='wrapper']");

  if (!logoWrap || !video) return;

  // Start loading video immediately
  const src = video.getAttribute("data-video-src");
  if (src && !video.src) {
    video.muted = true;
    video.playsInline = true;
    video.src = src;
  }

  // Hide video, fade in once ready
  gsap.set(video, { opacity: 0 });

  let videoFadedIn = false; 
  const fadeInVideo = () => {
    if (videoFadedIn) return;
    videoFadedIn = true;
    gsap.to(video, { opacity: 1, duration: 0.6, delay:.8, ease: "power2.out" });
  };

  if (video.readyState >= 4) {
    fadeInVideo();
  } else {
    video.addEventListener("canplaythrough", fadeInVideo, { once: true });
  }

  // --- Post-loader flip logic ---
  let flipTl;
  const container = document.querySelector(".resource-wrapper");
  const startWrapper = wrapperElements[0];
  const endWrapper = wrapperElements[wrapperElements.length - 1];

  function getRelativeRect(wrapper) {
    const cRect = container.getBoundingClientRect();
    const wRect = wrapper.getBoundingClientRect();
    return {
      x: wRect.left - cRect.left,
      y: wRect.top - cRect.top,
      width: wRect.width,
      height: wRect.height,
    };
  }

  function initScrollFlip() {
    if (wrapperElements.length < 2) return;

    if (flipTl) flipTl.kill();

    const startRect = getRelativeRect(startWrapper);
    const endRect = getRelativeRect(endWrapper);

    gsap.set(videoWrap, {
      x: startRect.x,
      y: startRect.y,
      width: startRect.width,
      height: startRect.height,
    });

    flipTl = gsap.timeline({
      scrollTrigger: {
        trigger: startWrapper,
        start: "center center",
        endTrigger: endWrapper,
        end: "center center",
        scrub: 0.25,
      },
    });

    flipTl.to(videoWrap, {
      x: endRect.x,
      y: endRect.y,
      width: endRect.width,
      height: endRect.height,
      borderRadius: '200px',
      ease: "none",
    });
    flipTl.to(video, {
      width: '100%',
      height: '100%',
      ease: "none",
    }, 0);
  }

  function onLoaderComplete() {
    if (wrapperElements.length < 2 || !container) return;

    const loaderBg = document.querySelector('.hero_bg')

    // Clear all inline styles from the reveal animation
    gsap.set(videoWrap, { clearProps: "all" });
    gsap.set(logoWrap, { clearProps: "all" });
    gsap.set(logoWrapOuter, { clearProps: "all" });

    // Hide loader overlay
    const loader = document.querySelector("[data-load-wrap]");
    if (loader) gsap.set(loader, { display: "none" });

    // Move videoWrap into resource-wrapper as absolute overlay
    container.appendChild(videoWrap);
    gsap.set(loaderBg, { display: "none" });
    gsap.set(container, { position: "relative" });
    gsap.set(videoWrap, {
      clipPath: "none",
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 5,
      overflow: "hidden",
    });

    // Snap to first wrapper and set up scroll animation
    initScrollFlip();

    // Recalculate on resize
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initScrollFlip, 100);
    });
  }

  // Skip loader entirely on reduced motion
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    gsap.set(videoWrap, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      width: "100vw",
      height: "100vh",
    });
    onLoaderComplete();
    return;
  }

  const outDuration = 1.8;
  const pulseDuration = 0.8;

  // Pulse phase: infinite, stops at low point (0.85) once video is ready + min 1 cycle
  const pulse = gsap.fromTo(
    logoWrap,
    { scale: 0.85 },
    {
      scale: 1,
      duration: pulseDuration,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    }
  );

  let videoReady = false;
  let cycles = 0;

  // Try to play video
  video.play()
    .then(() => {
      if (video.readyState >= 4) {
        videoReady = true;
      } else {
        video.addEventListener("canplaythrough", () => { videoReady = true; }, { once: true });
      }
    })
    .catch(() => {
      // Autoplay blocked - proceed anyway
      videoReady = true;
    });

  // Absolute fallback
  setTimeout(() => { videoReady = true; }, 5000);

  // Check at each direction change; only transition at low point (scale 0.85)
  pulse.eventCallback("onRepeat", () => {
    cycles += 0.5;
    // Integer cycles = at scale 0.85 (low point)
    if (Number.isInteger(cycles) && cycles >= 1 && videoReady) {
      pulse.kill();
      startReveal();
    }
  });

  const startReveal = () => {
    const tl = gsap.timeline({ onComplete: onLoaderComplete });

    // Scale logo from 0.85 to 1
    tl.to(logoWrap, {
      scale: 1,
      duration: outDuration * 0.4,
      ease: "power4.inOut",
    });

    // Clip-path reveal + logo outer scale out (parallel with logo scale)
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
        ease: "power3.inOut",
      },
      0
    );

    tl.to(
      logoWrapOuter,
      {
        scale: 65,
        //x: "35vw",
        //opacity: 0,
        duration: outDuration,
        ease: "power4.inOut",
      },
      0
    );
  };
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
  initNewLoader()
  initSlider()
}
