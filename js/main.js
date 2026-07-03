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
    var section = img.closest('section') || document;
    group = Array.prototype.slice.call(section.querySelectorAll('.shot img'));
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
    var img = e.target.closest('.shot img');
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
