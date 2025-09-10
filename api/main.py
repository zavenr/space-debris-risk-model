from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Orbital Risk API", version="0.2.0")

# Allow the Next.js dev server during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # add your deployed frontend URL later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------- Health --------
@app.get("/health")
def health():
    return {"status": "ok", "service": "orbital-risk-api"}

# -------- Heatmap (dummy) --------
class HeatmapPayload(BaseModel):
    H: List[List[float]]
    alt_edges: List[float]
    inc_edges: List[float]

class SimResponse(BaseModel):
    heatmap: HeatmapPayload
    event_count: int

@app.post("/simulate", response_model=SimResponse)
def simulate():
    # super tiny fake heatmap: 3x3 grid
    H = [
        [1, 2, 3],
        [2, 5, 2],
        [1, 2, 1],
    ]
    alt_edges = [400, 600, 800, 1000]   # km
    inc_edges = [0, 30, 60, 90]         # degrees
    return {
        "heatmap": {"H": H, "alt_edges": alt_edges, "inc_edges": inc_edges},
        "event_count": sum(sum(row) for row in H),
    }

# -------- 3D Events (dummy) --------
class Event3D(BaseModel):
    x: float          # km, ECI X
    y: float          # km, ECI Y
    z: float          # km, ECI Z
    time_s: float     # event time (seconds from start)
    vrel_km_s: float  # relative speed at encounter

class EventsResponse(BaseModel):
    events: List[Event3D]
    earth_radius_km: float = 6378.137

@app.get("/events", response_model=EventsResponse)
def get_events():
    """
    Returns a few dummy close-approach 'events' as ECI positions.
    We'll replace with real simulation later.
    """
    sample_events = [
        {"x":  1200.0, "y": -3400.0, "z":  5200.0, "time_s": 3600.0, "vrel_km_s": 10.2},
        {"x":   800.0, "y": -4200.0, "z":  5100.0, "time_s": 4200.0, "vrel_km_s":  9.1},
        {"x": -1500.0, "y":  2600.0, "z":  5600.0, "time_s": 5400.0, "vrel_km_s": 11.0},
        {"x": -2300.0, "y":  1800.0, "z":  4900.0, "time_s": 6000.0, "vrel_km_s":  8.7},
        {"x":  2000.0, "y":  3000.0, "z": -4500.0, "time_s": 7200.0, "vrel_km_s": 12.3},
    ]
    return {"events": sample_events, "earth_radius_km": 6378.137}
