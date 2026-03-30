import { getBasicAuth, clearBasicAuth } from "./auth";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://healthy-meal-planner-0s0b.onrender.com";

  //const API_BASE_URL = "http://localhost:8000";

export async function apiFetch(endpoint, options = {}) {
  const auth = getBasicAuth();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: auth,
      ...(options.headers || {}),
    },
  });

  // auto logout if unauthorized
  if (response.status === 401) {
    clearBasicAuth();
    alert("Session expired. Please login again.");
    window.location.href = "/";
  }

  return response;
}