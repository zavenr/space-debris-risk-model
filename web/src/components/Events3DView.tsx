"use client";

import { Events3DData } from "../types/debris";
import Events3D from "./Events3D";
import Card from "./Card";
import Button from "./Button";

interface Events3DViewProps {
  data: Events3DData;
  loading?: boolean;
}

export default function Events3DView({
  data,
  loading = false,
}: Events3DViewProps) {
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const downloadData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `close-approach-events-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card title="3D Close Approach Events" status="info" className="mb-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-slate-300">
            Loading 3D visualization...
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card title="3D Close Approach Events" status="info" className="mb-6">
      <div className="space-y-6">
        {/* Event Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {formatNumber(data.events.length)}
            </div>
            <div className="text-sm text-slate-300">Total Events</div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {data.earth_radius_km.toFixed(0)}
            </div>
            <div className="text-sm text-slate-300">Earth Radius (km)</div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {data.events.length > 0
                ? Math.max(...data.events.map((e) => e.vrel_km_s)).toFixed(2)
                : "0"}
            </div>
            <div className="text-sm text-slate-300">Max Velocity (km/s)</div>
          </div>
        </div>

        {/* 3D Visualization */}
        <div>
          <h4 className="text-lg font-medium text-white mb-3">
            Interactive 3D Visualization
          </h4>
          <div className="bg-slate-900 rounded-lg overflow-hidden">
            <Events3D
              events={data.events}
              earthRadiusKm={data.earth_radius_km}
            />
          </div>
        </div>

        {/* Event Details */}
        {data.events.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-medium text-white">Event Details</h4>
              <Button size="sm" variant="secondary" onClick={downloadData}>
                Download Data
              </Button>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-300">Avg. Velocity:</span>
                  <div className="text-white font-medium">
                    {(
                      data.events.reduce((sum, e) => sum + e.vrel_km_s, 0) /
                      data.events.length
                    ).toFixed(2)}{" "}
                    km/s
                  </div>
                </div>

                <div>
                  <span className="text-slate-300">Time Span:</span>
                  <div className="text-white font-medium">
                    {data.events.length > 0
                      ? `${Math.min(
                          ...data.events.map((e) => e.time_s)
                        ).toFixed(0)}s - ${Math.max(
                          ...data.events.map((e) => e.time_s)
                        ).toFixed(0)}s`
                      : "N/A"}
                  </div>
                </div>

                <div>
                  <span className="text-slate-300">Min Velocity:</span>
                  <div className="text-white font-medium">
                    {data.events.length > 0
                      ? Math.min(
                          ...data.events.map((e) => e.vrel_km_s)
                        ).toFixed(2)
                      : "0"}{" "}
                    km/s
                  </div>
                </div>

                <div>
                  <span className="text-slate-300">Unique Debris IDs:</span>
                  <div className="text-white font-medium">
                    {
                      new Set(
                        data.events.map((e) => e.debris_id).filter(Boolean)
                      ).size
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {data.events.length === 0 && (
          <div className="text-center py-8">
            <div className="text-slate-400">
              No close approach events found in the current dataset.
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
