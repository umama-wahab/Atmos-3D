/**
 * backgrounds.js – Atmos (fixed)
 * Real Unsplash photographic backgrounds per weather
 */

const AtmosBG = (() => {

  const PHOTOS = {
    sunny: [
      'https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=1920&q=85&fit=crop',
      'https://images.unsplash.com/photo-1563630381190-77c336ea545a?q=80&w=689&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=1920&q=85&fit=crop',
    ],
    cloudy: [
      'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=85&fit=crop',
      'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1499956827185-0d63ee78a910?w=1920&q=85&fit=crop',
    ],
    rain: [
      'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1920&q=85&fit=crop',
      'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=1920&q=85&fit=crop',
      'https://images.unsplash.com/photo-1620385019253-b051a26048ce?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ],
    storm: [
      'https://images.unsplash.com/photo-1429552077091-836152271555?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHN0b3JtfGVufDB8fDB8fHww',
      'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ],
    snow: [
      'https://images.unsplash.com/photo-1477601263568-180e2c6d046e?w=1920&q=85&fit=crop',
      'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1920&q=85&fit=crop',
      'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=1920&q=85&fit=crop',
    ],
    mist: [
      'https://images.unsplash.com/photo-1487621167305-5d248087c724?w=1920&q=85&fit=crop',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1274&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ],
    night: [
      'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=85&fit=crop',
      'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1920&q=85&fit=crop',
      'https://images.unsplash.com/photo-1488866022504-f2584929ca5f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bmlnaHR8ZW58MHx8MHx8fDA%3D',
    ],
    night_rain: [
      'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=1920&q=85&fit=crop',
      
    ],
    night_snow: [
      'https://images.unsplash.com/photo-1551582045-6ec9c11d8697?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1642517358623-a59b74fbb228?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ],
  };

  const OVERLAYS = {
    sunny:      'linear-gradient(180deg,rgba(0,0,0,.18) 0%,rgba(0,0,0,.02) 38%,rgba(0,0,0,.02) 58%,rgba(0,0,0,.55) 100%)',
    cloudy:     'linear-gradient(180deg,rgba(0,0,0,.32) 0%,rgba(0,0,0,.12) 38%,rgba(0,0,0,.12) 58%,rgba(0,0,0,.62) 100%)',
    rain:       'linear-gradient(180deg,rgba(0,0,0,.42) 0%,rgba(0,0,0,.22) 38%,rgba(0,0,0,.22) 58%,rgba(0,0,0,.70) 100%)',
    storm:      'linear-gradient(180deg,rgba(0,0,0,.58) 0%,rgba(0,0,0,.32) 38%,rgba(0,0,0,.32) 58%,rgba(0,0,0,.76) 100%)',
    snow:       'linear-gradient(180deg,rgba(0,0,0,.18) 0%,rgba(0,0,0,.05) 38%,rgba(0,0,0,.05) 58%,rgba(0,0,0,.52) 100%)',
    mist:       'linear-gradient(180deg,rgba(0,0,0,.38) 0%,rgba(0,0,0,.18) 38%,rgba(0,0,0,.18) 58%,rgba(0,0,0,.62) 100%)',
    night:      'linear-gradient(180deg,rgba(0,0,0,.48) 0%,rgba(0,0,0,.22) 38%,rgba(0,0,0,.22) 58%,rgba(0,0,0,.72) 100%)',
    night_rain: 'linear-gradient(180deg,rgba(0,0,0,.58) 0%,rgba(0,0,0,.32) 38%,rgba(0,0,0,.32) 58%,rgba(0,0,0,.76) 100%)',
    night_snow: 'linear-gradient(180deg,rgba(0,0,0,.42) 0%,rgba(0,0,0,.22) 38%,rgba(0,0,0,.22) 58%,rgba(0,0,0,.66) 100%)',
  };

  let currentKey = null;

  function setBackground(weatherMain, weatherDesc, isNight) {
    // resolve key
    let key = 'sunny';
    const m = (weatherMain || '').toLowerCase();
    const d = (weatherDesc  || '').toLowerCase();

    if (isNight) {
      if (m === 'rain' || m === 'drizzle' || m === 'thunderstorm') key = 'night_rain';
      else if (m === 'snow') key = 'night_snow';
      else key = 'night';
    } else {
      if (m === 'thunderstorm')      key = 'storm';
      else if (m === 'rain' || m === 'drizzle' || m === 'squall') key = 'rain';
      else if (m === 'snow' || d.includes('sleet')) key = 'snow';
      else if (m === 'mist' || m === 'fog' || m === 'haze' ||
               m === 'smoke' || m === 'dust' || m === 'ash') key = 'mist';
      else if (m === 'clouds')       key = 'cloudy';
      else                           key = 'sunny';
    }

    // get elements fresh each call (safe)
    const bgEl = document.getElementById('bg-image');
    const ovEl = document.getElementById('bg-overlay');
    if (!bgEl || !ovEl) return key;

    // always update overlay immediately
    ovEl.style.background = OVERLAYS[key] || OVERLAYS.sunny;

    if (key === currentKey) return key;
    currentKey = key;

    // pick random photo from set
    const arr = PHOTOS[key] || PHOTOS.sunny;
    const url = arr[Math.floor(Math.random() * arr.length)];

    // preload then crossfade
    const img = new Image();
    img.onload = () => {
      bgEl.style.opacity = '0';
      setTimeout(() => {
        bgEl.style.backgroundImage = `url('${url}')`;
        bgEl.style.opacity = '1';
      }, 400);
    };
    img.onerror = () => {
      // fallback — just set without preload
      bgEl.style.backgroundImage = `url('${url}')`;
      bgEl.style.opacity = '1';
    };
    img.src = url;

    return key;
  }

  function getCurrentKey() { return currentKey; }

  return { setBackground, getCurrentKey };
})();
