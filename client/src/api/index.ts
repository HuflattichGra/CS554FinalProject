export const API_BASE =
  import.meta.env.VITE_DOCKER === "true"
    ? "/api"
    : import.meta.env.VITE_API_URL || "http://localhost:3000";
