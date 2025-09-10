"use client";

import { useState } from "react";
// If alias @/lib/config works for you, you can switch back to it
import { API_BASE } from "../lib/config"; // ← keep relative for now
import Events3D from "../components/Events3D"; // ← NEW

export default function Home() {
  const [health, setHealth] = useState<string>("(not checked yet)");
  const [simResult, setSimResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // NEW: 3D events state
  const [events3d, setEvents3d] = useState<any[] | null>(null);
  const [eventsEarthR, setEventsEarthR] = useState<number | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const checkHealth = async () => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      setHealth(JSON.stringify(data));
    } catch {
      setHealth("(failed)");
      setError("Could not reach /health");
    }
  };

  const runSim = async () => {
    setLoading(true);
    setError(null);
    setSimResult(null);
    try {
      const res = await fetch(`${API_BASE}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      setSimResult(data);
    } catch (e: any) {
      setError(e.message || "Failed to call /simulate");
    } finally {
      setLoading(false);
    }
  };

  // NEW: fetch dummy 3D events
  const loadEvents3D = async () => {
    setLoadingEvents(true);
    setError(null);
    setEvents3d(null);
    try {
      const res = await fetch(`${API_BASE}/events`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      setEvents3d(data.events);
      setEventsEarthR(data.earth_radius_km);
    } catch (e: any) {
      setError(e.message || "Failed to load /events");
    } finally {
      setLoadingEvents(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ maxWidth: 900, width: "100%", padding: 16 }}>
        <h1>Space Debris Risk Model — Frontend</h1>

        <div style={{ marginTop: 16 }}>
          <button onClick={checkHealth} style={{ marginRight: 12 }}>
            Check /health
          </button>
          <span>Health: {health}</span>
        </div>

        <div style={{ marginTop: 24 }}>
          <button
            onClick={runSim}
            disabled={loading}
            style={{ marginRight: 12 }}
          >
            {loading ? "Running…" : "Run /simulate (heatmap)"}
          </button>

          {/* NEW: load 3D events */}
          <button onClick={loadEvents3D} disabled={loadingEvents}>
            {loadingEvents ? "Loading…" : "Load 3D events"}
          </button>
        </div>

        {error && (
          <p style={{ color: "crimson", marginTop: 12 }}>Error: {error}</p>
        )}

        {/* Keep your existing JSON block if you want */}
        {simResult && (
          <pre
            style={{
              marginTop: 16,
              padding: 12,
              background: "#1e1e1e",
              color: "#eaeaea",
              overflowX: "auto",
              borderRadius: 8,
            }}
          >
            {JSON.stringify(simResult, null, 2)}
          </pre>
        )}

        {/* NEW: render the 3D scatter */}
        {events3d && eventsEarthR && (
          <div style={{ marginTop: 24 }}>
            <Events3D events={events3d} earthRadiusKm={eventsEarthR} />
            <pre
              style={{
                marginTop: 12,
                padding: 12,
                background: "#1e1e1e",
                color: "#eaeaea",
                overflowX: "auto",
                borderRadius: 8,
              }}
            >
              {JSON.stringify({ count: events3d.length }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
