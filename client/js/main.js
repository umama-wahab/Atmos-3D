/**
 * main.js – Atmos
 */

(async () => {
  AtmosUI.init();
  AtmosUI.progress(10);
  AtmosUI.hint('Starting up…');

  AtmosControls.init();
  AtmosUI.renderRecents(AtmosStorage.getRecents());

  AtmosUI.progress(25);
  AtmosUI.hint('Fetching weather…');

  const last = AtmosStorage.getRecents()[0]?.city || 'London';
  await AtmosAPI.search(last);

  // Safety fallback hide
  setTimeout(AtmosUI.hideLoader, 8000);

  console.log('%c ATMOS ', 'background:#4a7a50;color:#e8f0e4;font-size:14px;font-weight:700;padding:4px 8px;border-radius:4px;');
  console.log('%cPress "/" to search', 'color:#7fa882;font-size:11px');
})();
