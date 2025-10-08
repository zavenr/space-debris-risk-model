export interface DebrisObject {
  name: string;
  altitude_km: number;
  inclination_deg: number;
  eccentricity: number;
  mass_kg?: number;
  cross_section_m2?: number;
}

export interface AnalysisRequest {
  name: string;
  objects: DebrisObject[];
  time_span_days?: number;
  simulation_steps?: number;
}

export interface SimulationResult {
  heatmap?: {
    H: number[][];
    alt_edges: number[];
    inc_edges: number[];
  };
  event_count: number;
  analysis_id?: string;
  metadata?: {
    time_span_days: number;
    simulation_steps: number;
    created_at: string;
  };
  [key: string]: unknown; // Allow additional properties
}

export interface Event3D {
  x: number;
  y: number;
  z: number;
  time_s: number;
  vrel_km_s: number;
  debris_id?: string;
}

export interface Events3DData {
  events: Event3D[];
  earth_radius_km: number;
  [key: string]: unknown; // Allow additional properties
}

export const DEFAULT_DEBRIS_OBJECT: DebrisObject = {
  name: "New Debris Object",
  altitude_km: 400,
  inclination_deg: 0,
  eccentricity: 0.001,
  mass_kg: 100,
  cross_section_m2: 1.0,
};

export const EXAMPLE_DEBRIS_OBJECTS: DebrisObject[] = [
  {
    name: "ISS Module Fragment",
    altitude_km: 420,
    inclination_deg: 51.6,
    eccentricity: 0.0003,
    mass_kg: 150,
    cross_section_m2: 2.5,
  },
  {
    name: "Satellite Debris",
    altitude_km: 800,
    inclination_deg: 98.2,
    eccentricity: 0.001,
    mass_kg: 50,
    cross_section_m2: 1.2,
  },
  {
    name: "Rocket Upper Stage",
    altitude_km: 600,
    inclination_deg: 28.5,
    eccentricity: 0.002,
    mass_kg: 2000,
    cross_section_m2: 15.0,
  },
];
