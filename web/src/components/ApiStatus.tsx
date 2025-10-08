"use client";

import { useHealthCheck } from "../hooks/useApi";
import Card from "./Card";
import Button from "./Button";

export default function ApiStatus() {
  const { data: health, loading, error, checkHealth } = useHealthCheck();

  const getStatusColor = () => {
    if (loading) return "info";
    if (error) return "error";
    if (health) return "success";
    return undefined;
  };

  const getStatusText = () => {
    if (loading) return "Checking...";
    if (error) return `Error: ${error.message}`;
    if (health) return `Healthy (${health.status})`;
    return "Not checked";
  };

  const getStatusDot = () => {
    if (loading) return "bg-blue-500 animate-pulse";
    if (error) return "bg-red-500";
    if (health) return "bg-green-500";
    return "bg-gray-500";
  };

  return (
    <Card
      title="API Status"
      status={getStatusColor()}
      headerIcon={<div className={`w-3 h-3 rounded-full ${getStatusDot()}`} />}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Connection Status:</span>
          <span
            className={`font-medium ${
              error
                ? "text-red-400"
                : health
                ? "text-green-400"
                : loading
                ? "text-blue-400"
                : "text-slate-400"
            }`}
          >
            {getStatusText()}
          </span>
        </div>

        {health && (
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Response Data:</div>
            <pre className="text-xs text-green-300 overflow-x-auto">
              {JSON.stringify(health, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="text-red-400 text-sm">
              <strong>Error Details:</strong>
            </div>
            <div className="text-red-300 text-sm mt-1">
              {error.message}
              {error.status && (
                <span className="text-red-400 ml-2">
                  (Status: {error.status})
                </span>
              )}
            </div>
          </div>
        )}

        <Button
          onClick={checkHealth}
          loading={loading}
          size="sm"
          className="w-full"
        >
          {loading ? "Checking..." : "Check Health"}
        </Button>

        <div className="text-xs text-slate-400 text-center">
          Last checked:{" "}
          {health ? new Date(health.timestamp).toLocaleTimeString() : "Never"}
        </div>
      </div>
    </Card>
  );
}
