import axios from "axios";

export const API_URL = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  withCredentials: true,
});

API_URL.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling auth errors globally
API_URL.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(
      `❌ ${error.response?.status || "Network Error"} ${error.config?.url}`
    );

    // Handle authentication errors globally
    if (error.response?.status === 401) {
      console.warn("Authentication failed - token may be expired");

      // Don't redirect if we're already on the home page or callback page
      const currentPath = window.location.pathname;
      if (!currentPath.includes("/callback") && currentPath !== "/") {
        // Optional: Show a toast notification here
        console.log("Redirecting to home due to authentication failure");
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    }

    return Promise.reject(error);
  }
);
