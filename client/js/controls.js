/**
 * controls.js – Atmos
 */

const AtmosControls = (() => {

  function init() {
    _search();
    _recents();
    _favs();
    _keys();
  }

  function _search() {
    const inp  = document.getElementById('search-input');
    const btn  = document.getElementById('search-btn');
    const drop = document.getElementById('recents-drop');

    const go = () => {
      const v = inp?.value.trim();
      if (v) { AtmosAPI.search(v); inp.blur(); }
    };

    btn?.addEventListener('click', go);
    inp?.addEventListener('keydown', e => {
      if (e.key === 'Enter')  go();
      if (e.key === 'Escape') { inp.blur(); drop?.classList.remove('show'); }
    });
    inp?.addEventListener('focus', () => {
      if (AtmosStorage.getRecents().length) drop?.classList.add('show');
    });

    // close on outside click
    document.addEventListener('click', e => {
      const wrap = document.querySelector('.search-wrap');
      if (!wrap?.contains(e.target)) drop?.classList.remove('show');
    });
  }

  function _recents() {
    document.getElementById('clear-recents')?.addEventListener('click', () => {
      AtmosStorage.clearRecents();
      AtmosUI.renderRecents([]);
    });
  }

  function _favs() {
    const panel   = document.getElementById('fav-panel');
    const openBtn = document.getElementById('btn-fav');
    const closeBtn= document.getElementById('fav-close');
    const addBtn  = document.getElementById('fav-add');

    openBtn?.addEventListener('click', () => {
      panel?.classList.toggle('open');
      openBtn.classList.toggle('on');
      AtmosUI.renderFavs(AtmosStorage.getFavs());
    });
    closeBtn?.addEventListener('click', () => {
      panel?.classList.remove('open');
      document.getElementById('btn-fav')?.classList.remove('on');
    });
    addBtn?.addEventListener('click', () => {
      const wx = AtmosWeather.getCurrent();
      if (!wx) return;
      AtmosStorage.addFav(wx.name);
      AtmosUI.renderFavs(AtmosStorage.getFavs());
      const orig = addBtn.textContent;
      addBtn.textContent = '✓ Added!';
      setTimeout(() => { addBtn.textContent = orig; }, 1500);
    });
  }

  function _keys() {
    document.addEventListener('keydown', e => {
      if (e.key === '/' && document.activeElement?.id !== 'search-input') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    });
  }

  return { init };
})();
