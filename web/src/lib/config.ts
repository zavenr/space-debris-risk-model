const config = {
  // API settings
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",

  // App information
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Space Debris Risk Model",
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",

  // Environment detection
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
};

export default config;

// Keep existing export for backward compatibility
export const API_BASE = config.apiUrl;
