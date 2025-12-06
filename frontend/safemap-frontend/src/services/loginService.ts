const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api/v1/users";

export function loginWithGoogle() {
  window.location.href = `${API_BASE}/auth/google`;
}