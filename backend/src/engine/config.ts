import { queryDb } from '../config/db';

export interface SystemConfigParam {
  key: string;
  value: any;
  unit: string;
  source: string;
  status: 'literature' | 'field_survey' | 'assumption';
  description?: string;
}

// In-memory cache for configuration
let configCache: Map<string, SystemConfigParam> | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60000; // 1 minute TTL

export async function loadSystemConfig(): Promise<Map<string, SystemConfigParam>> {
  const now = Date.now();
  if (configCache && now - lastFetchTime < CACHE_TTL_MS) {
    return configCache;
  }

  try {
    const rows = await queryDb('SELECT key, value, unit, source, status, description FROM public.system_config');
    const map = new Map<string, SystemConfigParam>();
    for (const r of rows) {
      let parsedVal = r.value;
      if (typeof r.value === 'string') {
        try { parsedVal = JSON.parse(r.value); } catch (_) {}
      }
      map.set(r.key, {
        key: r.key,
        value: Number(parsedVal) || parsedVal,
        unit: r.unit,
        source: r.source,
        status: r.status,
        description: r.description
      });
    }
    configCache = map;
    lastFetchTime = now;
    return map;
  } catch (err) {
    console.warn('Could not load system_config from DB, using fallback defaults:', err);
    return getDefaultConfig();
  }
}

export function getDefaultConfig(): Map<string, SystemConfigParam> {
  const map = new Map<string, SystemConfigParam>();
  const defaults: SystemConfigParam[] = [
    { key: 'truck_length_default_m', value: 8.0, unit: 'm', source: 'PP No 55/2012', status: 'literature' },
    { key: 'truck_safety_gap_m', value: 2.0, unit: 'm', source: 'Pedoman Teknis Kemenhub', status: 'literature' },
    { key: 'idle_fuel_rate_l_hr', value: 2.5, unit: 'liters/hour', source: 'EPA Heavy Duty Vehicle Idle Study', status: 'literature' },
    { key: 'co2_emission_factor_kg_l', value: 2.68, unit: 'kg_CO2/liter', source: 'IPCC Guidelines for National Greenhouse Gas Inventories', status: 'literature' },
    { key: 'solver_max_timeout_ms', value: 3000, unit: 'ms', source: 'UrbanLoad System Performance Requirement', status: 'assumption' },
    { key: 'no_show_rate_default', value: 0.10, unit: 'ratio', source: 'Survei Lapangan Logistik Perkotaan Tanah Abang', status: 'field_survey' },
    { key: 'p90_duration_buffer_factor', value: 1.35, unit: 'multiplier', source: 'Observasi Distribusi Bongkar Muat Pasar Jaya', status: 'field_survey' },
    { key: 'restriction_hours_start', value: '06:00', unit: 'time', source: 'Pergub DKI Jakarta No 88/2019', status: 'literature' },
    { key: 'restriction_hours_end', value: '22:00', unit: 'time', source: 'Pergub DKI Jakarta No 88/2019', status: 'literature' },
    { key: 'illegal_dwell_threshold_min', value: 15, unit: 'minutes', source: 'SOP Ketertiban Lalu Lintas Dishub', status: 'assumption' },
    { key: 'data_retention_days', value: 90, unit: 'days', source: 'Kebijakan Privasi & Retensi Data UrbanLoad', status: 'assumption' },
    { key: 'dbscan_eps_meters', value: 30, unit: 'm', source: 'Konfigurasi Spasial Kluster Henti Liar', status: 'assumption' },
    { key: 'dbscan_min_samples', value: 3, unit: 'points', source: 'Konfigurasi Spasial Kluster Henti Liar', status: 'assumption' },
    { key: 'objective_weight_spillover', value: 1.0, unit: 'weight', source: 'Fungsi Objektif Optimasi UrbanLoad', status: 'assumption' },
    { key: 'objective_weight_wait_time', value: 0.2, unit: 'weight', source: 'Fungsi Objektif Optimasi UrbanLoad', status: 'assumption' }
  ];
  for (const d of defaults) {
    map.set(d.key, d);
  }
  return map;
}

export async function getConfigValue<T = any>(key: string, defaultValue: T): Promise<T> {
  const config = await loadSystemConfig();
  const param = config.get(key);
  if (param && param.value !== undefined && param.value !== null) {
    return param.value as T;
  }
  return defaultValue;
}
