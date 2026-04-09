import { API_BASE } from "./config";
import type { EventsResponse, HealthResponse, SimResponse } from "./types";

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) {
    throw new Error(`API ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function getHealth(): Promise<HealthResponse> {
  return fetchJson<HealthResponse>("/health");
}

export function runSimulation(): Promise<SimResponse> {
  return fetchJson<SimResponse>("/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
}

export function getEvents(): Promise<EventsResponse> {
  return fetchJson<EventsResponse>("/events");
}
