# Space Debris Risk Model

A simple full-stack app to learn about space debris visualization. Built with FastAPI (Python) and Next.js (React).

## Project Map (Start Here)

- `api/main.py` → FastAPI endpoints (`/health`, `/simulate`, `/events`)
- `web/src/app/page.tsx` → Main UI page and user actions
- `web/src/lib/api.ts` → Frontend API calls (typed)
- `web/src/lib/types.ts` → Shared frontend data types
- `web/src/components/Heatmap.tsx` → 2D risk heatmap chart
- `web/src/components/Events3D.tsx` → 3D debris visualization

## Features

- 🛰️ **Risk Heatmap**: Visualize collision risk by altitude and inclination
- 🌍 **3D Visualization**: Interactive 3D view of close-approach events
- 📊 **Simple API**: Clean REST endpoints for data

## Quick Start

### 1. Backend (Python API)

```bash
cd api
pip install -r requirements.txt
python main.py
```

API runs at: http://localhost:8000  
API docs at: http://localhost:8000/docs

### 2. Frontend (Next.js)

```bash
cd web
npm install
npm run dev
```

## API Endpoints

- `GET /health` - Check if API is running
- `POST /simulate` - Generate risk heatmap
- `GET /events` - Get 3D close-approach events

## Quick Learning Path

1. Run backend, open `http://localhost:8000/docs`, test each endpoint.
2. Run frontend, click each button on the home page, watch network requests.
3. Trace one flow end-to-end (e.g., `POST /simulate` → heatmap render).
4. Make one small change (text/label/color), then one data change in API.
5. Add one new field to an API response and wire it into the UI.

## Next Steps

- Add real orbital mechanics calculations
- Integrate with Space-Track.org API for real debris data
- Add more visualization options
- Create user-defined scenarios

## License

MIT - Learn and experiment freely!
