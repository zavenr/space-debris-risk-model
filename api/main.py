from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

API_TITLE = "Space Debris Risk API"
API_VERSION = "1.0.0"
SERVICE_NAME = "space-debris-risk-api"
EARTH_RADIUS_KM = 6378.137

app = FastAPI(title=API_TITLE, version=API_VERSION)

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


# ============ Sample Data (Learning-Friendly) ============
HEATMAP_MATRIX = [
    [2, 3, 5, 4, 2],  # 200-400km: Some debris
    [4, 8, 12, 9, 5],  # 400-600km: High traffic zone
    [3, 10, 15, 11, 6],  # 600-800km: MOST DANGEROUS - lots of old satellites
    [2, 5, 7, 6, 3],  # 800-1000km: Medium density
    [1, 2, 3, 2, 1],  # 1000-1200km: Lower density
]

ALTITUDE_EDGES_KM = [200, 400, 600, 800, 1000, 1200]
INCLINATION_EDGES_DEG = [0, 30, 60, 90, 120, 150]

SAMPLE_EVENTS = [
    {"x": 1200.0, "y": -3400.0, "z": 5200.0, "time_s": 3600.0, "vrel_km_s": 10.2},
    {"x": 800.0, "y": -4200.0, "z": 5100.0, "time_s": 4200.0, "vrel_km_s": 9.1},
    {"x": -1500.0, "y": 2600.0, "z": 5600.0, "time_s": 5400.0, "vrel_km_s": 11.0},
    {"x": -2300.0, "y": 1800.0, "z": 4900.0, "time_s": 6000.0, "vrel_km_s": 8.7},
    {"x": 2000.0, "y": 3000.0, "z": -4500.0, "time_s": 7200.0, "vrel_km_s": 12.3},
    {"x": -800.0, "y": 4100.0, "z": -5000.0, "time_s": 7800.0, "vrel_km_s": 9.8},
    {"x": 3500.0, "y": -2200.0, "z": 4800.0, "time_s": 8400.0, "vrel_km_s": 11.5},
    {"x": -2800.0, "y": -3100.0, "z": 5300.0, "time_s": 9000.0, "vrel_km_s": 10.7},
]


def count_debris_objects(matrix: List[List[float]]) -> int:
    return int(sum(sum(row) for row in matrix))


# ============ API Endpoints ============
@app.get("/health")
def health():
    """Check if API is running"""
    return {"status": "ok", "service": SERVICE_NAME}


@app.post("/simulate", response_model=SimResponse)
def simulate():
    """
    Generate a collision risk heatmap.
    
    Shows debris density by altitude (vertical) and inclination (horizontal).
    Higher numbers = more debris = higher collision risk in that zone.
    """
    heatmap_payload = HeatmapPayload(
        H=HEATMAP_MATRIX,
        alt_edges=ALTITUDE_EDGES_KM,
        inc_edges=INCLINATION_EDGES_DEG,
    )
    return SimResponse(
        heatmap=heatmap_payload,
        event_count=count_debris_objects(HEATMAP_MATRIX),
    )


@app.get("/events", response_model=EventsResponse)
def get_events():
    """
    Get sample close-approach events for 3D visualization.
    
    Returns debris positions in Earth-Centered Inertial (ECI) coordinates.
    Each event represents a potential collision point in orbit.
    """
    return EventsResponse(
        events=[Event3D(**event) for event in SAMPLE_EVENTS],
        earth_radius_km=EARTH_RADIUS_KM,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
