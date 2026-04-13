console.log('home')

import { stopLenis, startLenis } from '../global.js'

// ─── OLD LOADER ──────────────────────────────────────────────────────────────
const initOldLoader = () => {
  stopLenis()
  const logoWrap = document.querySelector('.loader__logo-wrap')
  const videoWrap = document.querySelector('.l-video-wrap')
  const video = document.querySelector('.l-video')
  const logoWrapOuter = document.querySelector('.l-logo-wrap')
  const wrapperElements = document.querySelectorAll("[data-flip-element='wrapper']")

  const heroContent = document.querySelector('.home--hero_content')
  gsap.set(heroContent, { opacity: 0 })

  if (!logoWrap || !video) return

  // Split and hide hero text immediately (before loader plays)
  const heroSplitTargets = []
  document.fonts.ready.then(() => {
    heroContent.querySelectorAll('[data-split]').forEach((el) => {
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
    gsap.to(video, { opacity: 1, duration: 1, delay: 0.2, ease: 'power2.out' })
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
      borderRadius: '0px',
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
      .to(video, { width: '100%', height: '100%', ease: 'none' }, 0)
      .to(heroContent, { opacity: 0, duration: 0.2, ease: 'none' }, 0)
  }

  function onLoaderComplete() {
    if (wrapperElements.length < 2 || !container) return

    const loaderBg = document.querySelector('.hero_bg')

    gsap.set(videoWrap, { clearProps: 'all' })
    gsap.set(logoWrap, { clearProps: 'all' })
    gsap.set(logoWrapOuter, { clearProps: 'all' })

    const loader = document.querySelector('[data-load-wrap]')
    if (loader) gsap.set(loader, { display: 'none' })

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

    initScrollFlip()
    ScrollTrigger.refresh()

    gsap.to(heroContent, {
      autoAlpha: 1,
      duration: 0.4,
      onComplete: () => startLenis(),
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
    gsap.to(loaderBg, { opacity: 1, duration: 1.8 })

    let resizeTimer
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(initScrollFlip, 100)
    })
  }

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

  const pulse = gsap.fromTo(
    logoWrap,
    { scale: 0.85 },
    { scale: 1, duration: pulseDuration, ease: 'sine.inOut', repeat: -1, yoyo: true }
  )

  let videoReady = false
  let cycles = 0

  const onVideoReady = () => {
    videoReady = true
  }
  if (video.readyState >= 4) {
    onVideoReady()
  } else {
    video.addEventListener('canplaythrough', onVideoReady, { once: true })
  }

  video.play().catch(() => {})
  setTimeout(() => {
    videoReady = true
  }, 5000)

  pulse.eventCallback('onRepeat', () => {
    cycles += 0.5
    if (Number.isInteger(cycles) && cycles >= 1 && videoReady) {
      pulse.kill()
      startReveal()
    }
  })

  const startReveal = () => {
    const tl = gsap.timeline({ onComplete: onLoaderComplete })

    tl.to(logoWrap, { scale: 1, duration: outDuration * 0.4, ease: 'power4.inOut' })

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

    tl.to(logoWrapOuter, { scale: 100, duration: outDuration, ease: 'power4.inOut' }, 0)
    tl.to('.loader__bg-bar', { scaleX: 1, duration: outDuration, ease: 'power3.inOut' }, 0)
  }
}

// ─── NEW LOADER ──────────────────────────────────────────────────────────────
// Improvements over initOldLoader:
// - Mobile video src via [data-video-src-mobile] on screens ≤479px
// - fonts.ready race condition fix (loaderCompleted flag)
// - fromTo on heroContent opacity so scroll-back-up on mobile works correctly
// - 'playing' event instead of 'canplaythrough' to handle low-power mode
// - [data-video-fallback] image shown after 4s if video never starts playing
// - resize debounce bumped from 100ms to 250ms
const initNewLoader = () => {
  stopLenis()
  const logoWrap = document.querySelector('.loader__logo-wrap')
  const videoWrap = document.querySelector('.l-video-wrap')
  const video = document.querySelector('.l-video')
  const logoWrapOuter = document.querySelector('.l-logo-wrap')
  const wrapperElements = document.querySelectorAll("[data-flip-element='wrapper']")

  const heroContent = document.querySelector('.home--hero_content')
  gsap.set(heroContent, { opacity: 0 })

  if (!logoWrap || !video) return

  // Split and hide hero text — guarded against fonts.ready/loader race condition
  let loaderCompleted = false
  const heroSplitTargets = []
  document.fonts.ready.then(() => {
    heroContent.querySelectorAll('[data-split]').forEach((el) => {
      const split = SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        linesClass: 'line',
      })
      if (!loaderCompleted) {
        gsap.set(split.lines, { yPercent: 110 })
      }
      heroSplitTargets.push(...split.lines)
    })

    if (loaderCompleted && heroSplitTargets.length) {
      gsap.to(heroSplitTargets, {
        yPercent: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: 'expo.out',
      })
    }
  })

  // Load video — mobile src on screens ≤479px if [data-video-src-mobile] is set
  const isMobile = window.innerWidth <= 479
  const mobileSrc = video.getAttribute('data-video-src-mobile')
  const src = isMobile && mobileSrc ? mobileSrc : video.getAttribute('data-video-src')
  if (src && !video.src) {
    video.muted = true
    video.playsInline = true
    video.src = src
  }

  // Reveal video only once it's actually playing frames (catches low-power mode).
  // Fallback image always fades in after 1s. Video fades in on top when playing.
  // If video never plays (low power mode / slow load), fallback stays visible.
  gsap.set(video, { opacity: 0 })
  const fallbackEl = document.querySelector('[data-video-fallback]')
  let videoStarted = false

  if (fallbackEl) {
    gsap.to(fallbackEl, { opacity: 1, duration: 0.5, delay: 1, ease: 'power2.out' })
  }

  const onVideoPlaying = () => {
    if (videoStarted) return
    videoStarted = true
    gsap.to(video, { opacity: 1, duration: 1, delay: 0.2, ease: 'power2.out' })
  }

  video.addEventListener('playing', onVideoPlaying, { once: true })
  if (!video.paused && video.readyState >= 2) onVideoPlaying()

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
      borderRadius: '0px',
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
      .to(video, { width: '100%', height: '100%', ease: 'none' }, 0)
      .fromTo(heroContent, { opacity: 1 }, { opacity: 0, duration: 0.2, ease: 'none' }, 0)
  }

  function onLoaderComplete() {
    loaderCompleted = true
    if (wrapperElements.length < 2 || !container) return

    const loaderBg = document.querySelector('.hero_bg')

    gsap.set(videoWrap, { clearProps: 'all' })
    gsap.set(logoWrap, { clearProps: 'all' })
    gsap.set(logoWrapOuter, { clearProps: 'all' })

    const loader = document.querySelector('[data-load-wrap]')
    if (loader) gsap.set(loader, { display: 'none' })

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

    initScrollFlip()
    ScrollTrigger.refresh()

    gsap.to(heroContent, {
      autoAlpha: 1,
      duration: 0.4,
      onComplete: () => startLenis(),
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
    gsap.to(loaderBg, { opacity: 1, duration: 1.8 })

    let resizeTimer
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(initScrollFlip, 250)
    })
  }

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

  const pulse = gsap.fromTo(
    logoWrap,
    { scale: 0.85 },
    { scale: 1, duration: pulseDuration, ease: 'sine.inOut', repeat: -1, yoyo: true }
  )

  let videoReady = false
  let cycles = 0

  const onVideoReady = () => {
    videoReady = true
  }
  if (video.readyState >= 4) {
    onVideoReady()
  } else {
    video.addEventListener('canplaythrough', onVideoReady, { once: true })
  }

  video.play().catch(() => {})
  setTimeout(() => {
    videoReady = true
  }, 5000)

  pulse.eventCallback('onRepeat', () => {
    cycles += 0.5
    const videoReadyAndMinCycle = Number.isInteger(cycles) && cycles >= 1 && videoReady
    const forcedAfterTwoRounds = cycles >= 2
    if (videoReadyAndMinCycle || forcedAfterTwoRounds) {
      pulse.kill()
      startReveal()
    }
  })

  const startReveal = () => {
    const tl = gsap.timeline({ onComplete: onLoaderComplete })

    tl.to(logoWrap, { scale: 1, duration: outDuration * 0.4, ease: 'power4.inOut' })

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

    tl.to(logoWrapOuter, { scale: 100, duration: outDuration, ease: 'power4.inOut' }, 0)
    tl.to('.loader__bg-bar', { scaleX: 1, duration: outDuration, ease: 'power3.inOut' }, 0)
  }
}

export function initHome() {

  //initOldLoader()
  initNewLoader()
}
