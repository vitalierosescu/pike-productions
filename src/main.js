;(() => {
  // =============================================
  // GSAP SETUP
  // =============================================
  gsap.registerPlugin(ScrollTrigger)

  // =============================================
  // CONFIG
  // =============================================
  const CONFIG = {
    breakpoints: {
      tablet: 991,
      mobileLandscape: 767,
      mobile: 478,
    },
    selectors: {
      // Add your selectors here
      // wrapper: '[data-el="wrapper"]',
    },
  }

  // =============================================
  // HELPERS
  // =============================================
  function debounce(fn, delay = 200) {
    let timeout
    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => fn(...args), delay)
    }
  }

  // =============================================
  // MODULES
  // =============================================

  // Add your feature modules here

  // =============================================
  // INIT
  // =============================================
  function init() {
    // Initialize your modules here
  }

  // =============================================
  // START
  // =============================================
  try {
    init()
  } catch (error) {
    console.error('[Main] Failed to initialize:', error)
  }
})()
