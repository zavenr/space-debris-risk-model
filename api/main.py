from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime
import os

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

# -------- Debris Data Models --------
class DebrisObject(BaseModel):
    """Model for user-input debris objects"""
    name: str = Field(..., min_length=1, max_length=100, description="Debris object name/identifier")
    altitude_km: float = Field(..., gt=100, lt=50000, description="Altitude in kilometers (100-50000)")
    inclination_deg: float = Field(..., ge=0, le=180, description="Orbital inclination in degrees (0-180)")
    eccentricity: float = Field(0.0, ge=0, lt=1, description="Orbital eccentricity (0-1)")
    mass_kg: Optional[float] = Field(None, gt=0, description="Mass in kilograms (optional)")
    cross_section_m2: Optional[float] = Field(None, gt=0, description="Cross-sectional area in m² (optional)")
    launch_date: Optional[datetime] = Field(None, description="Launch date (optional)")
    
    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty or whitespace only')
        return v.strip()

class DebrisCollection(BaseModel):
    """Collection of debris objects for analysis"""
    objects: List[DebrisObject] = Field(..., min_items=1, max_items=1000)
    analysis_name: Optional[str] = Field(None, description="Name for this analysis session")
    
class DebrisResponse(BaseModel):
    """Response after submitting debris data"""
    message: str
    object_count: int
    analysis_id: str
    created_at: datetime

# -------- 3D Events (dummy) --------
class Event3D(BaseModel):
    x: float          # km, ECI X
    y: float          # km, ECI Y
    z: float          # km, ECI Z
    time_s: float     # event time (seconds from start)
    vrel_km_s: float  # relative speed at encounter
    debris_id: Optional[str] = None  # Reference to debris object

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

# -------- Debris Management Endpoints --------
# In-memory storage for demo (replace with database later)
debris_storage = {}
analysis_counter = 0

@app.post("/debris", response_model=DebrisResponse)
def submit_debris_data(debris_data: DebrisCollection):
    """
    Submit debris objects for risk analysis.
    Validates orbital parameters and stores data for simulation.
    """
    global analysis_counter
    analysis_counter += 1
    
    # Generate analysis ID
    analysis_id = f"analysis_{analysis_counter}_{int(datetime.now().timestamp())}"
    
    # Validate debris objects
    if len(debris_data.objects) > int(os.getenv("MAX_DEBRIS_ENTRIES", 1000)):
        raise HTTPException(
            status_code=400, 
            detail=f"Too many debris objects. Maximum allowed: {os.getenv('MAX_DEBRIS_ENTRIES', 1000)}"
        )
    
    # Store debris data (in production, save to database)
    debris_storage[analysis_id] = {
        "objects": [obj.dict() for obj in debris_data.objects],
        "analysis_name": debris_data.analysis_name,
        "created_at": datetime.now(),
        "object_count": len(debris_data.objects)
    }
    
    return DebrisResponse(
        message="Debris data submitted successfully",
        object_count=len(debris_data.objects),
        analysis_id=analysis_id,
        created_at=datetime.now()
    )

@app.get("/debris/{analysis_id}")
def get_debris_analysis(analysis_id: str):
    """Get debris analysis data by ID"""
    if analysis_id not in debris_storage:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return debris_storage[analysis_id]

@app.get("/debris")
def list_debris_analyses():
    """List all debris analyses"""
    return {
        "analyses": [
            {
                "analysis_id": aid,
                "analysis_name": data["analysis_name"],
                "object_count": data["object_count"],
                "created_at": data["created_at"]
            }
            for aid, data in debris_storage.items()
        ],
        "total_analyses": len(debris_storage)
    }

@app.post("/simulate/{analysis_id}", response_model=SimResponse)
def simulate_with_debris(analysis_id: str):
    """
    Run collision risk simulation using specific debris data.
    This replaces the generic /simulate endpoint for user data.
    """
    if analysis_id not in debris_storage:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    debris_data = debris_storage[analysis_id]
    objects = debris_data["objects"]
    
    # Enhanced simulation based on actual debris parameters
    # For now, we'll create a more realistic heatmap based on the input data
    
    # Group objects by altitude and inclination ranges
    alt_ranges = [(200, 400), (400, 600), (600, 800), (800, 1000), (1000, 1200)]
    inc_ranges = [(0, 30), (30, 60), (60, 90), (90, 120), (120, 180)]
    
    # Initialize heatmap
    H = [[0 for _ in range(len(inc_ranges))] for _ in range(len(alt_ranges))]
    
    # Count objects in each bin
    for obj in objects:
        alt = obj["altitude_km"]
        inc = obj["inclination_deg"]
        
        # Find altitude bin
        alt_bin = -1
        for i, (alt_min, alt_max) in enumerate(alt_ranges):
            if alt_min <= alt <= alt_max:
                alt_bin = i
                break
        
        # Find inclination bin
        inc_bin = -1
        for i, (inc_min, inc_max) in enumerate(inc_ranges):
            if inc_min <= inc <= inc_max:
                inc_bin = i
                break
        
        # Increment count (simulate risk based on density)
        if alt_bin >= 0 and inc_bin >= 0:
            H[alt_bin][inc_bin] += 1
    
    # Create edges for the heatmap
    alt_edges = [r[0] for r in alt_ranges] + [alt_ranges[-1][1]]
    inc_edges = [r[0] for r in inc_ranges] + [inc_ranges[-1][1]]
    
    total_events = sum(sum(row) for row in H)
    
    return {
        "heatmap": {"H": H, "alt_edges": alt_edges, "inc_edges": inc_edges},
        "event_count": total_events,
    }

@app.delete("/debris/{analysis_id}")
def delete_debris_analysis(analysis_id: str):
    """Delete a debris analysis"""
    if analysis_id not in debris_storage:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    deleted_data = debris_storage.pop(analysis_id)
    return {
        "message": f"Analysis '{analysis_id}' deleted successfully",
        "deleted_object_count": deleted_data["object_count"]
    }
