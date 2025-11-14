"use client";

import { useState } from "react";
import { API_BASE } from "../lib/config";
import Events3D from "../components/Events3D";
import Heatmap from "../components/Heatmap";

export default function Home() {
  const [health, setHealth] = useState<string>("(not checked yet)");
  const [simResult, setSimResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)",
        color: "white",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      }}
    >
      <div
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 16px" }}
      >
        <header style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              background: "linear-gradient(to right, #60a5fa, #2563eb)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "16px",
            }}
          >
            Space Debris Risk Model
          </h1>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "1.125rem",
              marginBottom: "24px",
            }}
          >
            Visualize space debris and collision risks in Earth orbit
          </p>
          <div
            style={{
              background: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              borderRadius: "8px",
              padding: "16px",
              maxWidth: "600px",
              margin: "0 auto",
              fontSize: "14px",
              color: "#cbd5e1",
            }}
          >
            <p style={{ marginBottom: "8px" }}>
              📊 <strong>Heatmap</strong> shows debris density by altitude and
              orbital angle
            </p>
            <p>
              🌍 <strong>3D View</strong> displays actual positions of debris
              around Earth
            </p>
          </div>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          {/* API Health Status */}
          <div
            style={{
              background: "#1e293b",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #334155",
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "16px",
              }}
            >
              API Status
            </h2>
            <button
              onClick={checkHealth}
              style={{
                background: "#2563eb",
                color: "white",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                width: "100%",
                marginBottom: "12px",
              }}
            >
              Check Health
            </button>
            <span style={{ color: "#94a3b8", fontSize: "14px" }}>{health}</span>
          </div>

          {/* Actions */}
          <div
            style={{
              background: "#1e293b",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #334155",
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "16px",
              }}
            >
              Analysis Tools
            </h2>
            <button
              onClick={runSim}
              disabled={loading}
              style={{
                background: loading ? "#475569" : "#059669",
                color: "white",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
                width: "100%",
                marginBottom: "12px",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Running..." : "Generate Risk Heatmap"}
            </button>
            <button
              onClick={loadEvents3D}
              disabled={loadingEvents}
              style={{
                background: loadingEvents ? "#475569" : "#2563eb",
                color: "white",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: loadingEvents ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
                width: "100%",
                opacity: loadingEvents ? 0.6 : 1,
              }}
            >
              {loadingEvents ? "Loading..." : "Load 3D Events"}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div
            style={{
              background: "rgba(220, 38, 38, 0.1)",
              border: "1px solid #dc2626",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px",
              color: "#fca5a5",
            }}
          >
            ⚠ Error: {error}
          </div>
        )}

        {/* Heatmap Visualization */}
        {simResult && (
          <div
            style={{
              background: "#1e293b",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #334155",
              marginBottom: "24px",
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  color: "#10b981",
                  marginBottom: "8px",
                }}
              >
                Collision Risk Heatmap
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>
                Shows where space debris is most concentrated. Red/orange zones
                have high collision risk. The 600-800km altitude range (Low
                Earth Orbit) is the most crowded.
              </p>
            </div>
            <div
              style={{
                background: "#0f172a",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <Heatmap data={simResult.heatmap} />
            </div>
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                gap: "24px",
                color: "#94a3b8",
                fontSize: "14px",
              }}
            >
              <p>
                Total Debris Objects:{" "}
                <span style={{ color: "white", fontWeight: "600" }}>
                  {simResult.event_count}
                </span>
              </p>
              <p>
                Highest Risk:{" "}
                <span style={{ color: "#dc2626", fontWeight: "600" }}>
                  600-800km @ 60-90°
                </span>
              </p>
            </div>
          </div>
        )}

        {/* 3D Visualization */}
        {events3d && eventsEarthR && (
          <div
            style={{
              background: "#1e293b",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #334155",
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  color: "#60a5fa",
                  marginBottom: "8px",
                }}
              >
                3D Orbital Debris Positions
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>
                Each red dot represents a potential collision point in space.
                The blue sphere is Earth. Debris is shown in Earth-Centered
                Inertial (ECI) coordinates. Rotate to explore!
              </p>
            </div>
            <div
              style={{
                background: "#0f172a",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <Events3D events={events3d} earthRadiusKm={eventsEarthR} />
            </div>
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ color: "#94a3b8", fontSize: "14px" }}>
                <p>
                  Tracked Objects:{" "}
                  <span style={{ color: "white", fontWeight: "600" }}>
                    {events3d.length}
                  </span>
                </p>
                <p style={{ marginTop: "4px", fontSize: "12px" }}>
                  Avg. relative velocity: ~10 km/s
                </p>
              </div>
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(
                    { events: events3d, earth_radius_km: eventsEarthR },
                    null,
                    2
                  );
                  const dataBlob = new Blob([dataStr], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "space-debris-events.json";
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                style={{
                  background: "#d97706",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Download Data
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
