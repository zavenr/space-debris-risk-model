"use client";

import { useState } from "react";
import { useSimulation, useEvents3D } from "../hooks/useApi";
import { AnalysisRequest } from "../types/debris";
import UserInputForm from "../components/UserInputForm";
import SimulationResults from "../components/SimulationResults";
import Events3DView from "../components/Events3DView";
import ApiStatus from "../components/ApiStatus";
import Card from "../components/Card";
import Button from "../components/Button";
import Alert from "../components/Alert";

type ViewMode = "input" | "demo";

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("input");
  const simulationApi = useSimulation();
  const eventsApi = useEvents3D();

  const handleUserAnalysis = async (data: AnalysisRequest) => {
    await simulationApi.runSimulation(data);
  };

  const handleDemoAnalysis = async () => {
    await simulationApi.runSimulation();
  };

  const handleLoadEvents = async () => {
    await eventsApi.loadEvents();
  };

  const clearResults = () => {
    simulationApi.reset();
    eventsApi.reset();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4">
            Space Debris Risk Model
          </h1>
          <p className="text-slate-400 text-lg lg:text-xl">
            Advanced orbital collision risk analysis and visualization
          </p>
        </header>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setViewMode("input")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "input"
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Custom Analysis
            </button>
            <button
              onClick={() => setViewMode("demo")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "demo"
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Demo Mode
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* API Status */}
            <ApiStatus />

            {/* Quick Actions */}
            <Card title="Quick Actions">
              <div className="space-y-3">
                <Button
                  onClick={handleDemoAnalysis}
                  loading={simulationApi.loading}
                  variant="success"
                  size="sm"
                  className="w-full"
                >
                  Run Demo Analysis
                </Button>

                <Button
                  onClick={handleLoadEvents}
                  loading={eventsApi.loading}
                  variant="primary"
                  size="sm"
                  className="w-full"
                >
                  Load 3D Events
                </Button>

                <Button
                  onClick={clearResults}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  Clear Results
                </Button>
              </div>
            </Card>

            {/* Error Display */}
            {(simulationApi.error || eventsApi.error) && (
              <Alert
                type="error"
                message={
                  simulationApi.error?.message ||
                  eventsApi.error?.message ||
                  "Unknown error"
                }
                onClose={() => {
                  simulationApi.clearError();
                  eventsApi.clearError();
                }}
              />
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Input Form */}
            {viewMode === "input" && (
              <UserInputForm
                onSubmit={handleUserAnalysis}
                loading={simulationApi.loading}
              />
            )}

            {/* Demo Mode Info */}
            {viewMode === "demo" && (
              <Card title="Demo Mode" status="info">
                <div className="space-y-4">
                  <p className="text-slate-300">
                    Demo mode uses pre-configured debris objects and simulation
                    parameters to showcase the risk analysis capabilities.
                  </p>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">
                      Demo Features:
                    </h4>
                    <ul className="space-y-1 text-sm text-slate-300">
                      <li>
                        • Pre-configured ISS and satellite debris scenarios
                      </li>
                      <li>
                        • Standard orbital parameters and risk calculations
                      </li>
                      <li>
                        • Interactive 3D visualization of close approaches
                      </li>
                      <li>• Risk heatmap generation</li>
                    </ul>
                  </div>
                  <Button
                    onClick={handleDemoAnalysis}
                    loading={simulationApi.loading}
                    variant="success"
                  >
                    Run Demo Analysis
                  </Button>
                </div>
              </Card>
            )}

            {/* Results */}
            {simulationApi.data && (
              <SimulationResults result={simulationApi.data} />
            )}

            {/* 3D Visualization */}
            {eventsApi.data && (
              <Events3DView data={eventsApi.data} loading={eventsApi.loading} />
            )}

            {/* Loading States */}
            {simulationApi.loading && !simulationApi.data && (
              <Card title="Running Analysis" status="info">
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-slate-300">
                    Calculating collision risks and generating heatmap...
                  </span>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-700 text-center">
          <p className="text-slate-400 text-sm">
            Space Debris Risk Model - Advanced Orbital Analysis Platform
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Built for space safety and collision avoidance research
          </p>
        </footer>
      </div>
    </main>
  );
}
