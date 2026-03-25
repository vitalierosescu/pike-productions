import { initHome } from './pages/home.js'
import { initAbout } from './pages/about.js'
import { initCaseDetail } from './pages/caseDetail.js'
import { initCaseOverview } from './pages/caseOverview.js'
import { initContact } from './pages/contact.js'
import { initGlobal } from './global.js'  
import {initNav} from './nav.js'

;(() => {
  // =============================================
  // GSAP SETUP
  // =============================================
  gsap.registerPlugin(ScrollTrigger, Flip);

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
      pageWrapper: '.page-wrap',
    },
  }

  // =============================================
  // INIT
  // =============================================
  function init() {
    const page = document.querySelector(CONFIG.selectors.pageWrapper)
    if (!page) return

    if (page.classList.contains('is-home')) initHome()
    if (page.classList.contains('is-about')) initAbout()
    if (page.classList.contains('is-case-detail')) initCaseDetail()
    if (page.classList.contains('is-case-overview')) initCaseOverview()
    if (page.classList.contains('is-contact')) initContact()

      initNav()
      initGlobal()
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
