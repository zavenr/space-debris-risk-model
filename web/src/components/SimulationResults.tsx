"use client";

import { SimulationResult } from "../types/debris";
import Card from "./Card";
import Button from "./Button";

interface SimulationResultsProps {
  result: SimulationResult;
}

export default function SimulationResults({ result }: SimulationResultsProps) {
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const downloadJson = () => {
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `risk-analysis-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card title="Risk Analysis Results" status="success" className="mb-6">
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {formatNumber(result.event_count)}
            </div>
            <div className="text-sm text-slate-300">Total Events</div>
          </div>

          {result.metadata && (
            <>
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {result.metadata.time_span_days}
                </div>
                <div className="text-sm text-slate-300">Days Analyzed</div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {formatNumber(result.metadata.simulation_steps)}
                </div>
                <div className="text-sm text-slate-300">Simulation Steps</div>
              </div>
            </>
          )}
        </div>

        {/* Raw Data */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-medium text-white">
              Raw Analysis Data
            </h4>
            <Button size="sm" variant="secondary" onClick={downloadJson}>
              Download JSON
            </Button>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto max-h-64 overflow-y-auto">
            <pre className="text-green-300 text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>

        {/* Heatmap Info */}
        {result.heatmap && (
          <div>
            <h4 className="text-lg font-medium text-white mb-3">
              Risk Heatmap Information
            </h4>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-300">Altitude Range:</span>
                  <span className="ml-2 text-white font-medium">
                    {Math.min(...result.heatmap.alt_edges).toFixed(1)} -
                    {Math.max(...result.heatmap.alt_edges).toFixed(1)} km
                  </span>
                </div>
                <div>
                  <span className="text-slate-300">Inclination Range:</span>
                  <span className="ml-2 text-white font-medium">
                    {Math.min(...result.heatmap.inc_edges).toFixed(1)}° -
                    {Math.max(...result.heatmap.inc_edges).toFixed(1)}°
                  </span>
                </div>
                <div>
                  <span className="text-slate-300">Grid Resolution:</span>
                  <span className="ml-2 text-white font-medium">
                    {result.heatmap.H.length} ×{" "}
                    {result.heatmap.H[0]?.length || 0}
                  </span>
                </div>
                <div>
                  <span className="text-slate-300">Max Risk Value:</span>
                  <span className="ml-2 text-white font-medium">
                    {Math.max(...result.heatmap.H.flat()).toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Timestamp */}
        {result.metadata?.created_at && (
          <div className="text-sm text-slate-400 text-center">
            Analysis completed:{" "}
            {new Date(result.metadata.created_at).toLocaleString()}
          </div>
        )}
      </div>
    </Card>
  );
}
