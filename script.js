'use strict';
/* =============================================
   PORTFOLIO JS v2 — Sidebar Layout
   Security: No innerHTML with user data; all user content uses textContent
   TODO(security): Add server-side CSRF token to contact form before production
   TODO(security): Add rate limiting on form submission server-side
   ============================================= */

/* ---- Typing Effect ---- */
(function initTyping() {
  const el = document.getElementById('typing-el');
  if (!el) return;
  const roles = ['Data Engineer Junior', 'Développeur Full-Stack', 'Big Data Specialist', 'Python Developer', 'ML Engineer'];
  let ri = 0, ci = 0, del = false;
  function tick() {
    const cur = roles[ri];
    if (del) {
      ci--;
      el.textContent = cur.slice(0, ci); // safe: textContent
      if (ci === 0) { del = false; ri = (ri + 1) % roles.length; setTimeout(tick, 500); return; }
      setTimeout(tick, 40);
    } else {
      ci++;
      el.textContent = cur.slice(0, ci);
      if (ci === cur.length) { setTimeout(() => { del = true; tick(); }, 2200); return; }
      setTimeout(tick, 75);
    }
  }
  tick();
}());

/* ---- Mobile Sidebar Toggle ---- */
(function initMobile() {
  const btn     = document.getElementById('mh-toggle-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (!btn || !sidebar || !overlay) return;

  function open() {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', function () {
    sidebar.classList.contains('open') ? close() : open();
  });
  overlay.addEventListener('click', close);

  // Close on nav link click (mobile)
  sidebar.querySelectorAll('.snav-link').forEach(function (a) {
    a.addEventListener('click', close);
  });
}());

/* ---- Smooth Scroll ---- */
(function initScroll() {
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const isMobile = window.innerWidth <= 768;
    const offset = isMobile ? 70 : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
}());

/* ---- Section & Card Scroll Reveal ---- */
(function initReveal() {
  const targets = document.querySelectorAll('.section, .reveal, .proj-card, .tl-item, .acard, .skill-group, .cert-chip, .tech-item');
  
  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(function (el, idx) {
    if (!el.classList.contains('section') && !el.classList.contains('reveal')) {
      el.classList.add('reveal');
    }
    obs.observe(el);
  });
}());

/* ---- Active Sidebar Nav on Scroll ---- */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.snav-link[data-section]');

  function update() {
    let cur = '';
    const isMobile = window.innerWidth <= 768;
    const offset = isMobile ? 80 : 60;
    sections.forEach(function (sec) {
      if (sec.getBoundingClientRect().top <= offset) cur = sec.id;
    });
    links.forEach(function (l) {
      const active = l.getAttribute('data-section') === cur;
      l.classList.toggle('active', active);
      if (active) l.setAttribute('aria-current', 'page');
      else l.removeAttribute('aria-current');
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}());

/* ---- Counter Animation ---- */
(function initCounters() {
  const els = document.querySelectorAll('.sbar-num[data-target]');
  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-target'), 10);
      let cur = 0;
      const step = Math.max(Math.ceil(1800 / target), 20);
      const timer = setInterval(function () {
        cur = Math.min(cur + 1, target);
        el.textContent = cur; // safe: textContent
        if (cur >= target) clearInterval(timer);
      }, step);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  els.forEach(function (el) { obs.observe(el); });
}());

/* ---- Skill Bar Animation ---- */
(function initSkillBars() {
  const bars = document.querySelectorAll('.sk-bar[data-width]');
  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const bar = entry.target;
      const w = bar.getAttribute('data-width');
      // Delay slightly for visual effect
      setTimeout(function () {
        bar.style.width = w + '%';
      }, 100);
      obs.unobserve(bar);
    });
  }, { threshold: 0.3 });
  bars.forEach(function (b) { obs.observe(b); });
}());

/* ---- Projects Filter ---- */
(function initFilter() {
  const btns  = document.querySelectorAll('.pf-btn');
  const cards = document.querySelectorAll('.proj-card[data-cat]');

  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const cat = btn.getAttribute('data-cat');
      btns.forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      cards.forEach(function (card) {
        const matches = cat === 'all' || card.getAttribute('data-cat') === cat;
        card.classList.toggle('hidden', !matches);
      });
    });
  });
}());

/* ---- Contact Form ---- */
(function initForm() {
  const form    = document.getElementById('contact-form');
  if (!form) return;

  const nameEl  = document.getElementById('cf-name');
  const emailEl = document.getElementById('cf-email');
  const subjEl  = document.getElementById('cf-subject');
  const msgEl   = document.getElementById('cf-message');
  const btn     = document.getElementById('submit-btn');
  const btnTxt  = document.getElementById('submit-text');
  const success = document.getElementById('cf-success');

  // Allow-list validation — no user data is injected into DOM via innerHTML
  function valEmail(v)  { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }
  function valName(v)   { return v.trim().length >= 2 && v.trim().length <= 100; }
  function valSubj(v)   { return v.trim().length >= 2 && v.trim().length <= 200; }
  function valMsg(v)    { return v.trim().length >= 10 && v.trim().length <= 2000; }

  function setErr(inputEl, errId, msg) {
    const errEl = document.getElementById(errId);
    if (!errEl) return !msg;
    errEl.textContent = msg; // safe: textContent
    inputEl.style.borderColor = msg ? '#ef4444' : '';
    return !msg;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let ok = true;
    ok = setErr(nameEl,  'err-name',    valName(nameEl.value)   ? '' : 'Nom invalide (2–100 car.)') && ok;
    ok = setErr(emailEl, 'err-email',   valEmail(emailEl.value) ? '' : 'Email invalide.') && ok;
    ok = setErr(subjEl,  'err-subject', valSubj(subjEl.value)   ? '' : 'Sujet invalide (2–200 car.)') && ok;
    ok = setErr(msgEl,   'err-message', valMsg(msgEl.value)      ? '' : 'Message trop court (min 10 car.)') && ok;
    if (!ok) return;

    btn.disabled = true;
    btnTxt.textContent = 'Envoi en cours...'; // safe: textContent

    // Simulated send (connect real backend with CSRF in production)
    setTimeout(function () {
      success.hidden = false;
      form.reset();
      btn.disabled = false;
      btnTxt.textContent = 'Envoyer le message';
      setTimeout(function () { success.hidden = true; }, 6000);
    }, 1300);
  });

  // Blur validation
  [
    [nameEl,  'err-name',    valName,  'Nom invalide.'],
    [emailEl, 'err-email',   valEmail, 'Email invalide.'],
    [subjEl,  'err-subject', valSubj,  'Sujet invalide.'],
    [msgEl,   'err-message', valMsg,   'Message trop court.']
  ].forEach(function ([el, id, fn, msg]) {
    el.addEventListener('blur', function () {
      setErr(el, id, fn(el.value) ? '' : msg);
    });
    el.addEventListener('input', function () {
      if (fn(el.value)) setErr(el, id, '');
    });
  });
}());
