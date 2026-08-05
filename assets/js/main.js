/* =========================================================
   Laveena Wadhwani — site interactions
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header shadow on scroll ---------- */
  var header = document.getElementById('header');
  var onScroll = function () {
    header.classList.toggle('scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile navigation ---------- */
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');

  var closeNav = function () {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  };

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeNav();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  document.addEventListener('click', function (e) {
    if (!nav.classList.contains('open')) return;
    if (!nav.contains(e.target) && !toggle.contains(e.target)) closeNav();
  });

  /* ---------- Scroll spy ---------- */
  var navLinks = Array.prototype.slice.call(nav.querySelectorAll('ul a'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.transitionDelay = Math.min(i * 60, 300) + 'ms';
        el.classList.add('visible');
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Testimonials slider ---------- */
  var slidesEl = document.getElementById('slides');
  var dotsNav = document.getElementById('dotsNav');

  if (slidesEl && dotsNav) {
    var GAP = 22;
    var quotes = slidesEl.children.length;
    var page = 0;
    var pages = 1;
    var timer = null;

    var perView = function () {
      if (window.innerWidth > 1080) return 3;
      if (window.innerWidth > 720) return 2;
      return 1;
    };

    var render = function () {
      slidesEl.style.transform = 'translateX(calc(' + (-page) + ' * (100% + ' + GAP + 'px)))';
      Array.prototype.forEach.call(dotsNav.children, function (dot, i) {
        dot.setAttribute('aria-selected', String(i === page));
      });
    };

    var buildDots = function () {
      pages = Math.ceil(quotes / perView());
      if (page > pages - 1) page = pages - 1;
      dotsNav.innerHTML = '';
      for (var i = 0; i < pages; i++) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Testimonials page ' + (i + 1));
        dot.setAttribute('aria-selected', String(i === page));
        (function (index) {
          dot.addEventListener('click', function () { page = index; render(); restart(); });
        })(i);
        dotsNav.appendChild(dot);
      }
      render();
    };

    var next = function () { page = (page + 1) % pages; render(); };
    var prev = function () { page = (page - 1 + pages) % pages; render(); };

    var start = function () {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      timer = setInterval(next, 5500);
    };
    var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
    var restart = function () { stop(); start(); };

    var slider = document.getElementById('slider');
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin', stop);

    /* Touch swipe */
    var startX = 0, dragging = false;
    slider.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX; dragging = true; stop();
    }, { passive: true });
    slider.addEventListener('touchend', function (e) {
      if (!dragging) return;
      dragging = false;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) { dx < 0 ? next() : prev(); }
      start();
    });

    /* Keyboard */
    slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { next(); restart(); }
      if (e.key === 'ArrowLeft') { prev(); restart(); }
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildDots, 150);
    });

    buildDots();
    start();
  }

  /* ---------- Testimonial hearts ---------- */
  document.querySelectorAll('.heart').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var liked = btn.classList.toggle('liked');
      btn.setAttribute('aria-pressed', String(liked));
    });
  });

  /* ---------- Session gallery + lightbox ---------- */
  var shotsWrap = document.getElementById('shots');
  var lb = document.getElementById('lightbox');

  if (shotsWrap && lb) {
    var lbImg = document.getElementById('lbImg');
    var lbCap = document.getElementById('lbCap');
    var allShots = Array.prototype.slice.call(shotsWrap.querySelectorAll('.shot'));
    var live = [];          /* only tiles whose photo actually loaded */
    var current = 0;
    var lastFocus = null;

    var refresh = function () {
      live = allShots.filter(function (s) { return !s.classList.contains('no-img'); });
    };

    /* A tile with no file behind it becomes a placeholder, not a broken image. */
    allShots.forEach(function (shot) {
      var img = shot.querySelector('img');
      var fail = function () { shot.classList.add('no-img'); shot.disabled = true; refresh(); };
      img.addEventListener('error', fail);
      if (img.complete && img.naturalWidth === 0) fail();
    });
    refresh();

    var show = function (i) {
      if (!live.length) return;
      current = (i + live.length) % live.length;
      var shot = live[current];
      var img = shot.querySelector('img');
      lbImg.src = shot.getAttribute('data-full') || img.getAttribute('src');
      lbImg.alt = img.getAttribute('alt') || '';
      lbCap.textContent = img.getAttribute('alt') || '';
    };

    var closeLb = function () {
      lb.hidden = true;
      lbImg.src = '';
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };

    var openLb = function (i) {
      lastFocus = document.activeElement;
      show(i);
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      document.getElementById('lbClose').focus();
    };

    shotsWrap.addEventListener('click', function (e) {
      var shot = e.target.closest('.shot');
      if (!shot || shot.classList.contains('no-img')) return;
      var i = live.indexOf(shot);
      if (i !== -1) openLb(i);
    });

    document.getElementById('lbClose').addEventListener('click', closeLb);
    document.getElementById('lbPrev').addEventListener('click', function () { show(current - 1); });
    document.getElementById('lbNext').addEventListener('click', function () { show(current + 1); });

    /* Backdrop click closes; clicks on the image or controls do not. */
    lb.addEventListener('click', function (e) {
      if (e.target === lb) closeLb();
    });

    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowRight') show(current + 1);
      if (e.key === 'ArrowLeft') show(current - 1);
    });

    /* Swipe between photos on touch. */
    var lbX = 0;
    lb.addEventListener('touchstart', function (e) { lbX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - lbX;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    });
  }

  /* ---------- Testimonial avatars: initials fallback ----------
     Lets you add a card before its photo exists — a missing or empty
     src renders the data-initials in a coloured circle instead. */
  var toInitials = function (img) {
    var span = document.createElement('span');
    span.className = 't-avatar fallback';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = img.getAttribute('data-initials') || '♥';
    if (img.parentNode) img.parentNode.replaceChild(span, img);
  };

  document.querySelectorAll('.t-avatar').forEach(function (img) {
    var src = img.getAttribute('src');
    if (!src) { toInitials(img); return; }
    img.addEventListener('error', function () { toInitials(img); });
    /* Cached/complete images that failed never fire error again. */
    if (img.complete && img.naturalWidth === 0) toInitials(img);
  });

  /* ---------- Testimonial wall filter ---------- */
  var wall = document.getElementById('wall');
  var filters = document.getElementById('filters');

  if (wall && filters) {
    var cards = Array.prototype.slice.call(wall.querySelectorAll('.t-card'));
    var countEl = document.getElementById('wallCount');
    var emptyEl = document.getElementById('wallEmpty');

    var apply = function (cat) {
      var shown = 0;
      cards.forEach(function (card) {
        var cats = (card.getAttribute('data-cat') || '').split(/\s+/);
        var match = cat === 'all' || cats.indexOf(cat) !== -1;
        card.classList.toggle('is-hidden', !match);
        if (match) shown++;
      });
      if (countEl) {
        countEl.textContent = shown + (shown === 1 ? ' story' : ' stories') +
          (cat === 'all' ? '' : ' in this category');
      }
      if (emptyEl) emptyEl.hidden = shown !== 0;
    };

    filters.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter');
      if (!btn) return;
      Array.prototype.forEach.call(filters.querySelectorAll('.filter'), function (b) {
        var on = b === btn;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', String(on));
      });
      apply(btn.getAttribute('data-filter'));
    });

    apply('all');
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');

  if (form) {
    var setStatus = function (msg, type) {
      status.textContent = msg;
      status.className = 'form-status' + (type ? ' ' + type : '');
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var fields = form.querySelectorAll('input, textarea');
      var valid = true;
      fields.forEach(function (field) {
        var ok = field.checkValidity() && field.value.trim() !== '';
        field.classList.toggle('invalid', !ok);
        if (!ok) valid = false;
      });

      if (!valid) {
        setStatus('Please fill in all fields with valid details.', 'err');
        return;
      }

      var action = form.getAttribute('action') || '';

      /* No form backend configured yet — hand off to email client. */
      if (action.indexOf('your-form-id') !== -1) {
        var el = form.elements;
        var body =
          'Name: ' + el.name.value + '\n' +
          'Phone: ' + el.phone.value + '\n' +
          'Email: ' + el.email.value + '\n\n' +
          el.message.value;
        window.location.href =
          'mailto:laveenawadhwanislp@gmail.com?subject=' +
          encodeURIComponent('Session enquiry from ' + el.name.value) +
          '&body=' + encodeURIComponent(body);
        setStatus('Opening your email app to send the message…', 'ok');
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      setStatus('Sending…');

      fetch(action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Request failed');
          form.reset();
          setStatus('Thank you! Your message has been sent. I will get back to you soon.', 'ok');
        })
        .catch(function () {
          setStatus('Something went wrong. Please WhatsApp or email me directly.', 'err');
        })
        .then(function () { btn.disabled = false; });
    });

    form.addEventListener('input', function (e) {
      if (e.target.classList.contains('invalid') && e.target.value.trim() !== '') {
        e.target.classList.remove('invalid');
      }
    });
  }
})();
