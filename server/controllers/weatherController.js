/**
 * weatherController.js – Atmos
 * Uses node-fetch for clean HTTP requests to OpenWeatherMap
 */

const fetch = require('node-fetch');
const _log  = [];

const API_KEY = () => process.env.OPENWEATHER_API_KEY;
const BASE    = 'https://api.openweathermap.org/data/2.5';

async function current(req, res) {
  const city = req.query.city?.trim();
  if (!city)      return res.status(400).json({ message: 'City name required' });
  if (!API_KEY()) return res.status(500).json({ message: 'API key not configured — add OPENWEATHER_API_KEY to .env' });

  try {
    const url  = `${BASE}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY()}`;
    const resp = await fetch(url);
    const body = await resp.json();

    if (resp.status === 404) return res.status(404).json({ message: `City "${city}" not found` });
    if (resp.status === 401) return res.status(401).json({ message: 'Invalid API key — check your .env file' });
    if (!resp.ok)            return res.status(resp.status).json({ message: body.message || 'Weather API error' });

    res.json(body);
  } catch (e) {
    console.error('[weather]', e.message);
    res.status(503).json({ message: 'Could not reach weather service' });
  }
}

async function forecast(req, res) {
  const city = req.query.city?.trim();
  if (!city)      return res.status(400).json({ message: 'City required' });
  if (!API_KEY()) return res.status(500).json({ message: 'API key not configured' });

  try {
    const url  = `${BASE}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY()}`;
    const resp = await fetch(url);
    const body = await resp.json();

    if (!resp.ok) return res.status(resp.status).json({ message: body.message || 'Forecast error' });

    res.json(body);
  } catch (e) {
    console.error('[forecast]', e.message);
    res.status(503).json({ message: 'Could not reach forecast service' });
  }
}

function log(req, res) {
  const { city } = req.body || {};
  if (city) {
    _log.unshift({ city, ts: new Date().toISOString() });
    if (_log.length > 100) _log.pop();
  }
  res.json({ ok: true });
}

module.exports = { current, forecast, log };
