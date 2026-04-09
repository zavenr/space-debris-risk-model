"use client";

import { useState } from "react";
import Events3D from "../components/Events3D";
import Heatmap from "../components/Heatmap";
import { getEvents, getHealth, runSimulation } from "../lib/api";
import type { EventsResponse, SimResponse } from "../lib/types";

export default function Home() {
  const [health, setHealth] = useState<string>("(not checked yet)");
  const [simResult, setSimResult] = useState<SimResponse | null>(null);
  const [eventsData, setEventsData] = useState<EventsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardClass = "rounded-xl border border-dark-700 bg-dark-800 p-6";
  const buttonBaseClass =
    "w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60";

  const checkHealth = async () => {
    setError(null);
    try {
      const data = await getHealth();
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
      const data = await runSimulation();
      setSimResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to call /simulate");
    } finally {
      setLoading(false);
    }
  };

  const loadEvents3D = async () => {
    setLoadingEvents(true);
    setError(null);
    setEventsData(null);
    try {
      const data = await getEvents();
      setEventsData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load /events");
    } finally {
      setLoadingEvents(false);
    }
  };

  const downloadEvents = () => {
    if (!eventsData) return;
    const dataBlob = new Blob([JSON.stringify(eventsData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "space-debris-events.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-12 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            Space Debris Risk Model
          </h1>
          <p className="mb-6 text-lg text-dark-400">
            Visualize space debris and collision risks in Earth orbit
          </p>
          <div className="mx-auto max-w-2xl rounded-lg border border-primary-500/30 bg-primary-500/10 p-4 text-sm text-dark-300">
            <p className="mb-2">
              📊 <strong>Heatmap</strong> shows debris density by altitude and
              orbital angle
            </p>
            <p>
              🌍 <strong>3D View</strong> displays actual positions of debris
              around Earth
            </p>
          </div>
        </header>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {/* API Health Status */}
          <div className={cardClass}>
            <h2 className="mb-4 text-xl font-semibold">API Status</h2>
            <button
              onClick={checkHealth}
              className={`${buttonBaseClass} mb-3 bg-primary-600 hover:bg-primary-700`}
            >
              Check Health
            </button>
            <span className="text-sm text-dark-400">{health}</span>
          </div>

          {/* Actions */}
          <div className={cardClass}>
            <h2 className="mb-4 text-xl font-semibold">Analysis Tools</h2>
            <button
              onClick={runSim}
              disabled={loading}
              className={`${buttonBaseClass} mb-3 bg-emerald-600 hover:bg-emerald-700`}
            >
              {loading ? "Running..." : "Generate Risk Heatmap"}
            </button>
            <button
              onClick={loadEvents3D}
              disabled={loadingEvents}
              className={`${buttonBaseClass} bg-primary-600 hover:bg-primary-700`}
            >
              {loadingEvents ? "Loading..." : "Load 3D Events"}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-600 bg-red-600/10 p-4 text-red-300">
            ⚠ Error: {error}
          </div>
        )}

        {/* Heatmap Visualization */}
        {simResult && (
          <div className={`${cardClass} mb-6`}>
            <div className="mb-4">
              <h3 className="mb-2 text-xl font-semibold text-emerald-500">
                Collision Risk Heatmap
              </h3>
              <p className="text-sm text-dark-400">
                Shows where space debris is most concentrated. Red/orange zones
                have high collision risk. The 600-800km altitude range (Low
                Earth Orbit) is the most crowded.
              </p>
            </div>
            <div className="rounded-lg bg-dark-900 p-4">
              <Heatmap data={simResult.heatmap} />
            </div>
            <div className="mt-4 flex flex-wrap gap-6 text-sm text-dark-400">
              <p>
                Total Debris Objects:{" "}
                <span className="font-semibold text-white">
                  {simResult.event_count}
                </span>
              </p>
              <p>
                Highest Risk:{" "}
                <span className="font-semibold text-red-600">
                  600-800km @ 60-90°
                </span>
              </p>
            </div>
          </div>
        )}

        {/* 3D Visualization */}
        {eventsData && (
          <div className={cardClass}>
            <div className="mb-4">
              <h3 className="mb-2 text-xl font-semibold text-primary-400">
                3D Orbital Debris Positions
              </h3>
              <p className="text-sm text-dark-400">
                Each red dot represents a potential collision point in space.
                The blue sphere is Earth. Debris is shown in Earth-Centered
                Inertial (ECI) coordinates. Rotate to explore!
              </p>
            </div>
            <div className="overflow-hidden rounded-lg bg-dark-900">
              <Events3D
                events={eventsData.events}
                earthRadiusKm={eventsData.earth_radius_km}
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-dark-400">
                <p>
                  Tracked Objects:{" "}
                  <span className="font-semibold text-white">
                    {eventsData.events.length}
                  </span>
                </p>
                <p className="mt-1 text-xs">Avg. relative velocity: ~10 km/s</p>
              </div>
              <button
                onClick={downloadEvents}
                className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
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
