const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export async function fetchBookings() {
  const res = await fetch(`${API_BASE}/bookings`);
  return res.json();
}

export async function createBooking(payload) {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function allocateSlotWithSolver(payload) {
  const res = await fetch(`${API_BASE}/solver/allocate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchDecisionLogs(zoneId) {
  const url = zoneId ? `${API_BASE}/decision-logs?zoneId=${zoneId}` : `${API_BASE}/decision-logs`;
  const res = await fetch(url);
  return res.json();
}

export async function runSimulation(seed = 42, totalVehicles = 20) {
  const res = await fetch(`${API_BASE}/simulation/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seed, totalVehicles }),
  });
  return res.json();
}

export async function runWhatIfAnalysis(payload) {
  const res = await fetch(`${API_BASE}/simulation/what-if`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchSystemConfigs() {
  const res = await fetch(`${API_BASE}/config`);
  return res.json();
}

export async function fetchIllegalDwellClusters() {
  const res = await fetch(`${API_BASE}/geofence/cluster-dwell`);
  return res.json();
}

export async function sendLLMMessage(message, zoneId) {
  const res = await fetch(`${API_BASE}/llm/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, zoneId }),
  });
  return res.json();
}
