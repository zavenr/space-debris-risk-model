# Space Debris Risk Model

A simple full-stack app to learn about space debris visualization. Built with FastAPI (Python) and Next.js (React).

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

## What You Can Learn

- FastAPI basics and REST APIs
- React hooks and state management
- 3D visualization with Plotly
- Full-stack data flow
- TypeScript and Python typing

## Next Steps

Want to expand? Try:

- Add real orbital mechanics calculations
- Integrate with Space-Track.org API for real debris data
- Add more visualization options
- Create user-defined scenarios

## License

MIT - Learn and experiment freely!
