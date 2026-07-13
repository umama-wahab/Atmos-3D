/**
 * ui.js – Atmos  (fixed)
 */

const AtmosUI = (() => {
  const $ = id => document.getElementById(id);

  function init() { _clock(); }

  /* ── Loading ── */
  function progress(n) {
    const b = $('loader-bar');
    if (b) b.style.width = n + '%';
  }
  function hint(t) {
    const h = $('loader-sub');
    if (h) h.textContent = t;
  }
  function hideLoader() {
    const l = $('loader');
    if (!l) return;
    l.classList.add('gone');
    setTimeout(() => { if (l.parentNode) l.parentNode.removeChild(l); }, 900);
  }

  /* ── Errors ── */
  function error(msg) {
    const el = $('search-error');
    if (!el) return;
    el.textContent = msg;
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.textContent = ''; }, 4500);
  }
  function clearError() {
    const el = $('search-error');
    if (el) el.textContent = '';
  }

  /* ── Main weather render ── */
  function renderWeather(wx, fc) {
    const W = AtmosWeather;

    // Hero text
    _set('hero-city',    wx.name);
    _set('hero-country', wx.sys.country);
    _animNum('hero-temp', W.tempC(wx.main.temp));
    _set('hero-desc',    wx.weather[0].description);
    _set('hero-feels',   `Feels like ${W.tempC(wx.main.feels_like)}°`);

    // Stats
    _set('s-humidity',   `${wx.main.humidity}%`);
    _set('s-wind',       W.wind(wx.wind.speed));
    _set('s-pressure',   W.pressure(wx.main.pressure));
    _set('s-visibility', W.visibility(wx.visibility));

    // Forecast
    if (fc) _renderFc(W.buildForecast(fc));

    // Show panels (these IDs exist)
    _show('weather-hero',   'show');
    _show('bottom-section', 'show');

    // Background photo + particles
    AtmosBG.setBackground(
      wx.weather[0].main,
      wx.weather[0].description,
      W.isNighttime()
    );
    AtmosParticles.setWeather(
      wx.weather[0].main,
      wx.weather[0].description
    );

    // Clear search input
    const inp = $('search-input');
    if (inp) inp.value = '';
  }

  function _renderFc(days) {
    const row = $('forecast-row');
    if (!row || !days.length) return;
    row.innerHTML = days.map(d => `
      <div class="fc-day">
        <div class="fc-day-name">${d.day}</div>
        <div class="fc-day-icon">${d.icon}</div>
        <div class="fc-day-hi">${d.hi}°</div>
        <div class="fc-day-lo">${d.lo}°</div>
      </div>
    `).join('');
  }

  /* ── Recents ── */
  function renderRecents(list) {
    const drop = $('recents-drop');
    const cont = $('recents-list');
    if (!drop || !cont) return;

    if (!list.length) {
      drop.classList.remove('show');
      return;
    }

    cont.innerHTML = list.map((r, i) => `
      <div class="recent-item" data-city="${r.city}">
        <span class="recent-city">${r.city}</span>
        <span class="recent-time">${_ago(r.ts)}</span>
        <button class="recent-del" data-i="${i}">✕</button>
      </div>
    `).join('');

    cont.querySelectorAll('.recent-item').forEach(el => {
      el.addEventListener('click', e => {
        if (e.target.classList.contains('recent-del')) return;
        AtmosAPI.search(el.dataset.city);
        drop.classList.remove('show');
      });
    });
    cont.querySelectorAll('.recent-del').forEach(btn => {
      btn.addEventListener('click', () => {
        AtmosStorage.removeRecent(+btn.dataset.i);
        renderRecents(AtmosStorage.getRecents());
      });
    });
  }

  /* ── Favorites ── */
  function renderFavs(list) {
    const el = $('fav-list');
    if (!el) return;
    if (!list.length) {
      el.innerHTML = '<p class="fav-empty">No favorites yet</p>';
      return;
    }
    el.innerHTML = list.map((c, i) => `
      <div class="fav-item" data-city="${c}">
        <span class="fav-name">⭐ ${c}</span>
        <button class="fav-rm" data-i="${i}">✕</button>
      </div>
    `).join('');

    el.querySelectorAll('.fav-item').forEach(item => {
      item.addEventListener('click', e => {
        if (e.target.classList.contains('fav-rm')) return;
        AtmosAPI.search(item.dataset.city);
        $('fav-panel')?.classList.remove('open');
        $('btn-fav')?.classList.remove('on');
      });
    });
    el.querySelectorAll('.fav-rm').forEach(btn => {
      btn.addEventListener('click', () => {
        AtmosStorage.removeFav(+btn.dataset.i);
        renderFavs(AtmosStorage.getFavs());
      });
    });
  }

  /* ── helpers ── */
  function _set(id, val) {
    const e = $(id);
    if (e) e.textContent = val;
  }

  function _show(id, cls) {
    const e = $(id);
    if (e) e.classList.add(cls);
  }

  function _animNum(id, target) {
    const el = $(id);
    if (!el) return;
    const start = parseFloat(el.textContent) || 0;
    const dur = 800;
    const t0  = performance.now();
    const step = now => {
      const p = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (target - start) * ease);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function _ago(ts) {
    const m = Math.floor((Date.now() - ts) / 60000);
    if (m < 1)  return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
  }

  function _clock() {
    const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const MONS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const tick = () => {
      const n  = new Date();
      const c  = $('clock');
      const d  = $('clock-date');
      if (c) c.textContent = `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;
      if (d) d.textContent = `${DAYS[n.getDay()].slice(0,3)} ${MONS[n.getMonth()]} ${n.getDate()}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  return { init, progress, hint, hideLoader, error, clearError, renderWeather, renderRecents, renderFavs };
})();
