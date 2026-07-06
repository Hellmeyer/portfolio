// Drag-to-compare slider (Simple vs Full HUD, etc.)
(function () {
  var sliders = document.querySelectorAll('.compare');
  if (!sliders.length) return;

  sliders.forEach(function (root) {
    var range = root.querySelector('.compare-range');
    var topImg = root.querySelector('.compare-top');
    var handle = root.querySelector('.compare-handle');
    if (!range || !topImg || !handle) return;

    var dragging = false;

    function setValue(v) {
      v = Math.max(0, Math.min(100, v));
      range.value = v;
      topImg.style.clipPath = 'inset(0 ' + (100 - v) + '% 0 0)';
      handle.style.left = v + '%';
    }

    function pctFromClientX(clientX) {
      var rect = root.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    function clientXFrom(e) {
      return e.touches && e.touches.length ? e.touches[0].clientX : e.clientX;
    }

    function onDown(e) {
      if (e.target.closest && e.target.closest('.compare-arrow')) return;
      dragging = true;
      setValue(pctFromClientX(clientXFrom(e)));
      if (e.cancelable) e.preventDefault();
    }
    function onMove(e) {
      if (!dragging) return;
      setValue(pctFromClientX(clientXFrom(e)));
      if (e.cancelable) e.preventDefault();
    }
    function onUp() {
      dragging = false;
    }

    root.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    root.addEventListener('touchstart', onDown, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);

    // Keyboard (arrow keys) still drives the native range directly
    range.addEventListener('input', function () { setValue(range.value); });

    setValue(range.value || 50);

    // Prev/next arrow controls, so the slider doesn't rely on dragging alone.
    // Compact sliders get room to sit fully outside the frame; the full-bleed
    // slider has no outside room, so its arrows overlay the edges on hover.
    var isCompact = root.classList.contains('compare-compact');
    var prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'compare-arrow compare-arrow-prev';
    prevBtn.setAttribute('aria-label', 'Show before');
    prevBtn.innerHTML = '&#8249;';
    var nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'compare-arrow compare-arrow-next';
    nextBtn.setAttribute('aria-label', 'Show after');
    nextBtn.innerHTML = '&#8250;';
    prevBtn.addEventListener('click', function () { setValue(0); });
    nextBtn.addEventListener('click', function () { setValue(100); });

    if (isCompact) {
      var stage = document.createElement('div');
      stage.className = 'compare-stage';
      root.parentNode.insertBefore(stage, root);
      stage.appendChild(prevBtn);
      stage.appendChild(root);
      stage.appendChild(nextBtn);
    } else {
      prevBtn.classList.add('compare-arrow-overlay');
      nextBtn.classList.add('compare-arrow-overlay');
      root.appendChild(prevBtn);
      root.appendChild(nextBtn);
    }
  });
})();

// Hero video play/pause toggle
(function () {
  var video = document.getElementById('heroVideo');
  var toggle = document.getElementById('heroToggle');
  var icon = document.getElementById('heroToggleIcon');
  if (!video || !toggle) return;

  var PAUSE_ICON = '<rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/>';
  var PLAY_ICON = '<path d="M7 4.5v15l13-7.5z"/>';

  function setPlayingState(isPlaying) {
    icon.innerHTML = isPlaying ? PAUSE_ICON : PLAY_ICON;
    toggle.setAttribute('aria-pressed', String(!isPlaying));
    toggle.setAttribute('aria-label', isPlaying ? 'Pause background footage' : 'Play background footage');
  }

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    video.pause();
    setPlayingState(false);
  } else {
    setPlayingState(true);
  }

  toggle.addEventListener('click', function () {
    if (video.paused) {
      video.play();
      setPlayingState(true);
    } else {
      video.pause();
      setPlayingState(false);
    }
  });
})();

// Lightbox for full-size screenshots (cycles through all shots in the same section)
(function () {
  var lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  var lbImg = document.getElementById('lightboxImg');
  var lbCaption = document.getElementById('lightboxCaption');
  var closeBtn = document.getElementById('lightboxClose');
  var prevBtn = document.getElementById('lightboxPrev');
  var nextBtn = document.getElementById('lightboxNext');
  var lastFocused = null;

  var group = [];
  var index = -1;

  function show(i) {
    index = (i + group.length) % group.length;
    var img = group[index];
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt || '';
    lbCaption.textContent = img.alt || '';
  }

  function open(img) {
    lastFocused = document.activeElement;
    var slideshow = img.closest('.phone-slideshow');
    if (slideshow) {
      group = Array.prototype.slice.call(slideshow.querySelectorAll('.phone-slide'));
    } else {
      var section = img.closest('section') || document;
      group = Array.prototype.slice.call(section.querySelectorAll('.shot img'));
    }
    if (!group.length) group = [img];
    index = group.indexOf(img);
    var multi = group.length > 1;
    prevBtn.style.display = multi ? '' : 'none';
    nextBtn.style.display = multi ? '' : 'none';
    show(index);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lbImg.src = '';
    if (lastFocused) lastFocused.focus();
  }

  document.addEventListener('click', function (e) {
    var img = e.target.closest('.shot img, .phone-slide');
    if (img) {
      open(img);
      return;
    }
    if (e.target === prevBtn) {
      show(index - 1);
      return;
    }
    if (e.target === nextBtn) {
      show(index + 1);
      return;
    }
    if (e.target === lightbox || e.target === closeBtn) {
      close();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('is-open')) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.shot img')) {
        e.preventDefault();
        open(e.target);
      }
      return;
    }
    if (e.key === 'Escape') {
      close();
    } else if (e.key === 'ArrowLeft') {
      show(index - 1);
    } else if (e.key === 'ArrowRight') {
      show(index + 1);
    }
  });
})();

// Phone-frame slideshow (auto-advancing, with dots + caption sync).
// Slideshows inside a [data-sync-group] wrapper advance together in lockstep,
// so side-by-side examples of "the same screen, different item" stay aligned.
(function () {
  var allShows = document.querySelectorAll('.phone-slideshow');
  if (!allShows.length) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initGroup(roots) {
    var members = roots.map(function (root) {
      var slides = Array.prototype.slice.call(root.querySelectorAll('.phone-slide'));
      var dotsWrap = root.querySelector('.phone-slideshow-dots');
      var captionEl = root.querySelector('.phone-slideshow-caption');
      var dots = dotsWrap ? slides.map(function (slide, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Show slide ' + (i + 1) + ' of ' + slides.length);
        dotsWrap.appendChild(dot);
        return dot;
      }) : [];
      return { root: root, slides: slides, dots: dots, captionEl: captionEl };
    }).filter(function (m) { return m.slides.length; });

    if (!members.length) return;

    var maxLen = members.reduce(function (m, g) { return Math.max(m, g.slides.length); }, 0);
    var current = 0;
    var timer = null;

    function render() {
      members.forEach(function (g) {
        var idx = current % g.slides.length;
        g.slides.forEach(function (slide, i) { slide.classList.toggle('is-active', i === idx); });
        g.dots.forEach(function (dot, i) { dot.classList.toggle('is-active', i === idx); });
        if (g.captionEl) {
          var active = g.slides[idx];
          g.captionEl.innerHTML = '';
          var strong = document.createElement('strong');
          strong.textContent = active.getAttribute('data-title') || '';
          g.captionEl.appendChild(strong);
        }
      });
    }

    function goTo(i) {
      current = (i + maxLen) % maxLen;
      render();
    }

    function startAuto() {
      if (reduceMotion || maxLen < 2) return;
      stopAuto();
      timer = window.setInterval(function () { goTo(current + 1); }, 4000);
    }
    function stopAuto() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }

    members.forEach(function (g) {
      g.dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          goTo(i);
          startAuto();
        });
      });
      g.root.addEventListener('mouseenter', stopAuto);
      g.root.addEventListener('mouseleave', startAuto);

      var frame = g.root.querySelector('.phone-frame, .slate-frame');
      if (frame && g.slides.length > 1) {
        var prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'phone-slideshow-arrow phone-slideshow-prev';
        prevBtn.setAttribute('aria-label', 'Previous slide');
        prevBtn.innerHTML = '&#8249;';
        var nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'phone-slideshow-arrow phone-slideshow-next';
        nextBtn.setAttribute('aria-label', 'Next slide');
        nextBtn.innerHTML = '&#8250;';
        prevBtn.addEventListener('click', function () { goTo(current - 1); startAuto(); });
        nextBtn.addEventListener('click', function () { goTo(current + 1); startAuto(); });

        var stage = document.createElement('div');
        stage.className = 'phone-slideshow-stage';
        frame.parentNode.insertBefore(stage, frame);
        stage.appendChild(prevBtn);
        stage.appendChild(frame);
        stage.appendChild(nextBtn);
      }
    });

    render();
    startAuto();
  }

  var grouped = [];
  document.querySelectorAll('[data-sync-group]').forEach(function (wrap) {
    var members = Array.prototype.slice.call(wrap.querySelectorAll('.phone-slideshow'));
    if (!members.length) return;
    initGroup(members);
    grouped = grouped.concat(members);
  });

  Array.prototype.slice.call(allShows).forEach(function (root) {
    if (grouped.indexOf(root) === -1) initGroup([root]);
  });
})();

// Phone-frame tabs: swap which item set a phone-slideshow's slides show,
// without touching which slide (list/grid/detail) is currently active.
(function () {
  document.querySelectorAll('.phone-tabs').forEach(function (tabsWrap) {
    var slideshow = tabsWrap.closest('.phone-slideshow');
    if (!slideshow) return;
    var tabs = Array.prototype.slice.call(tabsWrap.querySelectorAll('.phone-tab'));
    var slides = Array.prototype.slice.call(slideshow.querySelectorAll('.phone-slide'));

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.toggle('is-active', t === tab); });
        slides.forEach(function (img, i) {
          var src = tab.getAttribute('data-src-' + i);
          var alt = tab.getAttribute('data-alt-' + i);
          if (src) img.src = src;
          if (alt) img.alt = alt;
        });
      });
    });
  });
})();

// Scroll-reveal for screenshot cards
(function () {
  var items = document.querySelectorAll('.shot');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in-view'); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach(function (el) { observer.observe(el); });
})();
