const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export async function getReportsApi() {
  const res = await fetch(`${API_BASE}/api/v1/reports`);
  if (!res.ok) throw new Error("Failed to get reports");
  return res.json();
}

export async function patchReportApi(id: string, body: any) {
  const res = await fetch(`${API_BASE}/api/v1/reports/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to patch report");
  return res.json();
}

export async function getHazardsApi() {
  const res = await fetch(`${API_BASE}/api/v1/hazards/all`);
  console.log(res);
  if (!res.ok) return [];
  return res.json();
}

export async function getSafePlacesApi() {
  const res = await fetch(`${API_BASE}/api/v1/safe-places`, {
    method: "GET",
    credentials: 'include',
  });
  console.log("daaaaaaa");
  console.log(res);
  

  if(!res.ok) return [];
  return res.json();
}

export async function postSafePlaceApi(place: { lat: number; lng: number; name?: string }) {
  const response = await fetch("http://localhost:3000/api/v1/safe-places", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(place),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  return response.json();
}