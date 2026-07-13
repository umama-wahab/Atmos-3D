/**
 * weather.js – Atmos
 */

const AtmosWeather = (() => {
  let _current = null, _forecast = null;

  const ICONS = {
    'clear sky':'☀️','few clouds':'🌤️','scattered clouds':'⛅',
    'broken clouds':'🌥️','overcast clouds':'☁️',
    'light rain':'🌦️','moderate rain':'🌧️','heavy intensity rain':'🌧️',
    'light drizzle':'🌦️','drizzle':'🌦️','shower rain':'🌧️',
    'light snow':'🌨️','snow':'❄️','heavy snow':'❄️','sleet':'🌨️',
    'thunderstorm':'⛈️','thunderstorm with light rain':'⛈️','thunderstorm with heavy rain':'⛈️',
    'mist':'🌫️','smoke':'🌫️','haze':'🌫️','fog':'🌫️',
    'tornado':'🌪️','squalls':'💨',
  };

  function setData(c, f) { _current = c; _forecast = f; }
  function getCurrent()  { return _current; }
  function getForecast() { return _forecast; }

  function isNighttime() {
    if (!_current?.sys) return false;
    const now = Math.floor(Date.now() / 1000);
    return now < _current.sys.sunrise || now > _current.sys.sunset;
  }

  function icon(desc) {
    if (!desc) return '🌡️';
    const k = desc.toLowerCase();
    for (const [key, val] of Object.entries(ICONS)) {
      if (k.includes(key)) return val;
    }
    return '🌡️';
  }

  function tempC(k)      { return Math.round(k - 273.15); }
  function wind(ms)      { return `${Math.round(ms * 3.6)} km/h`; }
  function pressure(hpa) { return `${hpa} hPa`; }
  function visibility(m) {
    if (m == null) return 'N/A';
    return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
  }

  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  function buildForecast(data) {
    if (!data?.list) return [];
    const today = new Date().getDate();
    const map = {};
    data.list.forEach(item => {
      const d = new Date(item.dt * 1000);
      if (d.getDate() === today) return;
      const key = d.toDateString();
      if (!map[key]) map[key] = { dt: item.dt, temps: [], descs: [] };
      map[key].temps.push(item.main.temp);
      map[key].descs.push(item.weather[0].description);
    });
    return Object.values(map).slice(0, 5).map(d => ({
      day:  DAYS[new Date(d.dt * 1000).getDay()],
      hi:   tempC(Math.max(...d.temps)),
      lo:   tempC(Math.min(...d.temps)),
      icon: icon(d.descs[Math.floor(d.descs.length / 2)]),
    }));
  }

  return { setData, getCurrent, getForecast, isNighttime, icon, tempC, wind, pressure, visibility, buildForecast };
})();
