const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export async function fetchCongestionScores() {
  const res = await fetch(`${API_BASE}/congestion/score`);
  return res.json();
}

export async function fetchCongestionTrend() {
  const res = await fetch(`${API_BASE}/congestion/trend`);
  return res.json();
}
