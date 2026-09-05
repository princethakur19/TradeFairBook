import axios from "axios";
import { getAuthItem } from "../utils/auth";

const apiBaseURL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// OPTIONAL: Attach token automatically
api.interceptors.request.use((config) => {
  const token = getAuthItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
