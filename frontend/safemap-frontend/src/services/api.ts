const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export async function getReportsApi() {
  const res = await fetch(`${API_BASE}/api/v1/reports`);
  if (!res.ok) throw new Error("Failed to get reports");
  return res.json();
}

export async function patchReportApi(id: string, body: any) {
  const res = await fetch(`${API_BASE}/api/reports/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to patch report");
  return res.json();
}

export async function getHazardsApi() {
  const res = await fetch(`${API_BASE}/api/hazards`);
  if (!res.ok) return [];
  return res.json();
}

export async function getSafePlacesApi() {
  const res = await fetch(`${API_BASE}/api/v1/safePlaces`);
  if(!res.ok) return [];
  return res.json();
}
