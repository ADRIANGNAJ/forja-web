(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA = '525647616195'; // WhatsApp de FORJA

  /* ---------- menú ---------- */
  const nav = $('#nav'), btn = $('#menuBtn'), panel = $('#menuPanel');
  const setMenu = o => { panel.classList.toggle('open', o); btn.setAttribute('aria-expanded', o); };
  btn.addEventListener('click', e => { e.stopPropagation(); setMenu(!panel.classList.contains('open')); });
  document.addEventListener('click', e => { if (!panel.contains(e.target)) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    if (!panel.classList.contains('open')) nav.classList.toggle('up', y > 300 && y > lastY + 2);
    if (y < lastY - 2) nav.classList.remove('up');
    lastY = y;
  }, { passive: true });

  /* ---------- FAQ ---------- */
  const fqs = $$('.fq');
  const openFq = (it, o) => { it.classList.toggle('open', o); $('.fq-q', it).setAttribute('aria-expanded', o); const a = $('.fq-a', it); a.style.maxHeight = o ? a.scrollHeight + 'px' : null; };
  fqs.forEach(it => $('.fq-q', it).addEventListener('click', () => { const o = !it.classList.contains('open'); fqs.forEach(x => x !== it && openFq(x, false)); openFq(it, o); }));
  fqs.filter(f => f.classList.contains('open')).forEach(f => openFq(f, true));
  addEventListener('resize', () => fqs.filter(f => f.classList.contains('open')).forEach(f => openFq(f, true)));

  /* ---------- carrusel de casos ---------- */
  const track = $('#carTrack'), dots = $$('#carDots i'), n = dots.length; let ci = 0;
  const go = i => { ci = (i + n) % n; track.style.transform = `translateX(${-ci * 100}%)`; dots.forEach((d, k) => d.classList.toggle('on', k === ci)); };
  $('#carPrev').addEventListener('click', () => go(ci - 1));
  $('#carNext').addEventListener('click', () => go(ci + 1));
  dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
  let sx = null;
  track.addEventListener('pointerdown', e => { sx = e.clientX; });
  addEventListener('pointerup', e => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) go(ci + (dx < 0 ? 1 : -1)); });

  /* ---------- formulario -> WhatsApp (no se guarda nada) ---------- */
  const form = $('#waForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.nombre.value.trim(), biz = form.negocio.value.trim(), msg = form.mensaje.value.trim();
    form.nombre.classList.toggle('bad', !name); form.negocio.classList.toggle('bad', !biz);
    if (!name || !biz) { (name ? form.negocio : form.nombre).focus(); return; }
    const text = `Hola FORJA, soy ${name}. Mi negocio: ${biz}.` + (msg ? ` Necesito: ${msg}` : ' Quiero una página web.');
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });

  /* ---------- scroll suave + anclas ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: .1 });
    if (window.gsap) { window.ScrollTrigger && lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); const el = id.length > 1 && document.querySelector(id);
    if (!el) return; e.preventDefault(); setMenu(false);
    if (lenis) lenis.scrollTo(el, { offset: id === '#inicio' ? 0 : -20, duration: 1.4 }); else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const hasSplit = !!window.SplitText; if (hasSplit) gsap.registerPlugin(SplitText);
  const whenFonts = document.fonts && document.fonts.load
    ? Promise.all([document.fonts.load('600 80px Geist'), document.fonts.load('500 72px Geist'), document.fonts.load('400 40px "Dela Gothic One"'), document.fonts.ready]).catch(() => {})
    : Promise.resolve();
  whenFonts.then(() => setTimeout(() => ScrollTrigger.refresh(), 300));

  /* hero: entrada */
  gsap.from('.nav-mark, .nav-pill', { y: -24, opacity: 0, duration: 1, ease: 'power3.out', stagger: .08, delay: .2 });
  gsap.from('.hero-media', { opacity: 0, duration: 1.8, ease: 'power2.out' });
  gsap.from('.badge, .hero-sub, .hero-ctas > *', { y: 26, opacity: 0, filter: 'blur(8px)', duration: 1.1, ease: 'power3.out', stagger: .1, delay: .55 });
  whenFonts.then(() => {
    if (!hasSplit) return;
    SplitText.create('#h1', {
      type: 'lines', mask: 'lines', linesClass: 'ln', autoSplit: true,
      onSplit: s => { $('#h1').classList.remove('grad'); return gsap.from(s.lines, { yPercent: 110, duration: 1.2, ease: 'power4.out', stagger: .1, delay: .25 }); }
    });
  });
  /* hero: al hacer scroll la escultura se acerca y el texto se va */
  gsap.to('.hero-media', { scale: 1.18, yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('#heroIn', { yPercent: -18, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '20% top', end: '85% top', scrub: true } });
  /* parallax suave con el cursor */
  if (matchMedia('(pointer:fine)').matches) {
    const qx = gsap.quickTo('.hero-media', 'x', { duration: 1.4, ease: 'power3' }), qy = gsap.quickTo('.hero-media', 'y', { duration: 1.4, ease: 'power3' });
    $('.hero').addEventListener('pointermove', e => { qx((e.clientX / innerWidth - .5) * -26); qy((e.clientY / innerHeight - .5) * -18); });
  }

  /* etiquetas y títulos */
  $$('.lbl').forEach(l => gsap.from(l, { y: 12, opacity: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: l, start: 'top 90%', once: true } }));
  whenFonts.then(() => $$('[data-words]').forEach(el => {
    if (!hasSplit) return;
    SplitText.create(el, { type: 'words', autoSplit: true, onSplit: s => gsap.from(s.words, { y: 30, opacity: 0, filter: 'blur(10px)', duration: 1, ease: 'power3.out', stagger: .06, scrollTrigger: { trigger: el, start: 'top 86%', once: true } }) });
  }));
  $$('.head > p').forEach(p => gsap.from(p, { y: 16, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: p, start: 'top 92%', once: true } }));

  /* manifiesto: se ilumina palabra por palabra */
  whenFonts.then(() => {
    const p = $('#manifP'); if (!p || !hasSplit) return;
    SplitText.create(p, { type: 'words', wordsClass: 'w', onSplit: s => gsap.timeline({ scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 50%', scrub: .6 } }).to(s.words, { color: '#1a1a1a', stagger: { each: 1 }, ease: 'none' }) });
  });
  /* tarjeta squircle: crece al entrar */
  gsap.fromTo('#aboutCard', { scale: .78, rotate: -4 }, { scale: 1, rotate: 0, ease: 'none', scrollTrigger: { trigger: '.stage', start: 'top 95%', end: 'center 55%', scrub: .8 } });

  /* tarjetas */
  ScrollTrigger.batch('[data-reveal]', { start: 'top 90%', once: true, onEnter: b => gsap.from(b, { y: 50, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: .1 }) });

  /* proceso: la línea se llena y el paso activo se resalta */
  gsap.to('#tlFill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#tl', start: 'top 55%', end: 'bottom 55%', scrub: .5 } });
  $$('[data-step]').forEach(s => ScrollTrigger.create({ trigger: s, start: 'top 58%', end: 'bottom 42%', toggleClass: 'on' }));
  $$('[data-step]').forEach(s => gsap.from(s, { y: 30, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 88%', once: true } }));

  /* eco: el orbe aparece */
  gsap.from('.eco-orb', { scale: .4, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.eco-rows', start: 'top 80%', once: true } });

  /* CTA: el fondo se mueve con el scroll */
  gsap.fromTo('.cta-bg img', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* footer: el logotipo sube */
  gsap.from('#footWm', { yPercent: 70, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.foot', start: 'top 70%', once: true } });
})();
