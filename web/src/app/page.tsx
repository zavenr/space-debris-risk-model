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
    <main 
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)",
        color: "white",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
      }}
    >
      <div 
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px 16px"
        }}
      >
        <header style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1 
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              background: "linear-gradient(to right, #60a5fa, #2563eb)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "16px"
            }}
          >
            Space Debris Risk Model
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1.125rem" }}>
            Advanced orbital collision risk analysis and visualization
          </p>
        </header>

        <div 
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
            marginBottom: "32px"
          }}
        >
          {/* API Health Status Card */}
          <div
            style={{
              background: "#1e293b",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #334155"
            }}
          >
            <h2 
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center"
              }}
            >
              <span 
                style={{
                  width: "12px",
                  height: "12px",
                  background: "#10b981",
                  borderRadius: "50%",
                  marginRight: "12px"
                }}
              ></span>
              API Status
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
                  fontWeight: "500"
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#1d4ed8")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#2563eb")}
              >
                Check Health
              </button>
              <span style={{ color: "#94a3b8", fontSize: "14px" }}>Status: {health}</span>
            </div>
          </div>

          {/* Actions Card */}
          <div
            style={{
              background: "#1e293b",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #334155"
            }}
          >
            <h2 
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "16px"
              }}
            >
              Analysis Tools
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: loading ? 0.6 : 1
                }}
                onMouseOver={(e) => !loading && (e.currentTarget.style.background = "#047857")}
                onMouseOut={(e) => !loading && (e.currentTarget.style.background = "#059669")}
              >
                {loading ? "Running Analysis..." : "Generate Risk Heatmap"}
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: loadingEvents ? 0.6 : 1
                }}
                onMouseOver={(e) => !loadingEvents && (e.currentTarget.style.background = "#1d4ed8")}
                onMouseOut={(e) => !loadingEvents && (e.currentTarget.style.background = "#2563eb")}
              >
                {loadingEvents ? "Loading Events..." : "Load 3D Close Approaches"}
              </button>
            </div>
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
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ color: "#fca5a5", marginRight: "12px" }}>⚠</span>
              <span style={{ color: "#fca5a5" }}>Error: {error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              style={{
                background: "none",
                border: "none",
                color: "#fca5a5",
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Simulation Results */}
        {simResult && (
          <div
            style={{
              background: "#1e293b",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #334155",
              marginBottom: "24px"
            }}
          >
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "16px",
                color: "#10b981"
              }}
            >
              Risk Analysis Results
            </h3>
            <div
              style={{
                background: "#0f172a",
                borderRadius: "8px",
                padding: "16px",
                overflowX: "auto"
              }}
            >
              <pre style={{ color: "#86efac", fontSize: "14px", margin: 0 }}>
                {JSON.stringify(simResult, null, 2)}
              </pre>
            </div>
            <div style={{ marginTop: "16px", color: "#94a3b8", fontSize: "14px" }}>
              <p>
                Event Count:{" "}
                <span style={{ color: "white", fontWeight: "600" }}>
                  {simResult.event_count}
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
              border: "1px solid #334155"
            }}
          >
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "16px",
                color: "#60a5fa"
              }}
            >
              3D Close Approach Events
            </h3>
            <div
              style={{
                background: "#0f172a",
                borderRadius: "8px",
                overflow: "hidden"
              }}
            >
              <Events3D events={events3d} earthRadiusKm={eventsEarthR} />
            </div>
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                flexDirection: window.innerWidth < 640 ? "column" : "row",
                justifyContent: "space-between",
                alignItems: window.innerWidth < 640 ? "flex-start" : "center",
                gap: "12px",
                color: "#94a3b8",
                fontSize: "14px"
              }}
            >
              <p>
                Total Events:{" "}
                <span style={{ color: "white", fontWeight: "600" }}>
                  {events3d.length}
                </span>
              </p>
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
                  fontWeight: "500"
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#b45309")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#d97706")}
              >
                Download Data
              </button>
            </div>
          </div>
        )}

        {/* Simulation Results */}
        {simResult && (
          <div className="bg-dark-800 rounded-lg p-6 border border-dark-700 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-green-400">
              Risk Analysis Results
            </h3>
            <div className="bg-dark-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-300 text-sm">
                {JSON.stringify(simResult, null, 2)}
              </pre>
            </div>
            <div className="mt-4 text-dark-300">
              <p>
                Event Count:{" "}
                <span className="text-white font-semibold">
                  {simResult.event_count}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* 3D Visualization */}
        {events3d && eventsEarthR && (
          <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">
              3D Close Approach Events
            </h3>
            <div className="rounded-lg overflow-hidden bg-dark-900">
              <Events3D events={events3d} earthRadiusKm={eventsEarthR} />
            </div>
            <div className="mt-4 flex justify-between items-center text-dark-300">
              <p>
                Total Events:{" "}
                <span className="text-white font-semibold">
                  {events3d.length}
                </span>
              </p>
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
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
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
