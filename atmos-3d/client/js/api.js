/**
 * api.js + storage – Atmos (fixed)
 */

/* ── API ─────────────────────────────────────── */
const AtmosAPI = (() => {
  // works on localhost:3000 and on any deployed host
  const BASE = () => {
    if (window.location.port === '3000' || window.location.hostname === 'localhost') {
      return '';  // same origin
    }
    return '';
  };

  let busy = false;

  async function search(city) {
    if (!city?.trim()) { AtmosUI.error('Enter a city name'); return; }
    if (busy) return;
    busy = true;

    AtmosUI.clearError();
    AtmosUI.progress(25);
    AtmosUI.hint('Fetching weather…');

    try {
      const base = BASE();
      const [wxRes, fcRes] = await Promise.all([
        fetch(`${base}/api/weather?city=${encodeURIComponent(city.trim())}`),
        fetch(`${base}/api/forecast?city=${encodeURIComponent(city.trim())}`),
      ]);

      AtmosUI.progress(65);

      if (!wxRes.ok) {
        let errMsg = 'City not found';
        try { const e = await wxRes.json(); errMsg = e.message || errMsg; } catch {}
        throw new Error(errMsg);
      }

      const wx = await wxRes.json();
      const fc = fcRes.ok ? await fcRes.json().catch(() => null) : null;

      AtmosWeather.setData(wx, fc);
      AtmosStorage.addRecent(wx.name);

      AtmosUI.progress(85);
      AtmosUI.hint('Almost there…');

      AtmosUI.renderWeather(wx, fc);
      AtmosUI.renderRecents(AtmosStorage.getRecents());

      // fire-and-forget search log
      fetch(`${base}/api/search-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: wx.name }),
      }).catch(() => {});

      AtmosUI.progress(100);
      setTimeout(AtmosUI.hideLoader, 500);

    } catch (err) {
      console.error('[AtmosAPI]', err);
      AtmosUI.error(
        err.message === 'Failed to fetch'
          ? 'Network error – check your connection'
          : err.message || 'Something went wrong'
      );
    } finally {
      busy = false;
    }
  }

  return { search };
})();


/* ── Storage ─────────────────────────────────── */
const AtmosStorage = (() => {
  const RK = 'atmos_recents';
  const FK = 'atmos_favs';

  const _read  = k => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; } };
  const _write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  function getRecents()    { return _read(RK); }
  function addRecent(city) {
    const a = getRecents().filter(r => r.city.toLowerCase() !== city.toLowerCase());
    a.unshift({ city, ts: Date.now() });
    _write(RK, a.slice(0, 8));
  }
  function removeRecent(i) { const a = getRecents(); a.splice(i, 1); _write(RK, a); }
  function clearRecents()  { try { localStorage.removeItem(RK); } catch {} }

  function getFavs()     { return _read(FK); }
  function addFav(city)  { const a = getFavs(); if (!a.includes(city)) { a.push(city); _write(FK, a); } }
  function removeFav(i)  { const a = getFavs(); a.splice(i, 1); _write(FK, a); }

  return { getRecents, addRecent, removeRecent, clearRecents, getFavs, addFav, removeFav };
})();
