# 🌿 Atmos — Minimal Weather App

Real photographic backgrounds. Frosted glass UI. Sage green theme.

## Setup

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# → paste your OpenWeatherMap API key (free at openweathermap.org/api)

# 3. Run
npm run dev

# 4. Open
# http://localhost:3000
```

## What changes per weather

| Condition     | Background                        | Particles          |
|--------------|-----------------------------------|--------------------|
| ☀️ Clear      | Real golden sky photo             | None               |
| ☁️ Clouds     | Dramatic cloud photography        | None               |
| 🌧️ Rain       | Dark moody rain photo             | CSS rain streaks   |
| ⛈️ Storm      | Lightning/storm photography       | Heavy CSS rain     |
| ❄️ Snow       | Real snowfall photography         | CSS snowflakes     |
| 🌫️ Mist/Fog   | Misty landscape photography       | None               |
| 🌙 Night      | Full moon / starry sky photo      | None               |
| 🌧️ Night rain  | Rainy night city photography      | CSS rain streaks   |

## Keyboard
- `/` → focus search
- `Enter` → search
- `Escape` → close dropdown

## Stack
- Vanilla JS, HTML5, CSS3 (no frameworks)
- Node.js + Express backend
- OpenWeatherMap API
- Unsplash free image CDN
