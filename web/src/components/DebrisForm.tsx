"use client";

import { useState } from "react";
import { API_BASE } from "../lib/config";
import Button from "./Button";
import Card from "./Card";
import Alert from "./Alert";

interface DebrisObject {
  name: string;
  altitude_km: number;
  inclination_deg: number;
  eccentricity: number;
  mass_kg?: number;
  cross_section_m2?: number;
}

interface DebrisFormProps {
  onAnalysisCreated?: (analysisId: string) => void;
}

export default function DebrisForm({ onAnalysisCreated }: DebrisFormProps) {
  const [objects, setObjects] = useState<DebrisObject[]>([
    {
      name: "ISS Module Fragment",
      altitude_km: 420,
      inclination_deg: 51.6,
      eccentricity: 0.0003,
      mass_kg: 150,
      cross_section_m2: 2.5,
    },
  ]);
  const [analysisName, setAnalysisName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addDebrisObject = () => {
    setObjects([
      ...objects,
      {
        name: `Debris Object ${objects.length + 1}`,
        altitude_km: 400,
        inclination_deg: 0,
        eccentricity: 0,
      },
    ]);
  };

  const removeDebrisObject = (index: number) => {
    setObjects(objects.filter((_, i) => i !== index));
  };

  const updateDebrisObject = (
    index: number,
    field: keyof DebrisObject,
    value: any
  ) => {
    const updated = [...objects];
    updated[index] = { ...updated[index], [field]: value };
    setObjects(updated);
  };

  const handleSubmit = async () => {
    if (objects.length === 0) {
      setError("Please add at least one debris object");
      return;
    }

    // Validate objects
    for (const obj of objects) {
      if (!obj.name.trim()) {
        setError("All debris objects must have a name");
        return;
      }
      if (obj.altitude_km < 100 || obj.altitude_km > 50000) {
        setError("Altitude must be between 100 and 50,000 km");
        return;
      }
      if (obj.inclination_deg < 0 || obj.inclination_deg > 180) {
        setError("Inclination must be between 0 and 180 degrees");
        return;
      }
      if (obj.eccentricity < 0 || obj.eccentricity >= 1) {
        setError("Eccentricity must be between 0 and 1");
        return;
      }
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE}/debris`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          objects,
          analysis_name: analysisName || "Untitled Analysis",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to submit debris data");
      }

      const result = await response.json();
      setSuccess(
        `Analysis created successfully! Analysis ID: ${result.analysis_id}`
      );

      if (onAnalysisCreated) {
        onAnalysisCreated(result.analysis_id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit debris data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div style={{ marginBottom: "24px" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "16px",
          }}
        >
          Space Debris Analysis Setup
        </h2>
        <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
          Define the debris objects you want to analyze for collision risk.
        </p>

        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}
          >
            Analysis Name (Optional)
          </label>
          <input
            type="text"
            value={analysisName}
            onChange={(e) => setAnalysisName(e.target.value)}
            placeholder="e.g., ISS Debris Field Analysis"
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #374151",
              borderRadius: "6px",
              backgroundColor: "#1f2937",
              color: "white",
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ fontSize: "1.25rem", fontWeight: "600" }}>
            Debris Objects
          </h3>
          <Button onClick={addDebrisObject} variant="secondary">
            Add Debris Object
          </Button>
        </div>

        <div style={{ display: "grid", gap: "16px" }}>
          {objects.map((obj, index) => (
            <div
              key={index}
              style={{
                padding: "16px",
                border: "1px solid #374151",
                borderRadius: "8px",
                backgroundColor: "#111827",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <h4 style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                  Object {index + 1}
                </h4>
                {objects.length > 1 && (
                  <Button
                    onClick={() => removeDebrisObject(index)}
                    variant="danger"
                    size="sm"
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "0.875rem",
                    }}
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    value={obj.name}
                    onChange={(e) =>
                      updateDebrisObject(index, "name", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      border: "1px solid #374151",
                      borderRadius: "4px",
                      backgroundColor: "#1f2937",
                      color: "white",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "0.875rem",
                    }}
                  >
                    Altitude (km) *
                  </label>
                  <input
                    type="number"
                    value={obj.altitude_km}
                    onChange={(e) =>
                      updateDebrisObject(
                        index,
                        "altitude_km",
                        parseFloat(e.target.value)
                      )
                    }
                    min="100"
                    max="50000"
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      border: "1px solid #374151",
                      borderRadius: "4px",
                      backgroundColor: "#1f2937",
                      color: "white",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "0.875rem",
                    }}
                  >
                    Inclination (degrees) *
                  </label>
                  <input
                    type="number"
                    value={obj.inclination_deg}
                    onChange={(e) =>
                      updateDebrisObject(
                        index,
                        "inclination_deg",
                        parseFloat(e.target.value)
                      )
                    }
                    min="0"
                    max="180"
                    step="0.1"
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      border: "1px solid #374151",
                      borderRadius: "4px",
                      backgroundColor: "#1f2937",
                      color: "white",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "0.875rem",
                    }}
                  >
                    Eccentricity *
                  </label>
                  <input
                    type="number"
                    value={obj.eccentricity}
                    onChange={(e) =>
                      updateDebrisObject(
                        index,
                        "eccentricity",
                        parseFloat(e.target.value)
                      )
                    }
                    min="0"
                    max="0.99"
                    step="0.001"
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      border: "1px solid #374151",
                      borderRadius: "4px",
                      backgroundColor: "#1f2937",
                      color: "white",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "0.875rem",
                    }}
                  >
                    Mass (kg) - Optional
                  </label>
                  <input
                    type="number"
                    value={obj.mass_kg || ""}
                    onChange={(e) =>
                      updateDebrisObject(
                        index,
                        "mass_kg",
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                    min="0"
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      border: "1px solid #374151",
                      borderRadius: "4px",
                      backgroundColor: "#1f2937",
                      color: "white",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "0.875rem",
                    }}
                  >
                    Cross Section (m²) - Optional
                  </label>
                  <input
                    type="number"
                    value={obj.cross_section_m2 || ""}
                    onChange={(e) =>
                      updateDebrisObject(
                        index,
                        "cross_section_m2",
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                    min="0"
                    step="0.1"
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      border: "1px solid #374151",
                      borderRadius: "4px",
                      backgroundColor: "#1f2937",
                      color: "white",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        <Button
          onClick={handleSubmit}
          disabled={loading || objects.length === 0}
          variant="primary"
        >
          {loading ? "Submitting..." : "Create Analysis"}
        </Button>
      </div>
    </Card>
  );
}
