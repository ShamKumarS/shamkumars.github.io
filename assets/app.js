/* Sham Kumar — Release Notes. Vanilla JS, no dependencies. */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
  };

  $('#year').textContent = new Date().getFullYear();

  /* ───────── Boot log ───────── */
  const boot = $('#boot');
  const bootDone = new Promise((resolve) => {
    if (reduced || store.sget('sk-booted')) {
      root.classList.add('no-boot');
      return resolve();
    }
    const lines = [
      ['$ ./gradlew assembleRelease && xcodebuild -scheme SHAM && flutter build', 'dim'],
      ['▸ Resolving  Jetpack Compose · SwiftUI · Flutter · HealthKit · CameraX'],
      ['▸ Compiling 5 years of Kotlin, Swift & Dart'],
      ['▸ Targets  android-arm64 · ios-arm64 · flutter'],
      ['▸ Embedding 8 builds, 4 reviews'],
      ['▸ Signing as “Sham Kumar Meghwar”'],
      ['▸ Processing release notes for 4.0'],
      ['** BUILD SUCCEEDED **', 'ok'],
    ];
    const log = $('#bootLog');
    const bar = $('#bootBar');
    let i = 0, finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      store.sset('sk-booted', '1');
      boot.classList.add('is-done');
      setTimeout(resolve, 250);
    };
    boot.addEventListener('click', finish);
    const step = () => {
      if (finished) return;
      if (i >= lines.length) return setTimeout(finish, 380);
      const [text, cls] = lines[i++];
      const row = document.createElement('div');
      if (cls) row.className = cls;
      row.textContent = text;
      log.appendChild(row);
      bar.style.width = (i / lines.length) * 100 + '%';
      setTimeout(step, 120 + Math.random() * 160);
    };
    setTimeout(step, 200);
  });

  /* ───────── Theme ───────── */
  const themeMeta = $('meta[name="theme-color"]');
  const applyThemeMeta = () => { themeMeta.content = root.dataset.theme === 'dark' ? '#0d0d0b' : '#efebe3'; };
  applyThemeMeta();
  $('#themeToggle').addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    store.set('sk-theme', root.dataset.theme);
    applyThemeMeta();
    window.dispatchEvent(new Event('themechange'));
  });

  /* ───────── Build target (platform) ───────── */
  const PLATFORMS = { all: '', android: 'a', ios: 'i', flutter: 'f' };
  const platformListeners = [];
  const onPlatform = (fn) => platformListeners.push(fn);
  const platformLetter = () => PLATFORMS[root.dataset.platform] || '';
  const setPlatform = (p, silent) => {
    if (!(p in PLATFORMS)) p = 'all';
    root.dataset.platform = p;
    $$('.target button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.p === p)));
    if (!silent) store.set('sk-platform', p);
    platformListeners.forEach((fn) => fn(p));
    window.dispatchEvent(new Event('themechange'));
  };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.target button');
    if (b) setPlatform(b.dataset.p);
  });

  /* ───────── Résumé menu ───────── */
  const dl = $('#dlMenu');
  document.addEventListener('click', (e) => {
    if (dl.open && (!dl.contains(e.target) || e.target.closest('.dl__menu a'))) dl.open = false;
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && dl.open) { dl.open = false; dl.querySelector('summary').focus(); } });

  /* ───────── Cursor + magnetic ───────── */
  if (finePointer && !reduced) {
    root.classList.add('has-cursor');
    const c = $('#cursor');
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
    addEventListener('pointerdown', () => c.classList.add('is-down'));
    addEventListener('pointerup', () => c.classList.remove('is-down'));
    document.addEventListener('pointerover', (e) => {
      c.classList.toggle('is-link', !!e.target.closest('a, button, input, .review, .chip'));
    });
    (function loop() {
      cx += (x - cx) * 0.22; cy += (y - cy) * 0.22;
      c.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    })();

    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.35}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform .5s cubic-bezier(.2,.8,.2,1), background-color .3s, color .3s, border-color .3s';
        el.style.transform = '';
        setTimeout(() => { el.style.transition = ''; }, 500);
      });
    });
  }

  /* ───────── Toolbar: scroll progress, hide on scroll down, active section ───────── */
  const bar = $('#bar');
  const progress = $('#progress');
  const status = $('#buildStatus');
  let lastY = scrollY;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
    progress.style.transform = `scaleX(${p})`;
    const pct = Math.round(p * 100);
    status.textContent = pct >= 99 ? 'Build succeeded' : `Building… ${pct}%`;
    status.classList.toggle('is-done', pct >= 99);
    const y = scrollY;
    bar.classList.toggle('is-hidden', y > lastY && y > 400 && !document.activeElement?.closest?.('.bar'));
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navLinks = $$('.bar__nav a');
  const sectionIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.dataset.target === e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section[id]').forEach((s) => sectionIO.observe(s));

  /* ───────── Reveal ───────── */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal]').forEach((el) => revealIO.observe(el));

  /* ───────── Hero: particle name ───────── */
  function particles() {
    const canvas = $('#heroCanvas');
    const stage = $('#heroStage');
    const ctx = canvas.getContext('2d');
    if (!ctx || reduced) return;
    root.classList.add('has-particles');

    let W = 0, H = 0, dpr = 1, pts = [], visible = true, t = 0, settled = false;
    const mouse = { x: -9999, y: -9999, active: false };
    let ink = '#fff', accent = '#f60';

    const readColors = () => {
      const cs = getComputedStyle(root);
      ink = cs.getPropertyValue('--ink').trim();
      accent = cs.getPropertyValue('--accent').trim();
    };

    const build = (scatter) => {
      const r = stage.getBoundingClientRect();
      W = r.width; H = r.height;
      dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const lines = W < 720 ? ['SHAM', 'KUMAR'] : ['SHAM KUMAR'];
      const off = document.createElement('canvas');
      off.width = Math.ceil(W); off.height = Math.ceil(H);
      const o = off.getContext('2d');
      const family = '"Bricolage Grotesque", system-ui, sans-serif';
      o.font = `800 100px ${family}`;
      const widest = Math.max(...lines.map((l) => o.measureText(l).width));
      let size = 100 * (W * 0.98) / widest;
      size = Math.min(size, (H * 0.92) / (lines.length * 0.86));
      o.font = `800 ${size}px ${family}`;
      o.textAlign = 'center';
      o.textBaseline = 'middle';
      o.fillStyle = '#000';
      const lh = size * 0.86;
      const y0 = H / 2 - (lh * (lines.length - 1)) / 2 + size * 0.04;
      // tighten tracking to match the CSS heading
      lines.forEach((l, i) => {
        if ('letterSpacing' in o) o.letterSpacing = `${-size * 0.05}px`;
        o.fillText(l, W / 2, y0 + i * lh);
      });

      const gap = clamp(Math.round(size / 34), 3, 7);
      const data = o.getImageData(0, 0, off.width, off.height).data;
      const next = [];
      for (let y = 0; y < off.height; y += gap) {
        for (let x = 0; x < off.width; x += gap) {
          if (data[(y * off.width + x) * 4 + 3] > 140) {
            const prev = pts[next.length];
            next.push({
              hx: x, hy: y,
              x: scatter ? Math.random() * W : prev ? prev.x : x,
              y: scatter ? Math.random() * H : prev ? prev.y : y,
              vx: 0, vy: 0,
              s: gap * (0.62 + Math.random() * 0.2),
            });
          }
        }
      }
      pts = next;
      settled = false;
    };

    const R = () => clamp(W / 9, 70, 150);

    const frame = () => {
      requestAnimationFrame(frame);
      if (!visible) return;
      t += 1;
      if (settled && !mouse.active && t % 2) return;
      ctx.clearRect(0, 0, W, H);
      const rad = R(), rad2 = rad * rad;
      const band = (t * 3) % (W + 400) - 200; // sweeping "compile" highlight
      let moving = 0;
      ctx.fillStyle = ink;
      ctx.beginPath();
      const hot = [];
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        if (mouse.active) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < rad2) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / rad) * 7;
            p.vx += (dx / d) * f; p.vy += (dy / d) * f;
          }
        }
        p.vx += (p.hx - p.x) * 0.055; p.vy += (p.hy - p.y) * 0.055;
        p.vx *= 0.8; p.vy *= 0.8;
        p.x += p.vx; p.y += p.vy;
        if (Math.abs(p.vx) + Math.abs(p.vy) > 0.05) moving++;
        const disp = Math.abs(p.x - p.hx) + Math.abs(p.y - p.hy);
        if (disp > 6 || Math.abs(p.hx - band) < 10) hot.push(p);
        else ctx.rect(p.x, p.y, p.s, p.s);
      }
      ctx.fill();
      ctx.fillStyle = accent;
      ctx.beginPath();
      for (const p of hot) ctx.rect(p.x, p.y, p.s, p.s);
      ctx.fill();
      settled = moving === 0;
    };

    const setMouse = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.active = true;
    };
    stage.addEventListener('pointermove', setMouse, { passive: true });
    stage.addEventListener('pointerdown', setMouse, { passive: true });
    stage.addEventListener('pointerleave', () => { mouse.active = false; mouse.x = mouse.y = -9999; });
    stage.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') { mouse.active = false; mouse.x = mouse.y = -9999; } });

    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(stage);

    let rt;
    let lastW = 0;
    new ResizeObserver(() => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        const w = stage.getBoundingClientRect().width;
        if (Math.abs(w - lastW) < 2 && pts.length) return; // ignore mobile URL-bar height jitter
        lastW = w;
        build(false);
      }, 120);
    }).observe(stage);
    addEventListener('themechange', readColors);

    readColors();
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => bootDone).then(() => {
      lastW = stage.getBoundingClientRect().width;
      build(true);
      requestAnimationFrame(frame);
    });
  }
  particles();

  /* ───────── Hero: rotator + counters ───────── */
  const rot = $('#rotator');
  const nb = (s) => s.replace(/ /g, '\u00a0');
  const WORDS = {
    all: ['OneAI Health', 'Android & iOS in parity', 'Dry Revival', 'BLE integrations', 'Flutter apps'],
    android: ['Jetpack Compose screens', 'CameraX + ML Kit scanning', 'Health Connect data', 'Play Store releases'],
    ios: ['SwiftUI charts', 'Dry Revival', 'StoreKit 2 paywalls', 'HealthKit integrations'],
    flutter: ['StayX', 'BLoC architectures', 'one codebase, two stores'],
  };
  let words = WORDS.all, wi = 0;
  const swap = (text) => {
    rot.classList.add('is-out');
    setTimeout(() => { rot.textContent = nb(text); rot.classList.remove('is-out'); }, 350);
  };
  onPlatform((p) => { words = WORDS[p] || WORDS.all; wi = 0; swap(words[0]); });
  if (!reduced) setInterval(() => { wi = (wi + 1) % words.length; swap(words[wi]); }, 2600);

  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      const el = e.target, to = +el.dataset.count;
      if (reduced) { el.textContent = to; return; }
      bootDone.then(() => {
        const t0 = performance.now(), dur = 1400;
        const tick = (now) => {
          const k = clamp((now - t0) / dur, 0, 1);
          el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    });
  });
  $$('[data-count]').forEach((el) => countIO.observe(el));

  /* ───────── ID card tilt ───────── */
  const card = $('#idcard');
  if (finePointer && !reduced && card) {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `rotateY(${px * 12}deg) rotateX(${-py * 12}deg)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  }

  /* ───────── Frameworks ───────── */
  (() => {
    const field = $('#fwField');
    const groupsEl = $('#fwGroups');
    const search = $('#fwSearch');
    const hues = ['var(--accent)', 'var(--add)', 'var(--ok)', 'var(--sec)', 'var(--lead)'];
    const groups = $$('.fw__src', field).map((el, i) => ({
      name: el.dataset.group,
      items: el.textContent.split(',').map((s) => s.trim()).filter(Boolean).map((raw) => {
        const [name, p] = raw.split('|');
        return { name: name.trim(), p: p ? p.trim() : el.dataset.p || 'aif' };
      }),
      color: hues[i % hues.length],
    }));
    field.innerHTML = '';
    const chips = [];
    groups.forEach((g) => g.items.forEach(({ name, p }) => {
      const c = document.createElement('span');
      c.className = 'chip';
      c.dataset.group = g.name;
      c.dataset.p = p;
      c.style.setProperty('--c', g.color);
      c.innerHTML = '<i></i>';
      c.append(name);
      field.appendChild(c);
      chips.push(c);
    }));
    const empty = document.createElement('p');
    empty.className = 'fw__empty';
    empty.hidden = true;
    field.appendChild(empty);
    $('#fwCount').textContent = chips.length;

    let active = null;
    const apply = () => {
      const q = search.value.trim().toLowerCase();
      const pl = platformLetter();
      let n = 0;
      chips.forEach((c) => {
        const onPlat = !pl || c.dataset.p.includes(pl);
        const hit = onPlat && (!active || c.dataset.group === active) && (!q || c.textContent.toLowerCase().includes(q));
        c.classList.toggle('is-match', hit);
        c.classList.toggle('is-plat-off', !onPlat && !active && !q);
        if (hit) n++;
      });
      field.classList.toggle('is-filtering', !!(active || q));
      empty.hidden = n > 0;
      empty.textContent = q ? `error: no such module '${search.value.trim()}'` : `no ${root.dataset.platform} modules in this group`;
      $$('button', groupsEl).forEach((b) => b.classList.toggle('is-on', b.dataset.group === active));
    };

    const mk = (label, group, count) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      if (group) b.dataset.group = group;
      b.innerHTML = `<span></span><small>${count}</small>`;
      b.firstChild.textContent = label;
      b.addEventListener('click', () => { active = active === group ? null : group; apply(); });
      if (finePointer) {
        b.addEventListener('pointerenter', () => { if (!search.value) { const prev = active; active = group; apply(); active = prev; } });
        b.addEventListener('pointerleave', apply);
      }
      li.appendChild(b);
      groupsEl.appendChild(li);
    };
    mk('Everything', undefined, chips.length);
    groups.forEach((g) => mk(g.name, g.name, g.items.length));
    groupsEl.querySelector('button').addEventListener('click', () => { active = null; search.value = ''; apply(); });

    search.addEventListener('input', apply);
    onPlatform(apply);
    addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        search.focus();
        search.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
      }
      if (e.key === 'Escape' && document.activeElement === search) { search.value = ''; apply(); search.blur(); }
    });
  })();

  /* ───────── Changelog: sticky version ───────── */
  (() => {
    const num = $('#clNum'), era = $('#clEra'), fill = $('#clFill');
    const wrap = $('.cl__entries');
    const releases = $$('.release');
    let current = '4.0';
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const v = e.target.dataset.version;
        if (v === current) return;
        current = v;
        num.textContent = v;
        era.textContent = e.target.dataset.era;
        num.classList.remove('is-roll');
        void num.offsetWidth;
        num.classList.add('is-roll');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    releases.forEach((r) => io.observe(r));
    const onS = () => {
      const r = wrap.getBoundingClientRect();
      const p = clamp((innerHeight * 0.5 - r.top) / r.height, 0, 1);
      fill.style.transform = `scaleX(${p})`;
    };
    addEventListener('scroll', onS, { passive: true });
    onS();
  })();

  /* ───────── Builds: devices, carousel, pinned horizontal scroll ───────── */
  (() => {
    const section = $('#builds');
    const track = $('#buildTrack');
    const cards = $$('.build', track);
    const total = cards.filter((c) => !c.classList.contains('build--end')).length;
    $('#buildTotal').textContent = String(total).padStart(2, '0');

    // devices + screenshot loops
    $$('[data-shots]', track).forEach((dev) => {
      const shots = dev.dataset.shots.split(',');
      const holder = dev.classList.contains('phone') ? document.createElement('div') : dev;
      if (holder !== dev) { holder.className = 'phone__screen'; dev.appendChild(holder); }
      const name = dev.closest('.build').querySelector('h3').textContent;
      const imgs = shots.map((s, i) => {
        const img = new Image();
        img.src = `assets/shots/${s}.jpg`;
        img.alt = i === 0 ? `${name} app screenshot` : '';
        img.loading = 'lazy';
        img.decoding = 'async';
        if (i === 0) img.classList.add('on');
        holder.appendChild(img);
        return img;
      });
      if (imgs.length < 2) return;
      const dots = document.createElement('div');
      dots.className = 'dots';
      dots.setAttribute('aria-hidden', 'true');
      dots.innerHTML = imgs.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('');
      dev.appendChild(dots);
      let k = 0, timer = null;
      const show = (n) => {
        imgs[k].classList.remove('on'); dots.children[k].classList.remove('on');
        k = (n + imgs.length) % imgs.length;
        imgs[k].classList.add('on'); dots.children[k].classList.add('on');
      };
      const start = () => { if (!timer && !reduced) timer = setInterval(() => show(k + 1), 2200); };
      const stop = () => { clearInterval(timer); timer = null; };
      new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.4 }).observe(dev);
      dev.addEventListener('click', () => show(k + 1));
      dev.style.cursor = 'pointer';
    });

    onPlatform(() => {
      const pl = platformLetter();
      cards.forEach((c) => c.classList.toggle('is-off', !!pl && !(c.dataset.p || '').includes(pl)));
    });

    const idx = $('#buildIdx'), barEl = $('#buildBar');
    const setMeter = (p) => {
      barEl.style.transform = `scaleX(${p})`;
      idx.textContent = String(clamp(Math.round(p * (total - 1)) + 1, 1, total)).padStart(2, '0');
    };

    const wide = matchMedia('(min-width: 900px) and (min-height: 640px)');
    let dist = 0, pinned = false;

    const layout = () => {
      pinned = wide.matches && !reduced;
      section.classList.toggle('is-pinned', pinned);
      if (!pinned) {
        section.style.height = '';
        track.style.transform = '';
        return;
      }
      dist = Math.max(0, track.scrollWidth - innerWidth);
      section.style.height = `${innerHeight + dist}px`;
      onScroll();
    };
    const onScroll = () => {
      if (!pinned) {
        const max = track.scrollWidth - track.clientWidth;
        setMeter(max > 0 ? track.scrollLeft / max : 0);
        return;
      }
      const top = section.getBoundingClientRect().top;
      const p = dist ? clamp(-top / dist, 0, 1) : 0;
      track.style.transform = `translate3d(${-p * dist}px, 0, 0)`;
      setMeter(p);
    };
    addEventListener('scroll', onScroll, { passive: true });
    track.addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', layout);
    wide.addEventListener?.('change', layout);
    addEventListener('load', layout);
    layout();

    // keep keyboard focus visible inside the pinned track
    track.addEventListener('focusin', (e) => {
      if (!pinned) return;
      const c = e.target.closest('.build');
      if (!c) return;
      const p = clamp((c.offsetLeft - innerWidth * 0.3) / dist, 0, 1);
      scrollTo({ top: section.offsetTop + p * dist, behavior: 'auto' });
    });
  })();

  /* ───────── Reviews: draggable stack ───────── */
  (() => {
    const stack = $('#rvStack');
    let cards = $$('.review', stack);
    const n = cards.length;
    let order = cards.map((_, i) => i);
    const idxEl = $('#rvIdx');

    const paint = () => {
      order.forEach((ci, pos) => {
        const c = cards[ci];
        c.style.zIndex = n - pos;
        c.style.opacity = pos > 2 ? 0 : 1;
        c.style.transform = `translate(${pos * 14}px, ${pos * -14}px) rotate(${pos * 2.2}deg) scale(${1 - pos * 0.04})`;
        c.setAttribute('aria-hidden', pos ? 'true' : 'false');
      });
      idxEl.textContent = order[0] + 1;
    };
    const next = () => { order.push(order.shift()); paint(); };
    const prev = () => { order.unshift(order.pop()); paint(); };
    $('#rvNext').addEventListener('click', next);
    $('#rvPrev').addEventListener('click', prev);
    stack.tabIndex = 0;
    stack.setAttribute('aria-label', 'Reviews. Use left and right arrow keys to browse.');
    stack.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    });

    let drag = null;
    stack.addEventListener('pointerdown', (e) => {
      const top = cards[order[0]];
      if (!top.contains(e.target)) return;
      drag = { el: top, x: e.clientX, y: e.clientY, dx: 0, id: e.pointerId };
      top.classList.add('is-drag');
      top.setPointerCapture(e.pointerId);
    });
    stack.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag.dx = e.clientX - drag.x;
      const dy = (e.clientY - drag.y) * 0.2;
      drag.el.style.transform = `translate(${drag.dx}px, ${dy}px) rotate(${drag.dx * 0.05}deg)`;
    });
    const end = () => {
      if (!drag) return;
      const { el, dx } = drag;
      el.classList.remove('is-drag');
      drag = null;
      if (Math.abs(dx) > 90) {
        el.style.transform = `translate(${Math.sign(dx) * 140}%, 0) rotate(${Math.sign(dx) * 18}deg)`;
        el.style.opacity = 0;
        setTimeout(next, 220);
      } else if (Math.abs(dx) < 4) {
        next();
      } else {
        paint();
      }
    };
    stack.addEventListener('pointerup', end);
    stack.addEventListener('pointercancel', end);
    paint();
  })();

  setPlatform(root.dataset.platform, true);

  /* ───────── Contact: wavy email + copy ───────── */
  (() => {
    const mail = $('#mail');
    const text = mail.textContent;
    mail.setAttribute('aria-label', text);
    mail.innerHTML = '';
    const chars = [...text].map((ch) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = ch;
      mail.appendChild(s);
      return s;
    });
    if (finePointer && !reduced) {
      mail.addEventListener('pointermove', (e) => {
        chars.forEach((s) => {
          const r = s.getBoundingClientRect();
          const d = Math.abs(e.clientX - (r.left + r.width / 2));
          const k = Math.max(0, 1 - d / 140);
          s.style.transform = `translateY(${-k * 18}px)`;
        });
      });
      mail.addEventListener('pointerleave', () => chars.forEach((s) => { s.style.transform = ''; }));
    }

    const toast = $('#toast');
    let tt;
    const say = (msg) => {
      toast.textContent = msg;
      toast.classList.add('is-on');
      clearTimeout(tt);
      tt = setTimeout(() => toast.classList.remove('is-on'), 2600);
    };
    $('#copyMail').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text);
        say('Copied. Status: waiting for review ✓');
      } catch (e) {
        say(text);
      }
    });
  })();
})();
