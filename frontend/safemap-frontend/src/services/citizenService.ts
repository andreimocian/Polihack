const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export async function createReport(data: any) {
  const res = await fetch(`${API_BASE}/api/v1/victims/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  let body: any = null;

  try {
    body = await res.json();
  } catch {
  }

  if (!res.ok) {
    const message =
      body?.message ||
      body?.error ||
      `Failed to create report (${res.status} ${res.statusText})`;

    throw new Error(message);
  }

  return body;
}


const citizenService = {
  createReport,
};

export default citizenService;