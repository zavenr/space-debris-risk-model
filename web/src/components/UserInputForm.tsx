"use client";

import { useState } from "react";
import {
  DebrisObject,
  AnalysisRequest,
  DEFAULT_DEBRIS_OBJECT,
  EXAMPLE_DEBRIS_OBJECTS,
} from "../types/debris";
import Card from "./Card";
import Button from "./Button";

interface UserInputFormProps {
  onSubmit: (data: AnalysisRequest) => void;
  loading?: boolean;
}

export default function UserInputForm({
  onSubmit,
  loading = false,
}: UserInputFormProps) {
  const [analysisName, setAnalysisName] = useState("");
  const [objects, setObjects] = useState<DebrisObject[]>([
    { ...DEFAULT_DEBRIS_OBJECT },
  ]);
  const [timeSpan, setTimeSpan] = useState(30);
  const [simulationSteps, setSimulationSteps] = useState(1000);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addObject = () => {
    setObjects([
      ...objects,
      { ...DEFAULT_DEBRIS_OBJECT, name: `Debris Object ${objects.length + 1}` },
    ]);
  };

  const removeObject = (index: number) => {
    if (objects.length > 1) {
      setObjects(objects.filter((_, i) => i !== index));
    }
  };

  const updateObject = (
    index: number,
    field: keyof DebrisObject,
    value: string | number | undefined
  ) => {
    const updated = [...objects];
    updated[index] = { ...updated[index], [field]: value };
    setObjects(updated);

    // Clear any existing errors for this field
    const errorKey = `${index}.${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const { [errorKey]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const loadExample = (exampleIndex: number) => {
    if (EXAMPLE_DEBRIS_OBJECTS[exampleIndex]) {
      setObjects([{ ...EXAMPLE_DEBRIS_OBJECTS[exampleIndex] }]);
      setAnalysisName(
        `Example Analysis: ${EXAMPLE_DEBRIS_OBJECTS[exampleIndex].name}`
      );
    }
  };

  const loadAllExamples = () => {
    setObjects(EXAMPLE_DEBRIS_OBJECTS.map((obj) => ({ ...obj })));
    setAnalysisName("Multi-Object Risk Analysis");
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!analysisName.trim()) {
      newErrors.analysisName = "Analysis name is required";
    }

    objects.forEach((obj, index) => {
      if (!obj.name.trim()) {
        newErrors[`${index}.name`] = "Object name is required";
      }
      if (obj.altitude_km < 200 || obj.altitude_km > 50000) {
        newErrors[`${index}.altitude_km`] =
          "Altitude must be between 200 and 50,000 km";
      }
      if (obj.inclination_deg < 0 || obj.inclination_deg > 180) {
        newErrors[`${index}.inclination_deg`] =
          "Inclination must be between 0 and 180 degrees";
      }
      if (obj.eccentricity < 0 || obj.eccentricity >= 1) {
        newErrors[`${index}.eccentricity`] =
          "Eccentricity must be between 0 and 1";
      }
      if (obj.mass_kg !== undefined && obj.mass_kg <= 0) {
        newErrors[`${index}.mass_kg`] = "Mass must be positive";
      }
      if (obj.cross_section_m2 !== undefined && obj.cross_section_m2 <= 0) {
        newErrors[`${index}.cross_section_m2`] =
          "Cross section must be positive";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        name: analysisName,
        objects,
        time_span_days: timeSpan,
        simulation_steps: simulationSteps,
      });
    }
  };

  return (
    <Card title="Debris Analysis Configuration" className="mb-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Analysis Name */}
        <div>
          <label
            htmlFor="analysisName"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Analysis Name
          </label>
          <input
            id="analysisName"
            type="text"
            value={analysisName}
            onChange={(e) => setAnalysisName(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg bg-slate-700 border text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.analysisName ? "border-red-500" : "border-slate-600"
            }`}
            placeholder="Enter analysis name..."
          />
          {errors.analysisName && (
            <p className="mt-1 text-sm text-red-400">{errors.analysisName}</p>
          )}
        </div>

        {/* Quick Examples */}
        <div>
          <p className="text-sm font-medium text-slate-300 mb-3">
            Quick Examples:
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_DEBRIS_OBJECTS.map((obj, index) => (
              <Button
                key={index}
                variant="secondary"
                size="sm"
                onClick={() => loadExample(index)}
                type="button"
              >
                {obj.name}
              </Button>
            ))}
            <Button
              variant="secondary"
              size="sm"
              onClick={loadAllExamples}
              type="button"
            >
              Load All Examples
            </Button>
          </div>
        </div>

        {/* Debris Objects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-white">Debris Objects</h4>
            <Button type="button" onClick={addObject} size="sm">
              Add Object
            </Button>
          </div>

          <div className="space-y-4">
            {objects.map((obj, index) => (
              <div
                key={index}
                className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-white">Object {index + 1}</h5>
                  {objects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeObject(index)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={obj.name}
                      onChange={(e) =>
                        updateObject(index, "name", e.target.value)
                      }
                      className={`w-full px-3 py-2 text-sm rounded bg-slate-600 border text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        errors[`${index}.name`]
                          ? "border-red-500"
                          : "border-slate-500"
                      }`}
                    />
                    {errors[`${index}.name`] && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors[`${index}.name`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Altitude (km) *
                    </label>
                    <input
                      type="number"
                      value={obj.altitude_km}
                      onChange={(e) =>
                        updateObject(
                          index,
                          "altitude_km",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className={`w-full px-3 py-2 text-sm rounded bg-slate-600 border text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        errors[`${index}.altitude_km`]
                          ? "border-red-500"
                          : "border-slate-500"
                      }`}
                      min="200"
                      max="50000"
                    />
                    {errors[`${index}.altitude_km`] && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors[`${index}.altitude_km`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Inclination (degrees) *
                    </label>
                    <input
                      type="number"
                      value={obj.inclination_deg}
                      onChange={(e) =>
                        updateObject(
                          index,
                          "inclination_deg",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className={`w-full px-3 py-2 text-sm rounded bg-slate-600 border text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        errors[`${index}.inclination_deg`]
                          ? "border-red-500"
                          : "border-slate-500"
                      }`}
                      min="0"
                      max="180"
                      step="0.1"
                    />
                    {errors[`${index}.inclination_deg`] && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors[`${index}.inclination_deg`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Eccentricity *
                    </label>
                    <input
                      type="number"
                      value={obj.eccentricity}
                      onChange={(e) =>
                        updateObject(
                          index,
                          "eccentricity",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className={`w-full px-3 py-2 text-sm rounded bg-slate-600 border text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        errors[`${index}.eccentricity`]
                          ? "border-red-500"
                          : "border-slate-500"
                      }`}
                      min="0"
                      max="0.999"
                      step="0.001"
                    />
                    {errors[`${index}.eccentricity`] && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors[`${index}.eccentricity`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Mass (kg)
                    </label>
                    <input
                      type="number"
                      value={obj.mass_kg || ""}
                      onChange={(e) =>
                        updateObject(
                          index,
                          "mass_kg",
                          parseFloat(e.target.value) || undefined
                        )
                      }
                      className={`w-full px-3 py-2 text-sm rounded bg-slate-600 border text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        errors[`${index}.mass_kg`]
                          ? "border-red-500"
                          : "border-slate-500"
                      }`}
                      min="0.001"
                      step="0.1"
                      placeholder="Optional"
                    />
                    {errors[`${index}.mass_kg`] && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors[`${index}.mass_kg`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Cross Section (m²)
                    </label>
                    <input
                      type="number"
                      value={obj.cross_section_m2 || ""}
                      onChange={(e) =>
                        updateObject(
                          index,
                          "cross_section_m2",
                          parseFloat(e.target.value) || undefined
                        )
                      }
                      className={`w-full px-3 py-2 text-sm rounded bg-slate-600 border text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        errors[`${index}.cross_section_m2`]
                          ? "border-red-500"
                          : "border-slate-500"
                      }`}
                      min="0.001"
                      step="0.1"
                      placeholder="Optional"
                    />
                    {errors[`${index}.cross_section_m2`] && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors[`${index}.cross_section_m2`]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simulation Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="timeSpan"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Time Span (days)
            </label>
            <input
              id="timeSpan"
              type="number"
              value={timeSpan}
              onChange={(e) => setTimeSpan(parseInt(e.target.value) || 30)}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="365"
            />
          </div>

          <div>
            <label
              htmlFor="simulationSteps"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Simulation Steps
            </label>
            <input
              id="simulationSteps"
              type="number"
              value={simulationSteps}
              onChange={(e) =>
                setSimulationSteps(parseInt(e.target.value) || 1000)
              }
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="100"
              max="10000"
              step="100"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" loading={loading} size="lg">
            Run Risk Analysis
          </Button>
        </div>
      </form>
    </Card>
  );
}
