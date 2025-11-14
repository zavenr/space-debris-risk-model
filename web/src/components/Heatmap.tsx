"use client";

import React from "react";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface HeatmapProps {
  data: {
    H: number[][];
    alt_edges: number[];
    inc_edges: number[];
  };
}

export default function Heatmap({ data }: HeatmapProps) {
  const { H, alt_edges, inc_edges } = data;

  // Create labels for axes
  const altLabels = alt_edges
    .slice(0, -1)
    .map((alt, i) => `${alt}-${alt_edges[i + 1]}km`);
  const incLabels = inc_edges
    .slice(0, -1)
    .map((inc, i) => `${inc}-${inc_edges[i + 1]}°`);

  return (
    <div style={{ width: "100%", height: "500px" }}>
      {/* @ts-ignore - Plotly types are complex */}
      <Plot
        data={[
          {
            // @ts-ignore - Plotly types are complex
            z: H,
            x: incLabels,
            y: altLabels,
            type: "heatmap",
            colorscale: [
              [0, "#1e3a8a"], // Dark blue (low risk)
              [0.3, "#3b82f6"], // Blue
              [0.5, "#fbbf24"], // Yellow (medium risk)
              [0.7, "#f97316"], // Orange
              [1, "#dc2626"], // Red (high risk)
            ],
            colorbar: {
              title: { text: "Debris Density" } as any,
              tickmode: "linear",
              tick0: 0,
              dtick: 3,
              outlinewidth: 0,
              thickness: 20,
              len: 0.7,
              font: { color: "#e2e8f0" },
            } as any,
            hovertemplate:
              "<b>Altitude:</b> %{y}<br>" +
              "<b>Inclination:</b> %{x}<br>" +
              "<b>Debris Count:</b> %{z}<br>" +
              "<extra></extra>",
          },
        ]}
        layout={{
          title: "Debris Density by Altitude & Inclination" as any,
          xaxis: {
            title: "Orbital Inclination",
            color: "#94a3b8",
            gridcolor: "#334155",
          },
          yaxis: {
            title: "Altitude Range",
            color: "#94a3b8",
            gridcolor: "#334155",
          },
          plot_bgcolor: "#0f172a",
          paper_bgcolor: "#0f172a",
          font: { color: "#e2e8f0" },
          margin: { l: 80, r: 80, t: 60, b: 60 },
          autosize: true,
        }}
        config={{
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
