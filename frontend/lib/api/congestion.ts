const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';

export async function fetchCongestionScores() {
  const res = await fetch(`${API_BASE}/congestion/score`);
  return res.json();
}

export async function fetchCongestionTrend() {
  const res = await fetch(`${API_BASE}/congestion/trend`);
  return res.json();
}
