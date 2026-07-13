const https = require('https');
const KEY   = () => process.env.OPENWEATHER_API_KEY;
const _log  = [];

function request(path) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname: 'api.openweathermap.org', path }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch { reject(new Error('Parse error')); }
      });
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('Request timed out')); });
    req.end();
  });
}

async function current(req, res) {
  const city = req.query.city?.trim();
  if (!city)  return res.status(400).json({ message: 'City name required' });
  if (!KEY()) return res.status(500).json({ message: 'API key not configured — add OPENWEATHER_API_KEY to .env' });

  try {
    const { status, body } = await request(
      `/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${KEY()}`
    );
    if (status === 404) return res.status(404).json({ message: `City "${city}" not found` });
    if (status === 401) return res.status(401).json({ message: 'Invalid API key — check your .env file. New keys take up to 2 hours to activate.' });
    if (status !== 200) return res.status(status).json({ message: body.message || 'Weather API error' });
    res.json(body);
  } catch (e) {
    res.status(503).json({ message: e.message === 'Request timed out' ? 'Weather service timed out' : 'Service unavailable' });
  }
}

async function forecast(req, res) {
  const city = req.query.city?.trim();
  if (!city)  return res.status(400).json({ message: 'City required' });
  if (!KEY()) return res.status(500).json({ message: 'API key not configured' });

  try {
    const { status, body } = await request(
      `/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${KEY()}`
    );
    if (status !== 200) return res.status(status).json({ message: body.message || 'Forecast error' });
    res.json(body);
  } catch (e) {
    res.status(503).json({ message: 'Forecast service unavailable' });
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
