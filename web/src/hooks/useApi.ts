import { useState } from "react";
import { API_BASE } from "../lib/config";

export interface ApiError {
  message: string;
  status?: number;
}

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = async (
    endpoint: string,
    options?: RequestInit
  ): Promise<T | null> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as T;
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const apiError: ApiError = {
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        status:
          error instanceof Error && "status" in error
            ? (error as { status: number }).status
            : undefined,
      };
      setState((prev) => ({ ...prev, loading: false, error: apiError }));
      return null;
    }
  };

  const reset = () => {
    setState({ data: null, loading: false, error: null });
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  return {
    ...state,
    execute,
    reset,
    clearError,
  };
}

// Specific hooks for common API operations
export function useHealthCheck() {
  const { execute, ...state } = useApi<{ status: string; timestamp: string }>();

  const checkHealth = () => execute("/health");

  return { ...state, checkHealth };
}

import { SimulationResult, Events3DData } from "../types/debris";

export function useSimulation() {
  const { execute, ...state } = useApi<SimulationResult>();

  const runSimulation = (data?: unknown) =>
    execute("/simulate", {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });

  return { ...state, runSimulation };
}

export function useEvents3D() {
  const { execute, ...state } = useApi<Events3DData>();

  const loadEvents = () => execute("/events");

  return { ...state, loadEvents };
}
