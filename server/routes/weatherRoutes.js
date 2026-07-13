const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/weatherController');

router.get('/weather',     ctrl.current);
router.get('/forecast',    ctrl.forecast);
router.post('/search-log', ctrl.log);
router.get('/health',      (_, res) => res.json({ ok: true, ts: new Date().toISOString() }));

module.exports = router;

// Debug route — remove in production
router.get('/debug', (req, res) => {
  const key = process.env.OPENWEATHER_API_KEY;
  res.json({
    keyLoaded: !!key,
    keyPreview: key ? key.substring(0, 6) + '...' + key.slice(-4) : 'MISSING',
    envFile: require('path').join(__dirname, '../../.env'),
  });
});
