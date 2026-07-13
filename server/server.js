require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const routes  = require('./routes/weatherRoutes');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));
app.use('/api', routes);
app.get('*', (_, res) => res.sendFile(path.join(__dirname, '../client/index.html')));
app.use((err, req, res, next) => res.status(500).json({ message: 'Server error' }));

app.listen(PORT, () => {
  console.log(`\n🌿 Atmos  →  http://localhost:${PORT}`);
  console.log(`   API key: ${process.env.OPENWEATHER_API_KEY ? '✓ loaded' : '✗ MISSING — add to .env'}\n`);
});
