from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime
import os
import logging
import math
from config import settings

# Configure logging based on settings
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Space Debris Risk Model API",
    description="Advanced orbital collision risk analysis and visualization",
    version="1.0.0",
    debug=settings.debug
)

# Configure CORS with dynamic origins based on environment
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info(f"CORS configured for origins: {settings.cors_origins_list}")

# -------- Health --------
@app.get("/health")
def health():
    logger.info("Health endpoint accessed")
    return {
        "status": "ok", 
        "service": "space-debris-risk-api",
        "environment": settings.environment,
        "version": "1.0.0",
        "debug": settings.debug
    }

# -------- Debris Data Models --------
class DebrisObject(BaseModel):
    """Model for user-input debris objects"""
    name: str = Field(..., min_length=1, max_length=100, description="Debris object name/identifier")
    altitude_km: float = Field(..., gt=100, lt=50000, description="Altitude in kilometers (100-50000)")
    inclination_deg: float = Field(..., ge=0, le=180, description="Orbital inclination in degrees (0-180)")
    eccentricity: float = Field(0.0, ge=0, lt=1, description="Orbital eccentricity (0-1)")
    mass_kg: Optional[float] = Field(None, gt=0, description="Mass in kilograms (optional)")
    cross_section_m2: Optional[float] = Field(None, gt=0, description="Cross-sectional area in m (optional)")
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

# -------- Heatmap Models --------
class HeatmapPayload(BaseModel):
    H: List[List[float]]
    alt_edges: List[float]
    inc_edges: List[float]

class SimResponse(BaseModel):
    heatmap: HeatmapPayload
    event_count: int

# -------- 3D Events Models --------
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

# -------- In-memory storage for demo --------
debris_storage = {}
analysis_counter = 0

# -------- Debris Management Endpoints --------
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
    max_entries = int(os.getenv("MAX_DEBRIS_ENTRIES", "1000"))
    if len(debris_data.objects) > max_entries:
        raise HTTPException(
            status_code=400, 
            detail=f"Too many debris objects. Maximum allowed: {max_entries}"
        )
    
    # Store debris data (in production, save to database)
    debris_storage[analysis_id] = {
        "objects": [obj.dict() for obj in debris_data.objects],
        "analysis_name": debris_data.analysis_name,
        "created_at": datetime.now(),
        "object_count": len(debris_data.objects)
    }
    
    logger.info(f"Stored debris analysis {analysis_id} with {len(debris_data.objects)} objects")
    
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

# -------- Simulation Endpoints --------
@app.post("/simulate", response_model=SimResponse)
def simulate():
    """Basic simulation with dummy data"""
    logger.info("Starting basic orbital risk simulation")
    
    # super tiny fake heatmap: 3x3 grid
    H = [
        [1, 2, 3],
        [2, 5, 2],
        [1, 2, 1],
    ]
    alt_edges = [400, 600, 800, 1000]   # km
    inc_edges = [0, 30, 60, 90]         # degrees
    
    event_count = sum(sum(row) for row in H)
    logger.info(f"Simulation completed with {event_count} events")
    
    return {
        "heatmap": {"H": H, "alt_edges": alt_edges, "inc_edges": inc_edges},
        "event_count": event_count,
    }

@app.post("/simulate/{analysis_id}", response_model=SimResponse)
def simulate_with_debris(analysis_id: str):
    """
    Run collision risk simulation using specific debris data.
    """
    if analysis_id not in debris_storage:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    debris_data = debris_storage[analysis_id]
    objects = debris_data["objects"]
    
    logger.info(f"Running simulation for analysis {analysis_id} with {len(objects)} objects")
    
    # Enhanced simulation based on actual debris parameters
    alt_ranges = [(200, 400), (400, 600), (600, 800), (800, 1000), (1000, 1200)]
    inc_ranges = [(0, 30), (30, 60), (60, 90), (90, 120), (120, 180)]
    
    # Initialize heatmap
    H = [[0 for _ in range(len(inc_ranges))] for _ in range(len(alt_ranges))]
    
    # Count objects in each bin and simulate collision risk
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
        
        # Increment count (simulate risk based on density and object characteristics)
        if alt_bin >= 0 and inc_bin >= 0:
            # Base risk from object presence
            risk_factor = 1
            
            # Increase risk based on mass (heavier objects are more dangerous)
            if obj.get("mass_kg"):
                risk_factor *= (1 + obj["mass_kg"] / 1000)  # Normalize by 1000kg
            
            # Increase risk based on cross-section (larger objects more likely to collide)
            if obj.get("cross_section_m2"):
                risk_factor *= (1 + obj["cross_section_m2"] / 10)  # Normalize by 10m
            
            # Eccentricity affects collision probability
            risk_factor *= (1 + obj["eccentricity"] * 2)
            
            H[alt_bin][inc_bin] += int(risk_factor)
    
    # Create edges for the heatmap
    alt_edges = [r[0] for r in alt_ranges] + [alt_ranges[-1][1]]
    inc_edges = [r[0] for r in inc_ranges] + [inc_ranges[-1][1]]
    
    total_events = sum(sum(row) for row in H)
    
    logger.info(f"Simulation completed with {total_events} risk events")
    
    return {
        "heatmap": {"H": H, "alt_edges": alt_edges, "inc_edges": inc_edges},
        "event_count": total_events,
    }

@app.get("/events", response_model=EventsResponse)
def get_events():
    """
    Returns sample close-approach 'events' as ECI positions.
    """
    logger.info("Generating 3D orbital events")
    
    sample_events = [
        {"x":  1200.0, "y": -3400.0, "z":  5200.0, "time_s": 3600.0, "vrel_km_s": 10.2},
        {"x":   800.0, "y": -4200.0, "z":  5100.0, "time_s": 4200.0, "vrel_km_s":  9.1},
        {"x": -1500.0, "y":  2600.0, "z":  5600.0, "time_s": 5400.0, "vrel_km_s": 11.0},
        {"x": -2300.0, "y":  1800.0, "z":  4900.0, "time_s": 6000.0, "vrel_km_s":  8.7},
        {"x":  2000.0, "y":  3000.0, "z": -4500.0, "time_s": 7200.0, "vrel_km_s": 12.3},
    ]
    
    logger.info(f"Generated {len(sample_events)} orbital events")
    return {"events": sample_events, "earth_radius_km": 6378.137}

@app.get("/events/{analysis_id}", response_model=EventsResponse)
def get_events_for_analysis(analysis_id: str):
    """
    Generate 3D events based on specific debris analysis
    """
    if analysis_id not in debris_storage:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    debris_data = debris_storage[analysis_id]
    objects = debris_data["objects"]
    
    logger.info(f"Generating events for analysis {analysis_id}")
    
    # Generate events based on debris objects
    events = []
    for i, obj in enumerate(objects[:10]):  # Limit to first 10 objects for demo
        # Convert orbital elements to approximate 3D positions
        alt = obj["altitude_km"]
        inc = obj["inclination_deg"]
        
        # Simple conversion to ECI coordinates (simplified for visualization)
        angle = i * (2 * math.pi / len(objects))
        
        x = (6371 + alt) * math.cos(angle) * math.cos(math.radians(inc))
        y = (6371 + alt) * math.sin(angle) * math.cos(math.radians(inc))
        z = (6371 + alt) * math.sin(math.radians(inc))
        
        # Simulate time and velocity
        time_s = 3600 + i * 600  # Events spread over time
        vrel_km_s = 8.0 + (obj["eccentricity"] * 5)  # Velocity based on eccentricity
        
        events.append({
            "x": x, "y": y, "z": z,
            "time_s": time_s,
            "vrel_km_s": vrel_km_s,
            "debris_id": obj["name"]
        })
    
    logger.info(f"Generated {len(events)} events for analysis")
    return {"events": events, "earth_radius_km": 6378.137}

# -------- Startup Configuration --------
if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"Starting Space Debris Risk Model API in {settings.environment} mode")
    logger.info(f"CORS origins: {settings.cors_origins_list}")
    logger.info(f"Debug mode: {settings.debug}")
    
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
