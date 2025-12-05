const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export async function postReport(payload: any) {
  const res = await fetch(`${API_BASE}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// add other wrappers: getReports, approveReport, getShelters, etc.
