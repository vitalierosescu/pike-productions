console.log('home')

import { stopLenis, startLenis } from '../global.js'

const initNewLoader = () => {
  // Disable scroll while loader plays
  stopLenis()
  const logoWrap = document.querySelector('.loader__logo-wrap')
  const videoWrap = document.querySelector('.l-video-wrap')
  const video = document.querySelector('.l-video')
  const logoWrapOuter = document.querySelector('.l-logo-wrap')
  const wrapperElements = document.querySelectorAll("[data-flip-element='wrapper']")

  const heroContent = document.querySelector('.home--hero_content')
  gsap.set(heroContent, {
    opacity: 0,
  })

  if (!logoWrap || !video) return

  // Split and hide hero text immediately (before loader plays)
  const heroSplitTargets = []
  document.fonts.ready.then(() => {
    document.querySelectorAll('.home--hero_content [data-split]').forEach((el) => {
      const split = SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        linesClass: 'line',
      })
      gsap.set(split.lines, { yPercent: 110 })
      heroSplitTargets.push(...split.lines)
    })
  })

  // Start loading video immediately
  const src = video.getAttribute('data-video-src')
  if (src && !video.src) {
    video.muted = true
    video.playsInline = true
    video.src = src
  }

  // Hide video, fade in once ready
  gsap.set(video, { opacity: 0 })

  let videoFadedIn = false
  const fadeInVideo = () => {
    if (videoFadedIn) return
    videoFadedIn = true
    gsap.to(video, { opacity: 1, duration: 0.6, delay: 0.8, ease: 'power2.out' })
  }

  if (video.readyState >= 4) {
    fadeInVideo()
  } else {
    video.addEventListener('canplaythrough', fadeInVideo, { once: true })
  }

  // --- Post-loader flip logic ---
  let flipTl
  const container = document.querySelector('.resource-wrapper')
  const startWrapper = wrapperElements[0]
  const endWrapper = wrapperElements[wrapperElements.length - 1]

  function getRelativeRect(wrapper) {
    const cRect = container.getBoundingClientRect()
    const wRect = wrapper.getBoundingClientRect()
    return {
      x: wRect.left - cRect.left,
      y: wRect.top - cRect.top,
      width: wRect.width,
      height: wRect.height,
    }
  }

  function initScrollFlip() {
    if (wrapperElements.length < 2) return

    if (flipTl) flipTl.kill()

    const startRect = getRelativeRect(startWrapper)
    const endRect = getRelativeRect(endWrapper)

    gsap.set(videoWrap, {
      x: startRect.x,
      y: startRect.y,
      width: startRect.width,
      height: startRect.height,
    })

    flipTl = gsap.timeline({
      scrollTrigger: {
        trigger: startWrapper,
        start: 'center center',
        endTrigger: endWrapper,
        end: 'center center',
        scrub: 0.25,
      },
    })

    flipTl
      .to(videoWrap, {
        x: endRect.x,
        y: endRect.y,
        width: endRect.width,
        height: endRect.height,
        borderRadius: '200px',
        ease: 'none',
      })
      .to(
        video,
        {
          width: '100%',
          height: '100%',
          ease: 'none',
        },
        0
      )
      .to(
        heroContent,
        {
          opacity: 0,
          ease: 'none',
        },
        0
      )
  }

  function onLoaderComplete() {
    if (wrapperElements.length < 2 || !container) return

    const loaderBg = document.querySelector('.hero_bg')

    // Clear all inline styles from the reveal animation
    gsap.set(videoWrap, { clearProps: 'all' })
    gsap.set(logoWrap, { clearProps: 'all' })
    gsap.set(logoWrapOuter, { clearProps: 'all' })

    // Hide loader overlay
    const loader = document.querySelector('[data-load-wrap]')
    if (loader) gsap.set(loader, { display: 'none' })

    // Move videoWrap into resource-wrapper as absolute overlay
    container.appendChild(videoWrap)
    gsap.set(loaderBg, { opacity: 0 })
    gsap.set(container, { position: 'relative' })
    gsap.set(videoWrap, {
      clipPath: 'none',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 0,
      overflow: 'hidden',
    })

    // Snap to first wrapper and set up scroll animation
    initScrollFlip()

    // Reveal hero text after video snaps into place
    gsap.to(heroContent, {
      opacity: 1,
      duration: 0.4,
    })
    if (heroSplitTargets.length) {
      gsap.to(heroSplitTargets, {
        yPercent: 0,
        stagger: 0.08,
        duration: 0.8,
        delay: 0.3,
        ease: 'expo.out',
      })
    }
    videoWrap.appendChild(loaderBg)
    gsap.set(loaderBg, { zIndex: 2 })
    gsap.to(loaderBg, {
      opacity: 1,
      duration: 1.8,
    })

    // Re-enable scroll after loader completes
    startLenis()

    // Recalculate on resize
    let resizeTimer
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(initScrollFlip, 100)
    })
  }

  // Skip loader entirely on reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    gsap.set(videoWrap, {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      width: '100vw',
      height: '100vh',
    })
    onLoaderComplete()
    return
  }

  const outDuration = 1.8
  const pulseDuration = 0.8

  // Pulse phase: infinite, stops at low point (0.85) once video is ready + min 1 cycle
  const pulse = gsap.fromTo(
    logoWrap,
    { scale: 0.85 },
    {
      scale: 1,
      duration: pulseDuration,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    }
  )

  let videoReady = false
  let cycles = 0

  // Track when video is actually loaded
  const onVideoReady = () => {
    videoReady = true
  }

  if (video.readyState >= 4) {
    onVideoReady()
  } else {
    video.addEventListener('canplaythrough', onVideoReady, { once: true })
  }

  // Try to play video (don't gate readiness on play success)
  video.play().catch(() => {})

  // Absolute fallback
  setTimeout(() => {
    videoReady = true
  }, 5000)

  // Check at each direction change; only transition at low point (scale 0.85)
  pulse.eventCallback('onRepeat', () => {
    cycles += 0.5
    // Integer cycles = at scale 0.85 (low point)
    if (Number.isInteger(cycles) && cycles >= 1 && videoReady) {
      pulse.kill()
      startReveal()
    }
  })

  const startReveal = () => {
    const tl = gsap.timeline({ onComplete: onLoaderComplete })

    // Scale logo from 0.85 to 1
    tl.to(logoWrap, {
      scale: 1,
      duration: outDuration * 0.4,
      ease: 'power4.inOut',
    })

    // Clip-path reveal + logo outer scale out (parallel with logo scale)
    tl.fromTo(
      videoWrap,
      {
        clipPath:
          'polygon(96.779% 45.237%,96.779% 45.237%,97.868% 45.937%,98.715% 46.784%,99.32% 47.742%,99.683% 48.773%,99.804% 49.842%,99.683% 50.91%,99.32% 51.941%,98.715% 52.899%,97.868% 53.747%,96.779% 54.447%,9.073% 98.963%,9.073% 98.963%,7.839% 99.442%,6.581% 99.663%,5.335% 99.644%,4.137% 99.405%,3.024% 98.963%,2.032% 98.337%,1.198% 97.544%,0.556% 96.605%,0.145% 95.537%,0% 94.358%,0% 5.325%,0% 5.325%,0.145% 4.147%,0.556% 3.078%,1.198% 2.139%,2.032% 1.347%,3.024% 0.72%,4.137% 0.278%,5.335% 0.039%,6.581% 0.02%,7.839% 0.241%,9.073% 0.72%,96.779% 45.237%)',
      },
      {
        clipPath:
          'polygon(100% 0%,100% 0%,100% 0%,100% 0%,100% 0%,100% 0%,100% 0%,100% 0%,100% 100%,100% 100%,100% 100%,100% 100%,0% 100%,0% 100%,0% 100%,0% 100%,0% 100%,0% 100%,0% 100%,0% 100%,0% 100%,0% 100%,0% 100%,0% 0%,0% 0%,0% 0%,0% 0%,0% 0%,0% 0%,0% 0%,0% 0%,0% 0%,0% 0%,0% 0%,0% 0%,0% 0%,100% 0%)',
        width: '100vw',
        height: '100vh',
        duration: outDuration,
        ease: 'power3.inOut',
      },
      0
    )

    tl.to(
      logoWrapOuter,
      {
        scale: 65,
        //x: "35vw",
        //opacity: 0,
        duration: outDuration,
        ease: 'power4.inOut',
      },
      0
    )
  }
}

export function initHome() {
  initNewLoader()
}
