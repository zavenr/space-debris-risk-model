export type HeatmapPayload = {
  H: number[][];
  alt_edges: number[];
  inc_edges: number[];
};

export type SimResponse = {
  heatmap: HeatmapPayload;
  event_count: number;
};

export type Event3D = {
  x: number;
  y: number;
  z: number;
  time_s: number;
  vrel_km_s: number;
};

export type EventsResponse = {
  events: Event3D[];
  earth_radius_km: number;
};

export type HealthResponse = {
  status: string;
  service: string;
};
