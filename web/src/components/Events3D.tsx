"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

// Plotly must render client-side in Next.js App Router
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

type Event3D = {
  x: number;
  y: number;
  z: number;
  time_s: number;
  vrel_km_s: number;
};

type Props = {
  events: Event3D[];
  earthRadiusKm?: number; // optional, default 6378.137
};

// helper to build a low-res Earth sphere (wireframe-ish semi-transparent)
function makeEarthSphere(r: number) {
  const phiSteps = 24; // 0..π
  const thetaSteps = 24; // 0..2π
  const xs: number[][] = [];
  const ys: number[][] = [];
  const zs: number[][] = [];
  for (let i = 0; i <= phiSteps; i++) {
    const phi = (Math.PI * i) / phiSteps;
    const rowX: number[] = [];
    const rowY: number[] = [];
    const rowZ: number[] = [];
    for (let j = 0; j <= thetaSteps; j++) {
      const theta = (2 * Math.PI * j) / thetaSteps;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      rowX.push(x);
      rowY.push(y);
      rowZ.push(z);
    }
    xs.push(rowX);
    ys.push(rowY);
    zs.push(rowZ);
  }
  return { xs, ys, zs };
}

export default function Events3D({ events, earthRadiusKm = 6378.137 }: Props) {
  const [showEarth, setShowEarth] = useState(true);
  const [colorBy, setColorBy] = useState<"velocity" | "time">("velocity");

  const x = events.map((e) => e.x);
  const y = events.map((e) => e.y);
  const z = events.map((e) => e.z);
  const color = events.map((e) =>
    colorBy === "velocity" ? e.vrel_km_s : e.time_s
  );
  const text = events.map(
    (e) => `t=${e.time_s}s<br>v=${e.vrel_km_s.toFixed(2)} km/s`
  );

  const earth = makeEarthSphere(earthRadiusKm);

  const plotData: any[] = [
    ...(showEarth
      ? [
          {
            type: "surface",
            x: earth.xs,
            y: earth.ys,
            z: earth.zs,
            showscale: false,
            opacity: 0.15,
            contours: { z: { show: false } },
            name: "Earth",
            hoverinfo: "skip",
          },
        ]
      : []),
    {
      type: "scatter3d",
      mode: "markers",
      x,
      y,
      z,
      text,
      hoverinfo: "text",
      name: "Events",
      marker: {
        size: 4,
        color,
        colorscale: colorBy === "velocity" ? "Hot" : "Viridis",
        colorbar: {
          title: colorBy === "velocity" ? "Velocity (km/s)" : "Time (s)",
        },
      },
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginBottom: "16px",
          padding: "12px",
          background: "#334155",
          borderRadius: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label
            style={{
              fontSize: "14px",
              color: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={showEarth}
              onChange={(e) => setShowEarth(e.target.checked)}
              style={{ marginRight: "8px" }}
            />
            Show Earth
          </label>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px", color: "#e2e8f0" }}>Color by:</span>
          <select
            value={colorBy}
            onChange={(e) => setColorBy(e.target.value as "velocity" | "time")}
            style={{
              background: "#475569",
              color: "white",
              fontSize: "14px",
              borderRadius: "4px",
              padding: "4px 8px",
              border: "1px solid #64748b",
            }}
          >
            <option value="velocity">Velocity</option>
            <option value="time">Time</option>
          </select>
        </div>

        <button
          onClick={() => {
            // This will reset the camera view
            const plotDiv = document.querySelector(".js-plotly-plot") as any;
            if (plotDiv && plotDiv.layout) {
              const newLayout = { ...plotDiv.layout };
              delete newLayout.scene.camera;
              (window as any).Plotly.relayout(plotDiv, newLayout);
            }
          }}
          style={{
            background: "#2563eb",
            color: "white",
            fontSize: "14px",
            padding: "6px 12px",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
            alignSelf: "flex-start",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#1d4ed8")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#2563eb")}
        >
          Reset View
        </button>
      </div>

      <Plot
        data={plotData}
        layout={
          {
            title: "Close-Approach Events (3D ECI)",
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            font: { color: "white" },
            scene: {
              xaxis: {
                title: "X (km)",
                gridcolor: "rgb(100,100,100)",
                color: "white",
              },
              yaxis: {
                title: "Y (km)",
                gridcolor: "rgb(100,100,100)",
                color: "white",
              },
              zaxis: {
                title: "Z (km)",
                gridcolor: "rgb(100,100,100)",
                color: "white",
              },
              aspectmode: "data",
              bgcolor: "rgba(0,0,0,0)",
            },
            margin: { l: 0, r: 0, t: 40, b: 0 },
            autosize: true,
          } as any
        }
        style={{ width: "100%", height: "420px" }}
        className="md:!h-[520px]"
        useResizeHandler
        config={{
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ["pan2d", "select2d", "lasso2d"],
        }}
      />
    </div>
  );
}
