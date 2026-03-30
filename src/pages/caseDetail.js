import { debounce } from '../utils/debounce.js'

function initDraggableMarquee() {
  const wrappers = document.querySelectorAll('[data-draggable-marquee-init]')

  const getNumberAttr = (el, name, fallback) => {
    const value = parseFloat(el.getAttribute(name))
    return Number.isFinite(value) ? value : fallback
  }

  wrappers.forEach((wrapper) => {
    if (wrapper.getAttribute('data-draggable-marquee-init') === 'initialized') return

    const collection = wrapper.querySelector('[data-draggable-marquee-collection]')
    const list = wrapper.querySelector('[data-draggable-marquee-list]')
    if (!collection || !list) return

    const duration = getNumberAttr(wrapper, 'data-duration', 20)
    const multiplier = getNumberAttr(wrapper, 'data-multiplier', 40)
    const sensitivity = getNumberAttr(wrapper, 'data-sensitivity', 0.01)

    const wrapperWidth = wrapper.getBoundingClientRect().width
    const listWidth = list.scrollWidth || list.getBoundingClientRect().width
    if (!wrapperWidth || !listWidth) return

    // Make enough duplicates to cover screen
    const minRequiredWidth = wrapperWidth + listWidth + 2
    while (collection.scrollWidth < minRequiredWidth) {
      const listClone = list.cloneNode(true)
      listClone.setAttribute('data-draggable-marquee-clone', '')
      listClone.setAttribute('aria-hidden', 'true')
      collection.appendChild(listClone)
    }

    const wrapX = gsap.utils.wrap(-listWidth, 0)

    gsap.set(collection, { x: 0 })

    const marqueeLoop = gsap.to(collection, {
      x: -listWidth,
      duration,
      ease: 'none',
      repeat: -1,
      onReverseComplete: () => marqueeLoop.progress(1),
      modifiers: {
        x: (x) => wrapX(parseFloat(x)) + 'px',
      },
    })

    // Direction can be used for css + set initial direction on load
    const initialDirectionAttr = (wrapper.getAttribute('data-direction') || 'left').toLowerCase()
    const baseDirection = initialDirectionAttr === 'right' ? -1 : 1

    const timeScale = { value: 1 }

    timeScale.value = baseDirection
    wrapper.setAttribute('data-direction', baseDirection < 0 ? 'right' : 'left')

    if (baseDirection < 0) marqueeLoop.progress(1)

    function applyTimeScale() {
      marqueeLoop.timeScale(timeScale.value)
      wrapper.setAttribute('data-direction', timeScale.value < 0 ? 'right' : 'left')
    }

    applyTimeScale()

    // Click-hold clip-path effect
    const items = collection.querySelectorAll('.draggable-marquee__item')
    const clipDefault = 'inset(0% round 0rem)'
    const clipPressed = 'inset(5% round 1rem)'

    gsap.set(items, { clipPath: clipDefault })

    wrapper.addEventListener('pointerdown', () => {
      gsap.to(items, {
        clipPath: clipPressed,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    })

    const releaseClip = () => {
      gsap.to(items, {
        clipPath: clipDefault,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }

    wrapper.addEventListener('pointerup', releaseClip)
    wrapper.addEventListener('pointerleave', releaseClip)

    // Drag observer
    const marqueeObserver = Observer.create({
      target: wrapper,
      type: 'pointer,touch',
      preventDefault: true,
      debounce: false,
      onChangeX: (observerEvent) => {
        let velocityTimeScale = observerEvent.velocityX * -sensitivity
        velocityTimeScale = gsap.utils.clamp(-multiplier, multiplier, velocityTimeScale)

        gsap.killTweensOf(timeScale)

        const restingDirection = velocityTimeScale < 0 ? -1 : 1

        gsap
          .timeline({ onUpdate: applyTimeScale })
          .to(timeScale, { value: velocityTimeScale, duration: 0.1, overwrite: true })
          .to(timeScale, { value: restingDirection, duration: 1.0 })
      },
    })

    // Pause marquee when scrolled out of view
    ScrollTrigger.create({
      trigger: wrapper,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => {
        marqueeLoop.resume()
        applyTimeScale()
        marqueeObserver.enable()
      },
      onEnterBack: () => {
        marqueeLoop.resume()
        applyTimeScale()
        marqueeObserver.enable()
      },
      onLeave: () => {
        marqueeLoop.pause()
        marqueeObserver.disable()
      },
      onLeaveBack: () => {
        marqueeLoop.pause()
        marqueeObserver.disable()
      },
    })

    wrapper.setAttribute('data-draggable-marquee-init', 'initialized')
  })
}

function initBunnyPlayers() {
  if (!window._bunnyPlayers) window._bunnyPlayers = []

  function initBunnyPlayer(container) {
    if (!container) {
      container = document.querySelector('body')
    }

    container.querySelectorAll('[data-bunny-player-init]').forEach(function (player) {
      var src = player.getAttribute('data-player-src')
      if (!src) return

      var video = player.querySelector('video')
      if (!video) return

      var playerEntry = { player: player, video: video, play: null, pause: null }
      window._bunnyPlayers.push(playerEntry)

      video.addEventListener('play', function () {
        window._bunnyPlayers.forEach(function (entry) {
          if (entry.video !== video && !entry.video.paused) {
            entry.video.pause()
          }
        })
      })

      function setStatus(s) {
        if (player.getAttribute('data-player-status') !== s) {
          player.setAttribute('data-player-status', s)
        }
      }

      function setMutedState(v) {
        video.muted = !!v
        player.setAttribute('data-player-muted', video.muted ? 'true' : 'false')
      }

      function setFsAttr(v) {
        player.setAttribute('data-player-fullscreen', v ? 'true' : 'false')
      }

      function setActivated(v) {
        player.setAttribute('data-player-activated', v ? 'true' : 'false')
      }
      if (!player.hasAttribute('data-player-activated')) setActivated(false)

      var timeline = player.querySelector('[data-player-timeline]')
      var progressBar = player.querySelector('[data-player-progress]')
      var bufferedBar = player.querySelector('[data-player-buffered]')
      var handle = player.querySelector('[data-player-timeline-handle]')
      var timeDurationEls = player.querySelectorAll('[data-player-time-duration]')
      var timeProgressEls = player.querySelectorAll('[data-player-time-progress]')

      var updateSize = player.getAttribute('data-player-update-size')
      var lazyMode = player.getAttribute('data-player-lazy')
      var isLazyTrue = lazyMode === 'true'
      var isLazyMeta = lazyMode === 'meta'
      var autoplay = player.getAttribute('data-player-autoplay') === 'true'
      var initialMuted = player.getAttribute('data-player-muted') === 'true'

      var pendingPlay = false

      if (autoplay) {
        setMutedState(true)
        isLazyTrue = false
        isLazyMeta = false
      } else {
        setMutedState(initialMuted)
      }

      function pad2(n) {
        return (n < 10 ? '0' : '') + n
      }

      function formatTime(sec) {
        if (!isFinite(sec) || sec < 0) return '00:00'
        var s = Math.floor(sec)
        var h = Math.floor(s / 3600)
        var m = Math.floor((s % 3600) / 60)
        var r = s % 60
        if (h > 0) return h + ':' + pad2(m) + ':' + pad2(r)
        return pad2(m) + ':' + pad2(r)
      }

      function setText(nodes, text) {
        nodes.forEach(function (n) {
          n.textContent = text
        })
      }

      function setBeforeRatio(w, h) {
        if (updateSize !== 'true' || !w || !h) return
        var before = player.querySelector('[data-player-before]')
        if (!before) return
        before.style.paddingTop = (h / w) * 100 + '%'
      }

      function fetchMetaOnce() {
        if (window.Hls && Hls.isSupported()) {
          try {
            var tmp = new Hls()
            var gotRatio = false,
              gotDuration = false,
              dur = 0

            tmp.on(Hls.Events.MANIFEST_PARSED, function (e, data) {
              var lvls = (data && data.levels) || tmp.levels || []
              if (lvls.length) {
                var best = lvls.reduce(function (a, b) {
                  return (b.width || 0) > (a.width || 0) ? b : a
                }, lvls[0])
                if (best.width && best.height) {
                  setBeforeRatio(best.width, best.height)
                  gotRatio = true
                }
              }
            })

            tmp.on(Hls.Events.LEVEL_LOADED, function (e, data) {
              if (data && data.details && isFinite(data.details.totalduration)) {
                dur = data.details.totalduration
                gotDuration = true
                if (timeDurationEls.length) setText(timeDurationEls, formatTime(dur))
              }
            })

            tmp.on(Hls.Events.ERROR, function () {
              try {
                tmp.destroy()
              } catch (_) {}
            })

            tmp.on(Hls.Events.LEVEL_LOADED, function () {
              if (
                !pendingPlay &&
                player.getAttribute('data-player-activated') !== 'true' &&
                player.getAttribute('data-player-status') === 'idle' &&
                (gotRatio || gotDuration)
              ) {
                setStatus('ready')
              }
              try {
                tmp.destroy()
              } catch (_) {}
            })

            tmp.loadSource(src)
          } catch (_) {}
          return
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          var prevPreload = video.preload
          video.preload = 'metadata'
          var onMeta = function () {
            setBeforeRatio(video.videoWidth, video.videoHeight)
            if (timeDurationEls.length) setText(timeDurationEls, formatTime(video.duration))
            if (
              !pendingPlay &&
              player.getAttribute('data-player-activated') !== 'true' &&
              player.getAttribute('data-player-status') === 'idle'
            ) {
              setStatus('ready')
            }
            if (!autoplay) {
              try {
                video.removeAttribute('src')
                video.load()
              } catch (_) {}
            } else {
              video.preload = prevPreload || ''
            }
            video.removeEventListener('loadedmetadata', onMeta)
          }
          video.addEventListener('loadedmetadata', onMeta, { once: true })
          video.src = src
        }
      }

      if (updateSize === 'true' && !isLazyMeta) {
        if (window.Hls && Hls.isSupported()) {
          try {
            var tmp2 = new Hls()
            tmp2.on(Hls.Events.MANIFEST_PARSED, function (e, data) {
              var lvls = (data && data.levels) || tmp2.levels || []
              if (lvls.length) {
                var best = lvls.reduce(function (a, b) {
                  return (b.width || 0) > (a.width || 0) ? b : a
                }, lvls[0])
                setBeforeRatio(best.width || 0, best.height || 0)
              }
              try {
                tmp2.destroy()
              } catch (_) {}
            })
            tmp2.on(Hls.Events.ERROR, function () {
              try {
                tmp2.destroy()
              } catch (_) {}
            })
            tmp2.loadSource(src)
          } catch (_) {}
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          var prev = video.preload
          video.preload = 'metadata'
          var onMeta2 = function () {
            setBeforeRatio(video.videoWidth, video.videoHeight)
            video.removeEventListener('loadedmetadata', onMeta2)
            if (isLazyTrue) {
              try {
                video.removeAttribute('src')
                video.load()
              } catch (_) {}
            } else {
              video.preload = prev || ''
            }
          }
          video.addEventListener('loadedmetadata', onMeta2, { once: true })
          video.src = src
        }
      }

      var isAttached = false

      function attachMediaOnce() {
        if (isAttached) return
        isAttached = true

        if (player._hls) {
          try {
            player._hls.destroy()
          } catch (_) {}
          player._hls = null
        }

        if (window.Hls && Hls.isSupported()) {
          var hls = new Hls({ maxBufferLength: 10 })
          hls.attachMedia(video)
          hls.on(Hls.Events.MEDIA_ATTACHED, function () {
            hls.loadSource(src)
          })
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            if (
              !pendingPlay &&
              player.getAttribute('data-player-activated') !== 'true' &&
              player.getAttribute('data-player-status') === 'idle'
            ) {
              setStatus('ready')
            }
            if (updateSize === 'true') {
              var lvls = hls.levels || []
              if (lvls.length) {
                var best = lvls.reduce(function (a, b) {
                  return (b.width || 0) > (a.width || 0) ? b : a
                }, lvls[0])
                setBeforeRatio(best.width || 0, best.height || 0)
              }
            }
            if (autoplay) attemptAutoplay()
          })
          player._hls = hls
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.preload = isLazyTrue ? 'none' : isLazyMeta ? 'metadata' : video.preload
          video.src = src
          video.addEventListener(
            'loadedmetadata',
            function () {
              if (
                !pendingPlay &&
                player.getAttribute('data-player-activated') !== 'true' &&
                player.getAttribute('data-player-status') === 'idle'
              ) {
                setStatus('ready')
              }
              if (updateSize === 'true') setBeforeRatio(video.videoWidth, video.videoHeight)
              if (autoplay) attemptAutoplay()
            },
            { once: true }
          )
        }
      }

      function attemptAutoplay() {
        var p = video.play()
        if (p && typeof p.then === 'function') p.catch(function () {})
      }

      if (autoplay) {
        attachMediaOnce()
      } else if (isLazyMeta) {
        fetchMetaOnce()
        video.preload = 'none'
      } else if (isLazyTrue) {
        video.preload = 'none'
      } else {
        attachMediaOnce()
      }

      function triggerPlay() {
        if (video.paused || video.ended) {
          if ((isLazyTrue || isLazyMeta) && !isAttached) attachMediaOnce()
          pendingPlay = true
          setMutedState(true)
          var p = video.play()
          if (p && typeof p.then === 'function') p.catch(function () {})
        }
      }

      function triggerPause() {
        if (!video.paused) {
          video.pause()
        }
      }

      playerEntry.play = triggerPlay
      playerEntry.pause = triggerPause

      function togglePlay() {
        if (video.paused || video.ended) {
          if ((isLazyTrue || isLazyMeta) && !isAttached) attachMediaOnce()
          pendingPlay = true
          var p = video.play()
          if (p && typeof p.then === 'function') p.catch(function () {})
        } else {
          video.pause()
        }
      }

      function toggleMute() {
        setMutedState(!video.muted)
      }

      function isFsActive() {
        return !!(document.fullscreenElement || document.webkitFullscreenElement)
      }

      function enterFullscreen() {
        if (player.requestFullscreen) return player.requestFullscreen()
        if (video.requestFullscreen) return video.requestFullscreen()
        if (video.webkitSupportsFullscreen && typeof video.webkitEnterFullscreen === 'function')
          return video.webkitEnterFullscreen()
      }

      function exitFullscreen() {
        if (document.exitFullscreen) return document.exitFullscreen()
        if (document.webkitExitFullscreen) return document.webkitExitFullscreen()
        if (video.webkitDisplayingFullscreen && typeof video.webkitExitFullscreen === 'function')
          return video.webkitExitFullscreen()
      }

      function toggleFullscreen() {
        if (isFsActive() || video.webkitDisplayingFullscreen) exitFullscreen()
        else enterFullscreen()
      }
      document.addEventListener('fullscreenchange', function () {
        setFsAttr(isFsActive())
      })
      document.addEventListener('webkitfullscreenchange', function () {
        setFsAttr(isFsActive())
      })
      video.addEventListener('webkitbeginfullscreen', function () {
        setFsAttr(true)
      })
      video.addEventListener('webkitendfullscreen', function () {
        setFsAttr(false)
      })

      player.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-player-control]')
        if (!btn || !player.contains(btn)) return
        var type = btn.getAttribute('data-player-control')
        if (type === 'play' || type === 'pause' || type === 'playpause') togglePlay()
        else if (type === 'mute') toggleMute()
        else if (type === 'fullscreen') toggleFullscreen()
      })

      function updateTimeTexts() {
        if (timeDurationEls.length) setText(timeDurationEls, formatTime(video.duration))
        if (timeProgressEls.length) setText(timeProgressEls, formatTime(video.currentTime))
      }
      video.addEventListener('timeupdate', updateTimeTexts)
      video.addEventListener('loadedmetadata', updateTimeTexts)
      video.addEventListener('durationchange', updateTimeTexts)

      var rafId

      function updateProgressVisuals() {
        if (!video.duration) return
        var playedPct = (video.currentTime / video.duration) * 100
        if (progressBar) progressBar.style.transform = 'translateX(' + (-100 + playedPct) + '%)'
        if (handle) handle.style.left = playedPct + '%'
      }

      function loop() {
        updateProgressVisuals()
        if (!video.paused && !video.ended) rafId = requestAnimationFrame(loop)
      }

      function updateBufferedBar() {
        if (!bufferedBar || !video.duration || !video.buffered.length) return
        var end = video.buffered.end(video.buffered.length - 1)
        var buffPct = (end / video.duration) * 100
        bufferedBar.style.transform = 'translateX(' + (-100 + buffPct) + '%)'
      }
      video.addEventListener('progress', updateBufferedBar)
      video.addEventListener('loadedmetadata', updateBufferedBar)
      video.addEventListener('durationchange', updateBufferedBar)

      video.addEventListener('play', function () {
        setActivated(true)
        cancelAnimationFrame(rafId)
        loop()
      })
      video.addEventListener('playing', function () {
        pendingPlay = false
        setStatus('playing')
      })
      video.addEventListener('pause', function () {
        pendingPlay = false
        cancelAnimationFrame(rafId)
        updateProgressVisuals()
        setStatus('paused')
      })
      video.addEventListener('waiting', function () {
        setStatus('loading')
      })
      video.addEventListener('canplay', function () {
        if (
          player.getAttribute('data-player-activated') !== 'true' &&
          !pendingPlay &&
          player.getAttribute('data-player-status') === 'idle'
        ) {
          setStatus('ready')
        }
      })
      video.addEventListener('ended', function () {
        pendingPlay = false
        cancelAnimationFrame(rafId)
        updateProgressVisuals()
        setStatus('paused')
        setActivated(false)
      })

      if (timeline) {
        var dragging = false
        var wasPlaying = false
        var targetTime = 0
        var lastSeekTs = 0
        var seekThrottle = 180
        var rect = null

        window.addEventListener('resize', function () {
          if (!dragging) rect = null
        })

        function getFractionFromX(x) {
          if (!rect) rect = timeline.getBoundingClientRect()
          var f = (x - rect.left) / rect.width
          if (f < 0) f = 0
          if (f > 1) f = 1
          return f
        }

        function previewAtFraction(f) {
          if (!video.duration) return
          var pct = f * 100
          if (progressBar) progressBar.style.transform = 'translateX(' + (-100 + pct) + '%)'
          if (handle) handle.style.left = pct + '%'
          if (timeProgressEls.length) setText(timeProgressEls, formatTime(f * video.duration))
        }

        function maybeSeek(now) {
          if (!video.duration) return
          if (now - lastSeekTs < seekThrottle) return
          lastSeekTs = now
          video.currentTime = targetTime
        }

        function onPointerDown(e) {
          if (!video.duration) return
          dragging = true
          wasPlaying = !video.paused && !video.ended
          if (wasPlaying) video.pause()
          player.setAttribute('data-timeline-drag', 'true')
          rect = timeline.getBoundingClientRect()

          var f = getFractionFromX(e.clientX)
          targetTime = f * video.duration
          previewAtFraction(f)
          maybeSeek(performance.now())

          timeline.setPointerCapture && timeline.setPointerCapture(e.pointerId)
          window.addEventListener('pointermove', onPointerMove, { passive: false })
          window.addEventListener('pointerup', onPointerUp, { passive: true })
          e.preventDefault()
        }

        function onPointerMove(e) {
          if (!dragging) return
          var f = getFractionFromX(e.clientX)
          targetTime = f * video.duration
          previewAtFraction(f)
          maybeSeek(performance.now())
          e.preventDefault()
        }

        function onPointerUp() {
          if (!dragging) return
          dragging = false
          player.setAttribute('data-timeline-drag', 'false')
          rect = null
          video.currentTime = targetTime
          if (wasPlaying) {
            var p = video.play()
            if (p && typeof p.then === 'function') p.catch(function () {})
          } else {
            updateProgressVisuals()
            updateTimeTexts()
          }
          window.removeEventListener('pointermove', onPointerMove)
          window.removeEventListener('pointerup', onPointerUp)
        }

        timeline.addEventListener('pointerdown', onPointerDown, { passive: false })
        if (handle) handle.addEventListener('pointerdown', onPointerDown, { passive: false })
      }

      var hoverTimer
      var hoverHideDelay = 3000

      function setHover(state) {
        if (player.getAttribute('data-player-hover') !== state) {
          player.setAttribute('data-player-hover', state)
        }
      }

      function scheduleHide() {
        clearTimeout(hoverTimer)
        hoverTimer = setTimeout(function () {
          setHover('idle')
        }, hoverHideDelay)
      }

      function wakeControls() {
        setHover('active')
        scheduleHide()
      }

      player.addEventListener('pointerdown', wakeControls)
      video.addEventListener('play', wakeControls)
      video.addEventListener('pause', wakeControls)
      document.addEventListener('fullscreenchange', wakeControls)
      document.addEventListener('webkitfullscreenchange', wakeControls)

      var trackingMove = false

      function onPointerMoveGlobal(e) {
        var r = player.getBoundingClientRect()
        if (
          e.clientX >= r.left &&
          e.clientX <= r.right &&
          e.clientY >= r.top &&
          e.clientY <= r.bottom
        ) {
          wakeControls()
        }
      }
      player.addEventListener('pointerenter', function () {
        wakeControls()
        if (!trackingMove) {
          trackingMove = true
          window.addEventListener('pointermove', onPointerMoveGlobal, { passive: true })
        }
      })
      player.addEventListener('pointerleave', function () {
        setHover('idle')
        clearTimeout(hoverTimer)
        if (trackingMove) {
          trackingMove = false
          window.removeEventListener('pointermove', onPointerMoveGlobal)
        }
      })
    })
  }

  function getPlayerEntryForSlide(slide) {
    var playerEl = slide.querySelector('[data-bunny-player-init]')
    if (!playerEl) return null
    for (var i = 0; i < window._bunnyPlayers.length; i++) {
      if (window._bunnyPlayers[i].player === playerEl) return window._bunnyPlayers[i]
    }
    return null
  }

  var swiperInstances = []

  function createSwipers() {
    document.querySelectorAll('.visuals_group-list .swiper').forEach(function (container) {
      var wrapper = container.querySelector('.swiper-wrapper')
      if (wrapper) {
        Array.from(wrapper.children).forEach(function (child) {
          child.classList.add('swiper-slide')
        })
      }

      var instance = new Swiper(container, {
        slidesPerView: 'auto',
        spaceBetween: 16,
        centeredSlides: true,
        speed: 800,
        on: {
          afterInit: function () {
            var swiper = this
            var activeSlide = swiper.slides[swiper.activeIndex]
            if (activeSlide) {
              var entry = getPlayerEntryForSlide(activeSlide)
              if (entry && entry.play) entry.play()
            }
          },

          slideChangeTransitionStart: function () {
            var swiper = this
            var prevSlide = swiper.slides[swiper.previousIndex]
            if (prevSlide) {
              var prevEntry = getPlayerEntryForSlide(prevSlide)
              if (prevEntry && prevEntry.pause) prevEntry.pause()
            }
          },

          slideChangeTransitionEnd: function () {
            var swiper = this
            var activeSlide = swiper.slides[swiper.activeIndex]
            if (activeSlide) {
              var entry = getPlayerEntryForSlide(activeSlide)
              if (entry && entry.play) entry.play()
            }
          },
        },
      })
      swiperInstances.push(instance)
    })
  }

  function destroySwipers() {
    swiperInstances.forEach(function (instance) {
      var wrapper = instance.wrapperEl
      instance.destroy(true, true)
      if (wrapper) {
        Array.from(wrapper.children).forEach(function (child) {
          child.classList.remove('swiper-slide')
        })
      }
    })
    swiperInstances = []
  }

  function initVisualsSwiper() {
    if (typeof Swiper === 'undefined') return

    var isMobile = window.innerWidth < 768

    if (isMobile && !swiperInstances.length) {
      createSwipers()
    } else if (!isMobile && swiperInstances.length) {
      destroySwipers()
    }

    window.addEventListener('resize', debounce(function () {
      var nowMobile = window.innerWidth < 768
      if (nowMobile && !swiperInstances.length) {
        createSwipers()
      } else if (!nowMobile && swiperInstances.length) {
        destroySwipers()
      }
    }, 250))
  }

  initBunnyPlayer()
  initVisualsSwiper()
}

export function initCaseDetail() {
  initDraggableMarquee()
  initBunnyPlayers()
}
