from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Space Debris Risk API", version="1.0.0")

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ Data Models ============
class HeatmapPayload(BaseModel):
    H: List[List[float]]
    alt_edges: List[float]
    inc_edges: List[float]


class SimResponse(BaseModel):
    heatmap: HeatmapPayload
    event_count: int


class Event3D(BaseModel):
    x: float
    y: float
    z: float
    time_s: float
    vrel_km_s: float


class EventsResponse(BaseModel):
    events: List[Event3D]
    earth_radius_km: float


# ============ API Endpoints ============
@app.get("/health")
def health():
    """Check if API is running"""
    return {"status": "ok", "service": "space-debris-risk-api"}


@app.post("/simulate", response_model=SimResponse)
def simulate():
    """
    Generate a collision risk heatmap.
    
    Shows debris density by altitude (vertical) and inclination (horizontal).
    Higher numbers = more debris = higher collision risk in that zone.
    """
    # Simulated debris density by altitude and orbital inclination
    # LEO (Low Earth Orbit) around 500-800km has highest density
    H = [
        [2, 3, 5, 4, 2],      # 200-400km: Some debris
        [4, 8, 12, 9, 5],     # 400-600km: High traffic zone
        [3, 10, 15, 11, 6],   # 600-800km: MOST DANGEROUS - lots of old satellites
        [2, 5, 7, 6, 3],      # 800-1000km: Medium density
        [1, 2, 3, 2, 1],      # 1000-1200km: Lower density
    ]
    
    alt_edges = [200, 400, 600, 800, 1000, 1200]  # altitude ranges in km
    inc_edges = [0, 30, 60, 90, 120, 150]         # orbital inclination in degrees

    return {
        "heatmap": {"H": H, "alt_edges": alt_edges, "inc_edges": inc_edges},
        "event_count": sum(sum(row) for row in H),
    }


@app.get("/events", response_model=EventsResponse)
def get_events():
    """
    Get sample close-approach events for 3D visualization.
    
    Returns debris positions in Earth-Centered Inertial (ECI) coordinates.
    Each event represents a potential collision point in orbit.
    """
    sample_events = [
        {"x": 1200.0, "y": -3400.0, "z": 5200.0, "time_s": 3600.0, "vrel_km_s": 10.2},
        {"x": 800.0, "y": -4200.0, "z": 5100.0, "time_s": 4200.0, "vrel_km_s": 9.1},
        {"x": -1500.0, "y": 2600.0, "z": 5600.0, "time_s": 5400.0, "vrel_km_s": 11.0},
        {"x": -2300.0, "y": 1800.0, "z": 4900.0, "time_s": 6000.0, "vrel_km_s": 8.7},
        {"x": 2000.0, "y": 3000.0, "z": -4500.0, "time_s": 7200.0, "vrel_km_s": 12.3},
        {"x": -800.0, "y": 4100.0, "z": -5000.0, "time_s": 7800.0, "vrel_km_s": 9.8},
        {"x": 3500.0, "y": -2200.0, "z": 4800.0, "time_s": 8400.0, "vrel_km_s": 11.5},
        {"x": -2800.0, "y": -3100.0, "z": 5300.0, "time_s": 9000.0, "vrel_km_s": 10.7},
    ]
    return {"events": sample_events, "earth_radius_km": 6378.137}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
