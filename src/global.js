console.log("Hello, global!");

gsap.registerPlugin(SplitText, ScrollTrigger);

let _lenis = null;
window.addEventListener("GSAPReady", (e) => { _lenis = e.detail?.lenis; });

function refreshScroll() {
  ScrollTrigger.refresh();
  if (_lenis) _lenis.resize();
}

const splitConfig = {
  lines: { duration: 0.8, stagger: 0.08 },
  words: { duration: 0.6, stagger: 0.06 },
  chars: { duration: 0.4, stagger: 0.01 }
}

document.querySelectorAll(".accordion_item").forEach((item, index) => {
  item.querySelector(".accordion_toggle_text-number").textContent = String(index + 1).padStart(2, "0");
});


const initParallax = () => {
  const mm = gsap.matchMedia()

  if (document.querySelector('.parallax-parent')) {
    mm.add('(min-width: 992px)', () => {
      // Animatie alleen op schermen groter dan 991px breed
      document
        .querySelectorAll('.parallax-parent')
        .forEach((parallaxParent) => {
          const parallaxImg = parallaxParent.querySelector('.parallax')

          if (parallaxImg) {
            const tl = gsap.timeline({
              defaults: {
                ease: 'none',
              },
              scrollTrigger: {
                trigger: parallaxParent,
                start: 'clamp(top bottom)',
                end: 'bottom top',
                scrub: true,
              },
            })

            tl.to(parallaxImg, {
              yPercent: 18,
            })
          }
        })
    })

    mm.add('(max-width: 991px)', () => {
      // Schakel animatie uit op tablet en kleiner
      document
        .querySelectorAll('.parallax-parent')
        .forEach((parallaxParent) => {
          const parallaxImg = parallaxParent.querySelector('.parallax')
          if (parallaxImg) gsap.set(parallaxImg, { clearProps: 'all' })
        })
    })
  }
}

function initMiniShowreelPlayer() {
  const openBtns = document.querySelectorAll("[data-mini-showreel-open]");
  if (!openBtns.length) return;

  // Settings
  var duration = 1;
  var ease = "expo.inOut";
  var zIndex = 40;

  let n = "", isOpen = false;
  let lb, pw, tg;
  let pwCss = "", lbZ = "", pwZ = "";

  const q = (sel, root = document) => root.querySelector(sel);

  const getLB = (name) => q(`[data-mini-showreel-lightbox="${name}"]`);
  const getPW = (name) => q(`[data-mini-showreel-player="${name}"]`);

  const safe = (t) => t.closest("[data-mini-showreel-safearea]") || q("[data-mini-showreel-safearea]", t) || t;

  const fit = (b, a) => {
    let w = b.width, h = w / a;
    if (h > b.height) { h = b.height; w = h * a; }
    return {
      left: b.left + (b.width - w) / 2,
      top: b.top + (b.height - h) / 2,
      width: w,
      height: h
    };
  };

  const rectFor = (t) => {
    const b = safe(t).getBoundingClientRect();
    const r = t.getBoundingClientRect();
    const a = r.width > 0 && r.height > 0 ? r.width / r.height : 16 / 9;
    return fit(b, a);
  };

  const place = (el, r) =>
    gsap.set(el, {
      position: "fixed",
      left: r.left,
      top: r.top,
      width: r.width,
      height: r.height,
      margin: 0,
      x: 0,
      y: 0
    });

  function setStatus(status) {
    if (!n) return;
    document.querySelectorAll(`[data-mini-showreel-lightbox="${n}"], [data-mini-showreel-player="${n}"]`).forEach((el) => el.setAttribute("data-mini-showreel-status", status));
  }

  function zOn() {
    lbZ = lb?.style.zIndex || "";
    pwZ = pw?.style.zIndex || "";
    if (lb) lb.style.zIndex = String(zIndex);
    if (pw) pw.style.zIndex = String(zIndex);
  }

  function zOff() {
    if (lb) lb.style.zIndex = lbZ;
    if (pw) pw.style.zIndex = pwZ;
  }

  function playFor(name) {
    const wrap = getPW(name);
    if (!wrap) return;

    const bunny = wrap.querySelector("[data-bunny-player-init]");
    const video = wrap.querySelector("video");
    if (!video) return;

    if (bunny) {
      const btn = bunny.querySelector('[data-player-control="play"], [data-player-control="playpause"]');
      if (btn && (video.paused || video.ended)) btn.click();
      return;
    }

    try { video.play(); } catch (_) { }
  }

  function stopFor(name) {
    const wrap = getPW(name);
    if (!wrap) return;

    const bunny = wrap.querySelector("[data-bunny-player-init]");
    const video = wrap.querySelector("video");
    if (!video) return;

    if (bunny) {
      const btn = bunny.querySelector('[data-player-control="pause"], [data-player-control="playpause"]');
      if (btn && (!video.paused && !video.ended)) btn.click();
    } else {
      try { video.pause(); } catch (_) { }
    }

    try { video.currentTime = 0; } catch (_) { }
  }

  function openBy(name) {
    if (!name || isOpen) return;

    lb = getLB(name);
    pw = getPW(name);
    if (!lb || !pw) return;

    tg = q("[data-mini-showreel-target]", lb);
    if (!tg) return;

    n = name;
    isOpen = true;

    pw.dataset.flipId = n;
    pwCss = pw.style.cssText || "";

    zOn();
    setStatus("active");
    playFor(n);

    const state = Flip.getState(pw);
    place(pw, rectFor(tg));

    Flip.from(state, {
      duration: duration,
      ease: ease,
      absolute: true,
      scale: false
    });
  }

  function closeBy(nameOrEmpty) {
    if (!isOpen || !pw) return;
    if (nameOrEmpty && nameOrEmpty !== n) return;

    stopFor(n);
    setStatus("not-active");

    const state = Flip.getState(pw);

    pw.style.cssText = pwCss;
    if (lb) lb.style.zIndex = String(zIndex);
    if (pw) pw.style.zIndex = String(zIndex);

    Flip.from(state, {
      duration: duration,
      ease: ease,
      absolute: true,
      scale: false,
      onComplete: () => {
        zOff();
        n = "";
        isOpen = false;
        lb = pw = tg = null;
        pwCss = "";
        lbZ = "";
        pwZ = "";
      }
    });
  }

  function onResize() {
    if (!isOpen || !pw || !tg) return;
    place(pw, rectFor(tg));
  }

  openBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openBy(btn.getAttribute("data-mini-showreel-open") || "");
    });
  });

  document.addEventListener("click", (e) => {
    const closeBtn = e.target.closest("[data-mini-showreel-close]");
    if (!closeBtn) return;
    e.preventDefault();
    closeBy(closeBtn.getAttribute("data-mini-showreel-close") || "");
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeBy("");
  });

  window.addEventListener("resize", onResize);
}

const initFaqLoadMore = () => {
  const ITEMS_PER_PAGE = 5;
  const wrapper = document.querySelector(".accordion_list.is-5-max");
  if (!wrapper) return;

  const items = [...wrapper.querySelectorAll(".accordion_item")];
  if (items.length <= ITEMS_PER_PAGE) return;

  let visible = ITEMS_PER_PAGE;

  // Hide items beyond the first batch
  items.forEach((item, i) => {
    if (i >= ITEMS_PER_PAGE) item.style.display = "none";
  });

  // Scope button to the FAQ section (avoid grabbing the projects load-more)
  const btn = wrapper.closest(".accordion_wrap")?.querySelector(".btn.is-load-more")
    || wrapper.parentElement?.querySelector(".btn.is-load-more");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const next = visible + ITEMS_PER_PAGE;
    items.forEach((item, i) => {
      if (i < next) item.style.display = "";
    });
    visible = next;
    if (visible >= items.length) btn.remove();
    refreshScroll();
  });
}

const initHeroParallax = () => {
  const hero = document.querySelector('[data-hero-target]');
  if (!hero) return
  const mm = gsap.matchMedia();
  mm.add("(min-width: 992px)", () => {
    const animateHero = () => {
      const tl = gsap.timeline({
        defaults: {
          ease: 'none',
        },
        scrollTrigger: {
          trigger: '[data-hero-trigger]',
          start: 'clamp(top 100%)',
          end: 'top top',
          scrub: true,
        },
      });

      tl.to(hero, {
        y: '35vh',
        filter: "brightness(30%)",
        ease: 'none'
      }, 0);

      tl.to('.home--hero_content', {
        y: '-25vh',
        ease: 'none'
      }, 0)

      gsap.set(hero, { filter: "brightness(100%)" })

    };

    animateHero();
  });
  // Remove animations on tablet and down
  mm.add("(max-width: 991px)", () => {
    gsap.set(hero, { clearProps: "all" });
    refreshScroll();
  });
}

function initPreviewFollower() {
  // Find every follower wrap
  const wrappers = document.querySelectorAll('[data-follower-wrap]');

  wrappers.forEach(wrap => {
    const collection = wrap.querySelector('[data-follower-collection]');
    const items = wrap.querySelectorAll('[data-follower-item]');
    const follower = wrap.querySelector('[data-follower-cursor]');
    const followerInner = wrap.querySelector('[data-follower-cursor-inner]');

    let prevIndex = null;
    let firstEntry = true;

    const offset = 100; // The animation distance in %
    const duration = 0.5; // The animation duration of all visual transforms
    const ease = 'power2.inOut';

    // Initialize follower position
    gsap.set(follower, { xPercent: -50, yPercent: -50 });

    // Quick setters for x/y
    const xTo = gsap.quickTo(follower, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(follower, 'y', { duration: 0.6, ease: 'power3' });
    xTo(window.innerWidth * 0.6)
    yTo(window.innerHeight * 0.35)
    // Move all followers on mousemove
    window.addEventListener('mousemove', e => {
      xTo(e.clientX);
      yTo(e.clientY);
    });

    // Enter/leave per item within this wrap
    items.forEach((item, index) => {
      item.addEventListener('mouseenter', () => {
        console.log('mouseenter')
        const forward = prevIndex === null || index > prevIndex;
        prevIndex = index;

        // animate out existing visuals
        follower.querySelectorAll('[data-follower-visual]').forEach(el => {
          gsap.killTweensOf(el);
          gsap.to(el, {
            yPercent: forward ? -offset : offset,
            duration,
            ease,
            overwrite: 'auto',
            onComplete: () => el.remove()
          });
        });

        // clone & insert new visual
        const visual = item.querySelector('[data-follower-visual]');
        if (!visual) return;
        const clone = visual.cloneNode(true);
        followerInner.appendChild(clone);

        // animate it in (unless it's the very first entry)
        if (!firstEntry) {
          gsap.fromTo(clone,
            { yPercent: forward ? offset : -offset },
            { yPercent: 0, duration, ease, overwrite: 'auto' }
          );
        } else {
          firstEntry = false;
        }
      });

      item.addEventListener('mouseleave', () => {
        const el = follower.querySelector('[data-follower-visual]');
        if (!el) return;
        gsap.killTweensOf(el);
        gsap.to(el, {
          yPercent: -offset,
          duration,
          ease,
          overwrite: 'auto',
          onComplete: () => el.remove()
        });
      });
    });

    // If pointer leaves the collection, clear any visuals
    collection.addEventListener('mouseleave', () => {
      follower.querySelectorAll('[data-follower-visual]').forEach(el => {
        gsap.killTweensOf(el);
        gsap.delayedCall(duration, () => el.remove());
      });
      firstEntry = true;
      prevIndex = null;
    });
  });
}

function initMaskTextScrollReveal() {
  document.querySelectorAll('[data-split="heading"]').forEach(heading => {
    // Find the split type, the default is 'lines'
    const type = heading.dataset.splitReveal || 'lines'
    const typesToSplit =
      type === 'lines' ? ['lines'] :
        type === 'words' ? ['lines', 'words'] :
          ['lines', 'words', 'chars']

    // Split the text
    SplitText.create(heading, {
      type: typesToSplit.join(', '), // split into required elements
      mask: 'lines', // wrap each line in an overflow:hidden div
      autoSplit: true,
      linesClass: 'line',
      wordsClass: 'word',
      charsClass: 'letter',
      onSplit: function (instance) {
        const targets = instance[type]
        const config = splitConfig[type]

        return gsap.from(targets, {
          yPercent: 110,
          stagger: parseInt(heading.dataset.stagger) || config.stagger,
          duration: parseInt(heading.dataset.duration) || config.duration,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: heading,
            start: 'clamp(top 80%)',
            once: true
          }
        });
      }
    })
  })

  document.querySelectorAll('[data-split="body"]').forEach(heading => {
    const type = 'lines'
    const typesToSplit = ['lines']

    // Split the text
    SplitText.create(heading, {
      type: typesToSplit.join(', '), // split into required elements
      mask: 'lines', // wrap each line in an overflow:hidden div
      autoSplit: true,
      linesClass: 'line',
      wordsClass: 'word',
      onSplit: function (instance) {
        const targets = instance[type]
        const config = splitConfig[type]

        return gsap.from(targets, {
          yPercent: 110,
          duration: config.duration,
          stagger: config.stagger,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: heading,
            start: 'clamp(top 80%)',
            once: true
          }
        });
      }
    })
  })
}

function initGlobalParallax() {
  const mm = gsap.matchMedia()

  mm.add(
    {
      isMobile: "(max-width:479px)",
      isMobileLandscape: "(max-width:767px)",
      isTablet: "(max-width:991px)",
      isDesktop: "(min-width:992px)"
    },
    (context) => {
      const { isMobile, isMobileLandscape, isTablet } = context.conditions

      const ctx = gsap.context(() => {
        document.querySelectorAll('[data-parallax="trigger"]').forEach((trigger) => {
          // Check if this trigger has to be disabled on smaller breakpoints
          const disable = trigger.getAttribute("data-parallax-disable") || "mobileLandscape"
          if (
            (disable === "mobile" && isMobile) ||
            (disable === "mobileLandscape" && isMobileLandscape) ||
            (disable === "tablet" && isTablet)
          ) {
            return
          }

          // Optional: you can target an element inside a trigger if necessary 
          const target = trigger.querySelector('[data-parallax="target"]') || trigger

          // Get the direction value to decide between xPercent or yPercent tween
          const direction = trigger.getAttribute("data-parallax-direction") || "vertical"
          const prop = direction === "horizontal" ? "xPercent" : "yPercent"

          // Get the scrub value, our default is 'true' because that feels nice with Lenis
          const scrubAttr = trigger.getAttribute("data-parallax-scrub")
          const scrub = scrubAttr ? parseFloat(scrubAttr) : true

          // Get the start position in % 
          const startAttr = trigger.getAttribute("data-parallax-start")
          const startVal = startAttr !== null ? parseFloat(startAttr) : 20

          // Get the end position in %
          const endAttr = trigger.getAttribute("data-parallax-end")
          const endVal = endAttr !== null ? parseFloat(endAttr) : -20

          // Get the start value of the ScrollTrigger
          const scrollStartRaw = trigger.getAttribute("data-parallax-scroll-start") || "top bottom"
          const scrollStart = `clamp(${scrollStartRaw})`

          // Get the end value of the ScrollTrigger  
          const scrollEndRaw = trigger.getAttribute("data-parallax-scroll-end") || "bottom top"
          const scrollEnd = `clamp(${scrollEndRaw})`

          gsap.fromTo(
            target,
            { [prop]: startVal },
            {
              [prop]: endVal,
              ease: "none",
              scrollTrigger: {
                trigger,
                start: scrollStart,
                end: scrollEnd,
                scrub,
              },
            }
          )
        })
      })

      return () => ctx.revert()
    }
  )
}

function initPreloader() {
  gsap.registerPlugin(CustomEase);
  CustomEase.create("loader", "0.65, 0.01, 0.05, 0.99");

  const wrap = document.querySelector("[data-load-wrap]");
  if (!wrap) return;

  const bg = document.querySelector("[data-load-bg]");
  const progressBar = wrap.querySelector("[data-load-progress]");
  const logo = wrap.querySelector(".loader__svg");
  const videoEl = document.querySelector('.scaling-video__wrapper')

  const resetTargets = Array.from(
    wrap.querySelectorAll('[data-load-reset]:not([data-load-text])')
  );


  // Main loader timeline
  const loadTimeline = gsap.timeline({
    defaults: {
      ease: "loader",
      duration: 3
    }
  })
    .set(wrap, { display: "block" })
    .to(progressBar, { scaleX: 1 })
    //.to(container, { autoAlpha: 0, duration: 0.5 })
    .to(progressBar, { scaleX: 0, transformOrigin: "right center", duration: 0.5 })
    .to(bg, { opacity: 0, duration: .3 }, '<')
    .to(videoEl, {
      maskSize: "300vw 375vw",
      duration: 2,
      ease: "power3.inOut",
    })
    .to(logo, {
      scale: 60, // way bigger than viewport
      duration: 2,
      ease: "power3.inOut",
    }, '<')
    .set(wrap, { display: "none" })
    .set(videoEl, { mask: "none" })


  // If there are items to hide FOUC for, reset them at the start
  if (resetTargets.length) {
    loadTimeline.set(resetTargets, { autoAlpha: 1 }, 0);
  }
}

function initVideoPlayback() {
  const wrappers = document.querySelectorAll('[data-video-on-hover], [data-video-playpause-scroll]');
  console.log(`[VideoPlayback] Found ${wrappers.length} wrapper(s)`);

  wrappers.forEach((wrapper, i) => {
    const src = wrapper.getAttribute('data-video-src') || '';
    if (!src) {
      console.warn(`[VideoPlayback] Wrapper ${i}: no data-video-src, skipping`);
      return;
    }

    // Create video element (lazy — not in DOM by default)
    const video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 0.3s ease;';
    //wrapper.style.position = 'relative';
    wrapper.appendChild(video);

    const loadVideo = () => {
      if (!video.src) {
        video.src = src;
        console.log(`[VideoPlayback] Wrapper ${i}: src set`);
      }
    };

    // Hover mode
    if (wrapper.hasAttribute('data-video-on-hover')) {
      const trigger =
        wrapper.closest('[data-video-on-hover-trigger]') ||
        wrapper.parentElement ||
        wrapper;
      console.log(`[VideoPlayback] Wrapper ${i}: hover mode`);

      trigger.addEventListener('mouseenter', () => {
        loadVideo();
        wrapper.dataset.videoOnHover = 'active';
        video.play().then(() => {
          video.style.opacity = '1';
        }).catch(err => console.warn(`[VideoPlayback] Wrapper ${i}: play blocked:`, err));
      });

      trigger.addEventListener('mouseleave', () => {
        wrapper.dataset.videoOnHover = 'not-active';
        video.style.opacity = '0';
        setTimeout(() => {
          video.pause();
          video.currentTime = 0;
        }, 200);
      });
    }

    // Scroll mode
    if (wrapper.hasAttribute('data-video-playpause-scroll')) {
      console.log(`[VideoPlayback] Wrapper ${i}: scroll mode`);

      ScrollTrigger.create({
        trigger: wrapper,
        start: '0% 100%',
        end: '100% 0%',
        onEnter: () => { loadVideo(); video.play(); video.style.opacity = '1'; },
        onEnterBack: () => { video.play(); video.style.opacity = '1'; },
        onLeave: () => { video.style.opacity = '0'; video.pause(); },
        onLeaveBack: () => { video.style.opacity = '0'; video.pause(); },
      });
    }
  });
}

const initFaq = () => {
  document.querySelectorAll(".accordion_wrap").forEach((component, listIndex) => {
    if (component.dataset.scriptInitialized) return;
    component.dataset.scriptInitialized = "true";

    const closePrevious = component.getAttribute("data-close-previous") !== "false";
    const closeOnSecondClick = component.getAttribute("data-close-on-second-click") !== "false";
    const openOnHover = component.getAttribute("data-open-on-hover") === "true";
    const openByDefault = component.getAttribute("data-open-by-default") !== null && !isNaN(+component.getAttribute("data-open-by-default")) ? +component.getAttribute("data-open-by-default") : false;
    const list = component.querySelector(".accordion_list");
    let previousIndex = null,
      closeFunctions = [];

    function removeCMSList(slot) {
      const dynList = Array.from(slot.children).find((child) => child.classList.contains("w-dyn-list"));
      if (!dynList) return;
      const nestedItems = dynList?.firstElementChild?.children;
      if (!nestedItems) return;
      const staticWrapper = [...slot.children];
      [...nestedItems].forEach(el => el.firstElementChild && slot.appendChild(el.firstElementChild));
      staticWrapper.forEach((el) => el.remove());
    }
    removeCMSList(list);

    component.querySelectorAll(".accordion_component").forEach((card, cardIndex) => {
      const button = card.querySelector(".accordion_toggle_button");
      const content = card.querySelector(".accordion_content_wrap");
      const icon = card.querySelector(".accordion_toggle_icon");
      const iconSvg = card.querySelector(".accordion_toggle_svg.is-vertical");


      if (!button || !content || !icon) return console.warn("Missing elements:", card);

      button.setAttribute("aria-expanded", "false");
      button.setAttribute("id", "accordion_button_" + listIndex + "_" + cardIndex);
      content.setAttribute("id", "accordion_content_" + listIndex + "_" + cardIndex);
      button.setAttribute("aria-controls", content.id);
      content.setAttribute("aria-labelledby", button.id);
      content.style.display = "none";

      const refresh = () => {
        tl.invalidate();
        if (typeof ScrollTrigger !== "undefined") refreshScroll();
      };
      const tl = gsap.timeline({ paused: true, defaults: { duration: 0.3, ease: "power1.inOut" }, onComplete: refresh, onReverseComplete: refresh });
      tl.set(content, { display: "block" });
      tl.fromTo(content, { height: 0 }, { height: "auto" });
      tl.fromTo(iconSvg, { rotate: 0 }, { rotate: -90 }, "<");

      const closeAccordion = () => card.classList.contains("is-opened") && (card.classList.remove("is-opened"), tl.reverse(), button.setAttribute("aria-expanded", "false"));
      closeFunctions[cardIndex] = closeAccordion;

      const openAccordion = (instant = false) => {
        if (closePrevious && previousIndex !== null && previousIndex !== cardIndex) closeFunctions[previousIndex]?.();
        previousIndex = cardIndex;
        button.setAttribute("aria-expanded", "true");
        card.classList.add("is-opened");
        instant ? tl.progress(1) : tl.play();
      };
      if (openByDefault === cardIndex + 1) openAccordion(true);

      button.addEventListener("click", () => (card.classList.contains("is-opened") && closeOnSecondClick ? (closeAccordion(), (previousIndex = null)) : openAccordion()));
      if (openOnHover) button.addEventListener("mouseenter", () => openAccordion());
    });
  });
}

function animateFooterLogoOnScroll() {
  let logoPaths = document.querySelectorAll(".footer_logo-link path");

  gsap.fromTo(
    logoPaths,
    {
      scale: 0,
    },
    {
      scale: 1,
      stagger: 0.015,
      ease: "back.out(3)",
      duration: 0.8,
      scrollTrigger: {
        trigger: ".footer_logo-link",
        start: "top 95%",
        toggleActions: "play reset play none"
      }
    }
  );
}

const initLink = () => {
  CustomEase.create("underline", "0.625, 0.05, 0, 1");

  document.querySelectorAll(".link").forEach((link, i) => {
    const line = link.querySelector(".link_line");

    const lineDuration = 0.8;

    // Scroll entrance
    const enterTl = gsap.timeline({
      scrollTrigger: {
        trigger: link,
        start: "top 95%",
        toggleActions: "play none none none",
      },
      defaults: { duration: 0.8, delay: 0.2, ease: "power2.out" },
    });

    enterTl.fromTo(
      line,
      { scaleX: 0, transformOrigin: "left" },
      { scaleX: 1, duration: lineDuration, ease: "underline" },
      "<"
    );

  });
};

function initHighlightText() {

  let splitHeadingTargets = document.querySelectorAll("[data-highlight-text]")
  splitHeadingTargets.forEach((heading) => {

    const scrollStart = heading.getAttribute("data-highlight-scroll-start") || "top 90%"
    const scrollEnd = heading.getAttribute("data-highlight-scroll-end") || "center 40%"
    const fadedValue = heading.getAttribute("data-highlight-fade") || 0.2 // Opacity of letter
    const staggerValue = heading.getAttribute("data-highlight-stagger") || 0.1 // Smoother reveal

    new SplitText(heading, {
      type: "words, chars",
      autoSplit: true,
      onSplit(self) {
        let ctx = gsap.context(() => {
          let tl = gsap.timeline({
            scrollTrigger: {
              scrub: true,
              trigger: heading,
              start: scrollStart,
              end: scrollEnd,
            }
          })
          tl.from(self.chars, {
            autoAlpha: fadedValue,
            stagger: staggerValue,
            ease: "linear"
          })
        });
        return ctx; // return our animations so GSAP can clean them up when onSplit fires
      }
    });
  });
}

/*
const initHomeLoader = () => {
CustomEase.create('vitalie-ease', '0.65, 0.01, 0.05, 0.99')

let mm = gsap.matchMedia()

// store elements
let logoToFlip = document.querySelector('.nav_logo.to-flip')
let videoToFlip = document.querySelector('.home-load_video-parent')
let videoDestination = document.querySelector('.scaling-element__small-box')
let menuIconToFlip = document.querySelector('.home-load_icon-wrap')

gsap.defaults({ ease: 'vitalie-ease', duration: 1 })
const tl = gsap.timeline()

tl.from(logoToFlip, {
  y: '100%',
})
tl.from(
  menuIconToFlip,
  {
    y: '100%',
    rotate: '360deg',
  },
  '<'
)
gsap.set('.nav_logo_svg-wrap', { yPercent: -100 })
gsap.set('.scaling-element__bg', { opacity: 0 })

tl.from('.home-load_video-wrap', {
  delay: .6,
  width: '0rem',
  onComplete: () => {
    moveVideoInto(videoDestination)
    gsap.to('.nav_logo-svg.is--left', { yPercent: 110, duration: .9, ease: 'vitalie-ease' })
    gsap.to('.nav_logo-svg.is--right', { yPercent: -110, duration: .9, delay: .1, ease: "vitalie-ease" })

    gsap.to('.nav_logo_svg-wrap', { yPercent: 0, duration: .6, delay: 1.2, ease: "vitalie-ease" })

    gsap.to('.scaling-element__bg', { opacity: 1, duration: 1.5, delay: 1.2, ease: "vitalie-ease" })

  },
}, 0)
.to('.nav_logo.is--left', {
  delay: .6,
  x: '-1rem'
}, 0)
.to('.nav_logo.is--right', {
  delay: .6,
  x: '1rem'
}, 0)
.from('.menu-button-text', {
  y: '100%',
  delay: 1.2,
})
.set('.hero_bg', {display: "none"})

// move video
function moveVideoInto(element) {
  let state = Flip.getState(videoToFlip)
  element.appendChild(videoToFlip)
  Flip.from(state, {
    duration: 1.5,
    delay: .3,
    absoluteOnLeave: true,
  })
}
}
*/

const initLogos = () => {
  const items = gsap.utils.toArray('[data-logo-wall-item]');
  const firstImgs = items.map(el => el.querySelectorAll('.logo-cycle_img')[0]);
  const secondImgs = items.map(el => el.querySelectorAll('.logo-cycle_img')[1]);

  gsap.set(firstImgs, { opacity: 0, yPercent: -80 });
  gsap.set(secondImgs, { opacity: 0, yPercent: -80 });

  function cycle() {
    const tl = gsap.timeline({ onComplete: cycle });

    tl.to(firstImgs, { opacity: 0, yPercent: 80, stagger: 0.12, duration: 0.8, ease: 'power3.in' })
      .to(secondImgs, { opacity: 1, yPercent: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out' }, '<+=0.6')
      .set(firstImgs, { opacity: 0, yPercent: -80 })

      .to({}, { duration: .8 })

      .to(secondImgs, { opacity: 0, yPercent: 80, stagger: 0.12, duration: 0.8, ease: 'power3.in' })
      .to(firstImgs, { opacity: 1, yPercent: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out' }, '<+=0.6')
      .set(secondImgs, { opacity: 0, yPercent: -80 })

      .to({}, { duration: .8 });
  }

  function enter() {
    gsap.to(firstImgs, {
      opacity: 1, yPercent: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out',
      onComplete: () => {
        gsap.delayedCall(.8, cycle);
      }
    });
  }

  ScrollTrigger.create({
    trigger: '.logo-cycle_list-wrap',
    start: 'top bottom',
    once: true,
    onEnter: enter,
  });
};

function initCursor() {
  function initFollower() {
    let follower = document.querySelector(".cursor");
    if (!follower) return;
    let targetX = 0,
      targetY = 0;
    let currentX = 0,
      currentY = 0;
    let velocityX = 0,
      velocityY = 0;
    let lastY = 0;
    let rotation = 0;

    function lerp(start, end, factor) {
      return (1 - factor) * start + factor * end;
    }

    const stiffness = 0.1;
    const damping = 0.55;
    const rotationSensitivity = 0.05;

    function animate() {
      let dx = targetX - currentX;
      let dy = targetY - currentY;

      // Calculate velocity
      velocityX += dx * stiffness;
      velocityY += dy * stiffness;

      // Apply damping
      velocityX *= damping;
      velocityY *= damping;

      // Update current position
      currentX += velocityX;
      currentY += velocityY;

      let speedY = targetY - lastY;

      if (Math.abs(speedY) > 0.2) {
        rotation = Math.max(
          Math.min(rotation + speedY * (rotationSensitivity * -1), 90),
          -90
        );
      } else {
        rotation = lerp(rotation, 0, 0.06);
      }

      follower.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg)`;

      lastY = targetY;

      requestAnimationFrame(animate);
    }
    animate();

    document.addEventListener("pointermove", (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    });

    document.querySelectorAll("[data-cursor]").forEach((element) => {
      element.addEventListener("mouseenter", function () {
        const cursorWrapper = document.querySelector(".cursor-item");
        if (cursorWrapper) {
          cursorWrapper.style.display = "flex";
        }
        const cursorText = this.getAttribute("data-cursor");
        if (cursorText) {
          const cursorTextElement = document.querySelector("[data-cursor-text]");
          if (cursorTextElement) {
            cursorTextElement.textContent = cursorText;
          }
        }
      });

      element.addEventListener("mouseleave", function () {
        const cursorWrapper = document.querySelector(".cursor-item");
        if (cursorWrapper) {
          cursorWrapper.style.display = "";
        }
      });
    });
  }
  initFollower()
}


const initProjectsLoadMore = () => {
  const ITEMS_PER_PAGE = 3;
  const MOBILE_BP = 767;
  const component = document.querySelector(".home--projects_component");
  if (!component) return;

  const items = [...component.querySelectorAll(".home--projects_item")];
  if (items.length <= ITEMS_PER_PAGE) return;

  const btn = component.querySelector(".btn.is-load-more");
  if (!btn) return;

  let visible = ITEMS_PER_PAGE;
  let active = false;

  function apply() {
    items.forEach((item, i) => {
      item.style.display = i >= visible ? "none" : "";
    });
    btn.style.display = visible >= items.length ? "none" : "";
    active = true;
  }

  function reset() {
    items.forEach((item) => { item.style.display = ""; });
    btn.style.display = "none";
    visible = ITEMS_PER_PAGE;
    active = false;
  }

  const mql = window.matchMedia(`(max-width: ${MOBILE_BP}px)`);

  function onChange(e) {
    if (e.matches) {
      apply();
    } else {
      reset();
    }
    refreshScroll();
  }

  mql.addEventListener("change", onChange);
  if (mql.matches) apply();

  btn.addEventListener("click", () => {
    const next = visible + ITEMS_PER_PAGE;
    items.forEach((item, i) => {
      if (i < next) item.style.display = "";
    });
    visible = next;
    if (visible >= items.length) btn.style.display = "none";
    refreshScroll();
  });
};

export function initGlobal() {
  initLogos()
  initGlobalParallax()
  initVideoPlayback()
  initFaq()
  animateFooterLogoOnScroll()
  initCursor()

  initLink()

  initHighlightText();
  initPreviewFollower()
  initHeroParallax()

  document.fonts.ready.then(function () {
    initMaskTextScrollReveal()
  });

  initMiniShowreelPlayer()

  initFaqLoadMore()
  initProjectsLoadMore()
}