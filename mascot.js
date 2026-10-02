/* Scroll-buddy robot mascot — injects itself on every page.
   Drifts down the right edge as you scroll, leans into the scroll direction,
   fires its thruster, follows the cursor with its eyes and chats when poked.
   Styles live in style.css (MASCOT section). */
(function () {
  'use strict';
  if (window.__mascotLoaded || !document.body) return;
  window.__mascotLoaded = true;

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(pointer: fine)').matches;
  var isCase = document.body.classList.contains('page-case');

  var SVG =
    '<svg viewBox="0 0 100 124" aria-hidden="true" focusable="false">' +
    '<defs>' +
    '<linearGradient id="mBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#D5E3EB"/></linearGradient>' +
    '<linearGradient id="mFlame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE08A"/><stop offset="1" stop-color="#FF8A4C" stop-opacity="0"/></linearGradient>' +
    '</defs>' +
    '<g class="m-float">' +
    '<g class="m-flame-g"><path class="m-flame" d="M42 100 Q50 130 58 100Z" fill="url(#mFlame)"/></g>' +
    '<rect x="39" y="93" width="22" height="10" rx="5" fill="#2596be" stroke="#121826" stroke-width="2.5"/>' +
    '<g class="m-arm m-arm-l"><rect x="10" y="68" width="22" height="10" rx="5" fill="url(#mBody)" stroke="#121826" stroke-width="2.5"/><circle cx="13" cy="73" r="5.5" fill="#2596be" stroke="#121826" stroke-width="2.5"/></g>' +
    '<g class="m-arm m-arm-r"><rect x="68" y="68" width="22" height="10" rx="5" fill="url(#mBody)" stroke="#121826" stroke-width="2.5"/><circle cx="87" cy="73" r="5.5" fill="#2596be" stroke="#121826" stroke-width="2.5"/></g>' +
    '<rect x="28" y="62" width="44" height="35" rx="14" fill="url(#mBody)" stroke="#121826" stroke-width="2.5"/>' +
    '<rect x="37" y="72" width="26" height="15" rx="7.5" fill="#121826"/>' +
    '<circle class="m-core" cx="50" cy="79.5" r="4.6" fill="#10B981"/>' +
    '<g class="m-ant"><line x1="50" y1="18" x2="50" y2="8" stroke="#121826" stroke-width="3" stroke-linecap="round"/><circle class="m-bulb" cx="50" cy="5.5" r="4.4" fill="#10B981" stroke="#121826" stroke-width="2.2"/></g>' +
    '<rect x="9" y="30" width="9" height="19" rx="4.5" fill="#2596be" stroke="#121826" stroke-width="2.5"/>' +
    '<rect x="82" y="30" width="9" height="19" rx="4.5" fill="#2596be" stroke="#121826" stroke-width="2.5"/>' +
    '<rect x="17" y="13" width="66" height="51" rx="20" fill="url(#mBody)" stroke="#121826" stroke-width="2.5"/>' +
    '<rect x="25" y="21" width="50" height="35" rx="13" fill="#121826"/>' +
    '<g class="m-eyes">' +
    '<g class="m-eye"><ellipse cx="40" cy="36" rx="5.2" ry="6.6" fill="#7fd3ea"/><circle cx="41.8" cy="33.4" r="1.7" fill="#fff"/></g>' +
    '<g class="m-eye"><ellipse cx="60" cy="36" rx="5.2" ry="6.6" fill="#7fd3ea"/><circle cx="61.8" cy="33.4" r="1.7" fill="#fff"/></g>' +
    '</g>' +
    '<path d="M44.5 46.5 Q50 51.5 55.5 46.5" fill="none" stroke="#10B981" stroke-width="2.4" stroke-linecap="round"/>' +
    '<circle cx="31.5" cy="45.5" r="3" fill="#FF8FA3" opacity=".55"/><circle cx="68.5" cy="45.5" r="3" fill="#FF8FA3" opacity=".55"/>' +
    '</g></svg>';

  var host = document.createElement('div');
  host.className = 'mascot';
  host.id = 'mascot';
  host.innerHTML =
    '<div class="mascot-bubble" role="status" aria-live="polite"></div>' +
    '<button type="button" class="mascot-btn" aria-label="Robot buddy — click to say hi">' +
    '<span class="mascot-lean"><span class="mascot-tilt">' + SVG + '</span></span></button>';
  document.body.appendChild(host);

  var bubble = host.querySelector('.mascot-bubble');
  var btn = host.querySelector('.mascot-btn');
  var tilt = host.querySelector('.mascot-tilt');
  var eyes = host.querySelector('.m-eyes');
  var flame = host.querySelector('.m-flame-g');

  var y = null, lean = 0, lastScroll = window.scrollY, queued = false;
  var hideTimer = null, waveTimer = null, greetTimer = null, endShown = false, quipIdx = 0;

  var quips = isCase
    ? ['Beep boop! Enjoying the case study?', 'Pssst… the “Work With Me” button is up top.', 'More projects are waiting on the home page.']
    : ['Beep boop! Keep scrolling →', 'Psst… the case studies are worth a look.', 'There is a dark mode toggle up top. Try it!'];

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function metrics() {
    var small = innerWidth <= 760;
    var h = host.offsetHeight || 90;
    var vh = window.innerHeight;
    var max = Math.max(0, document.documentElement.scrollHeight - vh);
    var p = max > 0 ? clamp(window.scrollY / max, 0, 1) : 1;
    var top = small ? 66 : 88;
    var bottom = vh - h - (small ? 64 : 96);
    if (bottom < top) bottom = top;
    return { p: p, max: max, y: reduced ? bottom : top + (bottom - top) * p };
  }

  function frame() {
    queued = false;
    var m = metrics();
    var sy = window.scrollY, dv = sy - lastScroll;
    lastScroll = sy;
    if (y === null) y = m.y;
    y += (m.y - y) * (reduced ? 1 : 0.14);
    var sway = reduced ? 0 : -(1 - Math.cos(m.p * Math.PI * 6)) * 5;
    lean += (clamp(dv * 0.5, -16, 16) - lean) * 0.2;
    var gap = Math.abs(m.y - y);
    host.style.transform = 'translate3d(' + sway.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
    tilt.style.setProperty('--tilt', (reduced ? 0 : lean).toFixed(1) + 'deg');
    flame.style.setProperty('--flame', (0.45 + clamp(Math.max(Math.abs(dv) / 30, gap / 40), 0, 1) * 0.95).toFixed(2));
    var moving = Math.abs(dv) > 1 || gap > 1.5;
    host.classList.toggle('is-moving', moving);
    if (!endShown && m.max > 300 && m.p > 0.985) { endShown = true; say('Thank you for your time, see you soon! 🎉', 3600); }
    if (m.p < 0.8) endShown = false;
    if (moving || Math.abs(lean) > 0.2) request();
  }

  function request() {
    if (!queued) { queued = true; requestAnimationFrame(frame); }
  }

  function say(text, ms) {
    bubble.textContent = text;
    bubble.classList.add('show');
    host.classList.add('is-awake');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, ms || 3200);
  }
  function hide() {
    bubble.classList.remove('show');
    host.classList.remove('is-awake');
  }

  btn.addEventListener('click', function () {
    clearTimeout(greetTimer);
    host.classList.add('is-waving');
    clearTimeout(waveTimer);
    waveTimer = setTimeout(function () { host.classList.remove('is-waving'); }, 1500);
    say(quips[quipIdx++ % quips.length], 3400);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { clearTimeout(greetTimer); hide(); } });

  if (finePointer && !reduced) {
    var pe = null, eyeQueued = false;
    addEventListener('pointermove', function (e) {
      pe = e;
      if (eyeQueued) return;
      eyeQueued = true;
      requestAnimationFrame(function () {
        eyeQueued = false;
        var r = btn.getBoundingClientRect();
        var dx = pe.clientX - (r.left + r.width * 0.4), dy = pe.clientY - (r.top + r.height * 0.3);
        var d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 240);
        eyes.style.setProperty('--ex', (dx / d * 2.8 * k).toFixed(2) + 'px');
        eyes.style.setProperty('--ey', (dy / d * 2.2 * k).toFixed(2) + 'px');
      });
    }, { passive: true });
  }

  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);
  addEventListener('orientationchange', request);
  addEventListener('load', request);
  if (window.ResizeObserver) new ResizeObserver(request).observe(document.body);

  frame();

  try {
    if (!sessionStorage.getItem('mascot-hi')) {
      sessionStorage.setItem('mascot-hi', '1');
      greetTimer = setTimeout(function () { say("Hi! Welcome to Amira's portfolio 👋", 3800); }, 1500);
    }
  } catch (e) {}
})();
