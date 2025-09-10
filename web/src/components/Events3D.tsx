"use client";
import dynamic from "next/dynamic";

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
  const x = events.map((e) => e.x);
  const y = events.map((e) => e.y);
  const z = events.map((e) => e.z);
  const color = events.map((e) => e.vrel_km_s);
  const text = events.map(
    (e) => `t=${e.time_s}s<br>v=${e.vrel_km_s.toFixed(2)} km/s`
  );

  const earth = makeEarthSphere(earthRadiusKm);

  return (
    <Plot
      data={[
        // Earth as a faint surface for spatial context
        {
          type: "surface",
          x: earth.xs,
          y: earth.ys,
          z: earth.zs,
          showscale: false,
          opacity: 0.15,
          contours: { z: { show: false } },
        } as any,
        // Close-approach events as 3D points
        {
          type: "scatter3d",
          mode: "markers",
          x,
          y,
          z,
          text,
          hoverinfo: "text",
          marker: {
            size: 4,
            color, // color by relative speed
            colorscale: "Hot",
          },
        } as any,
      ]}
      layout={{
        title: "Close-Approach Events (3D ECI)",
        scene: {
          xaxis: { title: "X (km)" },
          yaxis: { title: "Y (km)" },
          zaxis: { title: "Z (km)" },
          aspectmode: "data", // equal scale
        },
        margin: { l: 0, r: 0, t: 40, b: 0 },
        autosize: true,
      }}
      style={{ width: "100%", height: "520px" }}
      useResizeHandler
    />
  );
}
