/**
 * particles.js – Atmos
 * CSS-based rain and snow particle systems
 */

const AtmosParticles = (() => {

  const container = document.getElementById('bg-particles');
  let activeType = null;

  function clear() {
    container.innerHTML = '';
    activeType = null;
  }

  function rain(intensity = 'moderate') {
    if (activeType === 'rain_' + intensity) return;
    clear();
    activeType = 'rain_' + intensity;

    const isMobile = window.innerWidth < 768;
    const counts = { light: isMobile ? 40 : 80, moderate: isMobile ? 80 : 160, heavy: isMobile ? 120 : 240 };
    const count = counts[intensity] || counts.moderate;

    for (let i = 0; i < count; i++) {
      const drop = document.createElement('div');
      drop.className = 'raindrop';

      const w = 1 + Math.random() * 1.2;
      const h = 14 + Math.random() * 24;
      const left = Math.random() * 110 - 5; // slightly off-screen sides
      const delay = Math.random() * 2;
      const dur = 0.5 + Math.random() * 0.6;
      const opacity = 0.3 + Math.random() * 0.45;

      drop.style.cssText = `
        width: ${w}px;
        height: ${h}px;
        left: ${left}%;
        top: -${h}px;
        opacity: ${opacity};
        animation-duration: ${dur}s;
        animation-delay: -${delay}s;
        transform: rotate(12deg);
      `;
      container.appendChild(drop);
    }
  }

  function snow(intensity = 'light') {
    if (activeType === 'snow_' + intensity) return;
    clear();
    activeType = 'snow_' + intensity;

    const isMobile = window.innerWidth < 768;
    const counts = { light: isMobile ? 30 : 60, moderate: isMobile ? 55 : 110, heavy: isMobile ? 80 : 160 };
    const count = counts[intensity] || counts.light;

    for (let i = 0; i < count; i++) {
      const flake = document.createElement('div');
      flake.className = 'snowflake';

      const size = 2 + Math.random() * 5;
      const left = Math.random() * 108 - 4;
      const delay = Math.random() * 4;
      const dur = 3 + Math.random() * 5;
      const opacity = 0.4 + Math.random() * 0.55;
      const blur = Math.random() > 0.6 ? `blur(${Math.random() * 1.5}px)` : 'none';

      flake.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        top: -${size}px;
        opacity: ${opacity};
        filter: ${blur};
        animation-duration: ${dur}s;
        animation-delay: -${delay}s;
      `;
      container.appendChild(flake);
    }
  }

  function none() {
    // Fade out and clear
    container.style.opacity = '0';
    container.style.transition = 'opacity 0.8s ease';
    setTimeout(() => {
      clear();
      container.style.opacity = '1';
      container.style.transition = '';
    }, 800);
  }

  function setWeather(weatherMain, weatherDesc) {
    const m = weatherMain.toLowerCase();
    const d = weatherDesc.toLowerCase();

    if (m === 'thunderstorm') {
      rain('heavy');
    } else if (m === 'rain') {
      if (d.includes('heavy') || d.includes('extreme')) rain('heavy');
      else if (d.includes('light') || d.includes('drizzle')) rain('light');
      else rain('moderate');
    } else if (m === 'drizzle') {
      rain('light');
    } else if (m === 'snow') {
      if (d.includes('heavy')) snow('heavy');
      else if (d.includes('light')) snow('light');
      else snow('moderate');
    } else if (d.includes('sleet')) {
      snow('light');
    } else {
      none();
    }
  }

  return { setWeather, rain, snow, none, clear };
})();
