const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api/v1/users";

export function loginWithGoogle() {
  window.location.href = `${API_BASE}/auth/google`;
}

export function logout() {
    window.location.href = `${API_BASE}/logout`;
  }

export async function fetchCurrentUser() {
    try {
        const response = await fetch(`${API_BASE}/me`, {
            credentials: 'include',
        });
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching current user:', error);
        return null;
    }   
}