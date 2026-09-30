// Backend API base URL
// Automatically uses localhost:7000 on local machine and the deployed Vercel backend on production
const isLocalhost = Boolean(
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
   window.location.hostname === "127.0.0.1" ||
   window.location.hostname === "")
);

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (isLocalhost
    ? "http://localhost:7000"
    : "https://dev-console-backend.vercel.app");