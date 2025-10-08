"use client";

import { useState, useEffect } from "react";
import { API_BASE } from "../lib/config";
import Button from "./Button";
import Card from "./Card";
import Alert from "./Alert";
import Events3D from "./Events3D";

interface AnalysisResult {
  heatmap: {
    H: number[][];
    alt_edges: number[];
    inc_edges: number[];
  };
  event_count: number;
}

interface Event3D {
  x: number;
  y: number;
  z: number;
  time_s: number;
  vrel_km_s: number;
  debris_id?: string;
}

interface AnalysisResultsProps {
  analysisId: string;
  onBack?: () => void;
}

export default function AnalysisResults({
  analysisId,
  onBack,
}: AnalysisResultsProps) {
  const [simulationResult, setSimulationResult] =
    useState<AnalysisResult | null>(null);
  const [events3d, setEvents3d] = useState<Event3D[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisInfo, setAnalysisInfo] = useState<any>(null);

  // Fetch analysis information
  useEffect(() => {
    const fetchAnalysisInfo = async () => {
      try {
        const response = await fetch(`${API_BASE}/debris/${analysisId}`);
        if (response.ok) {
          const data = await response.json();
          setAnalysisInfo(data);
        }
      } catch (err) {
        console.error("Failed to fetch analysis info:", err);
      }
    };

    if (analysisId) {
      fetchAnalysisInfo();
    }
  }, [analysisId]);

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    setSimulationResult(null);

    try {
      const response = await fetch(`${API_BASE}/simulate/${analysisId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `API ${response.status}`);
      }

      const data = await response.json();
      setSimulationResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to run simulation");
    } finally {
      setLoading(false);
    }
  };

  const load3DEvents = async () => {
    setLoadingEvents(true);
    setError(null);
    setEvents3d(null);

    try {
      const response = await fetch(`${API_BASE}/events/${analysisId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `API ${response.status}`);
      }

      const data = await response.json();
      setEvents3d(data.events);
    } catch (err: any) {
      setError(err.message || "Failed to load 3D events");
    } finally {
      setLoadingEvents(false);
    }
  };

  const renderHeatmap = () => {
    if (!simulationResult) return null;

    const { H, alt_edges, inc_edges } = simulationResult.heatmap;

    return (
      <Card>
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            marginBottom: "16px",
          }}
        >
          Risk Heatmap
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #374151",
                    backgroundColor: "#1f2937",
                  }}
                >
                  Alt \\ Inc
                </th>
                {inc_edges.slice(0, -1).map((edge, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "8px",
                      border: "1px solid #374151",
                      backgroundColor: "#1f2937",
                    }}
                  >
                    {edge}°-{inc_edges[i + 1]}°
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {H.map((row, i) => (
                <tr key={i}>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #374151",
                      backgroundColor: "#1f2937",
                      fontWeight: "600",
                    }}
                  >
                    {alt_edges[i]}-{alt_edges[i + 1]} km
                  </td>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      style={{
                        padding: "8px",
                        border: "1px solid #374151",
                        textAlign: "center",
                        backgroundColor:
                          cell > 0
                            ? `rgba(239, 68, 68, ${Math.min(cell / 5, 1)})`
                            : "#111827",
                        color: cell > 2 ? "white" : "#e5e7eb",
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p
          style={{ marginTop: "12px", color: "#94a3b8", fontSize: "0.875rem" }}
        >
          Total risk events: <strong>{simulationResult.event_count}</strong>
        </p>
        <p style={{ marginTop: "4px", color: "#94a3b8", fontSize: "0.875rem" }}>
          Red intensity indicates higher collision risk density
        </p>
      </Card>
    );
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            Analysis Results
          </h1>
          {analysisInfo && (
            <p style={{ color: "#94a3b8" }}>
              {analysisInfo.analysis_name || "Untitled Analysis"} •
              {analysisInfo.object_count} objects • Created{" "}
              {new Date(analysisInfo.created_at).toLocaleDateString()}
            </p>
          )}
        </div>
        {onBack && (
          <Button onClick={onBack} variant="secondary">
            ← Back to Form
          </Button>
        )}
      </div>

      {error && <Alert type="error" message={error} />}

      <div style={{ display: "grid", gap: "24px" }}>
        {/* Analysis Info */}
        {analysisInfo && (
          <Card>
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "16px",
              }}
            >
              Analysis Details
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#94a3b8",
                    marginBottom: "4px",
                  }}
                >
                  Analysis ID
                </p>
                <p style={{ fontFamily: "monospace", fontSize: "0.875rem" }}>
                  {analysisId}
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#94a3b8",
                    marginBottom: "4px",
                  }}
                >
                  Object Count
                </p>
                <p>{analysisInfo.object_count} debris objects</p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#94a3b8",
                    marginBottom: "4px",
                  }}
                >
                  Created
                </p>
                <p>{new Date(analysisInfo.created_at).toLocaleString()}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <Card>
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              marginBottom: "16px",
            }}
          >
            Run Analysis
          </h3>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Button
              onClick={runSimulation}
              disabled={loading}
              variant="primary"
            >
              {loading ? "Running Simulation..." : "Run Risk Simulation"}
            </Button>
            <Button
              onClick={load3DEvents}
              disabled={loadingEvents}
              variant="secondary"
            >
              {loadingEvents ? "Loading..." : "Load 3D Visualization"}
            </Button>
          </div>
        </Card>

        {/* Simulation Results */}
        {simulationResult && renderHeatmap()}

        {/* 3D Visualization */}
        {events3d && (
          <Card>
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "16px",
              }}
            >
              3D Orbital Visualization
            </h3>
            <p
              style={{
                color: "#94a3b8",
                marginBottom: "16px",
                fontSize: "0.875rem",
              }}
            >
              Interactive 3D plot showing debris positions and collision events
              in Earth-centered coordinates
            </p>
            <Events3D events={events3d} />
          </Card>
        )}
      </div>
    </div>
  );
}
