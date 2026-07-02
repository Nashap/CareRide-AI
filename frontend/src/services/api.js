import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add Authorization header if a token exists, excluding public auth endpoints
api.interceptors.request.use(
  (config) => {
    const url = config.url || "";
    const isAuthRoute =
      url.endsWith("/register/") ||
      url.endsWith("/register") ||
      url.endsWith("/login/") ||
      url.endsWith("/login") ||
      url.endsWith("/token/") ||
      url.endsWith("/token") ||
      url.includes("/register") ||
      url.includes("/login") ||
      url.includes("/token");

    if (!isAuthRoute) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // Explicitly remove Authorization header for authentication routes
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized request");

      // Optional:
      // localStorage.removeItem("token");
      // localStorage.removeItem("user");
    }

    return Promise.reject(error);
  }
);

export default api;