export interface TruckDimension {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  weightKg: number;
}

export interface BayDefinition {
  id: string;
  bayNumber: string;
  bayType: 'small' | 'medium' | 'large' | 'container';
  maxLengthM: number;
  maxWeightTon: number;
  receivingWindowStart: string; // HH:MM
  receivingWindowEnd: string;   // HH:MM
  isActive: boolean;
}

export interface ConstraintValidationResult {
  isValid: boolean;
  violations: string[];
  bindingConstraints: {
    rule: string;
    threshold: string | number;
    actual: string | number;
  }[];
}

export function validateBookingConstraints(
  truckDim: TruckDimension,
  requestedStart: Date,
  requestedEnd: Date,
  bay: BayDefinition,
  operatingHoursStart: string = '06:00',
  operatingHoursEnd: string = '22:00'
): ConstraintValidationResult {
  const violations: string[] = [];
  const bindingConstraints: ConstraintValidationResult['bindingConstraints'] = [];

  // 1. Truck Length Constraint
  const truckLengthM = (truckDim.lengthCm || 800) / 100;
  if (truckLengthM > bay.maxLengthM) {
    violations.push(`Panjang truk (${truckLengthM}m) melebihi batas bay ${bay.bayNumber} (${bay.maxLengthM}m)`);
    bindingConstraints.push({
      rule: 'bay_max_length',
      threshold: `${bay.maxLengthM}m`,
      actual: `${truckLengthM}m`
    });
  }

  // 2. Truck Weight Constraint
  const truckWeightTon = (truckDim.weightKg || 8000) / 1000;
  if (truckWeightTon > bay.maxWeightTon) {
    violations.push(`Beban truk (${truckWeightTon} ton) melebihi batas bay ${bay.bayNumber} (${bay.maxWeightTon} ton)`);
    bindingConstraints.push({
      rule: 'bay_max_weight',
      threshold: `${bay.maxWeightTon} ton`,
      actual: `${truckWeightTon} ton`
    });
  }

  // Helper time parser (HH:MM -> minutes from midnight)
  const parseTimeToMin = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  const startH = requestedStart.getHours();
  const startM = requestedStart.getMinutes();
  const requestedStartMin = startH * 60 + startM;

  const endH = requestedEnd.getHours();
  const endM = requestedEnd.getMinutes();
  const requestedEndMin = endH * 60 + endM;

  // 3. Receiving Window Constraint
  const rwStartMin = parseTimeToMin(bay.receivingWindowStart || '06:00');
  const rwEndMin = parseTimeToMin(bay.receivingWindowEnd || '21:00');

  if (requestedStartMin < rwStartMin || requestedEndMin > rwEndMin) {
    violations.push(`Slot (${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}) di luar receiving window bay ${bay.bayNumber} (${bay.receivingWindowStart} - ${bay.receivingWindowEnd})`);
    bindingConstraints.push({
      rule: 'bay_receiving_window',
      threshold: `${bay.receivingWindowStart} - ${bay.receivingWindowEnd}`,
      actual: `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`
    });
  }

  // 4. Zone Operating Hours Constraint
  const zoneStartMin = parseTimeToMin(operatingHoursStart);
  const zoneEndMin = parseTimeToMin(operatingHoursEnd);

  if (requestedStartMin < zoneStartMin || requestedEndMin > zoneEndMin) {
    violations.push(`Slot di luar jam operasional zona (${operatingHoursStart} - ${operatingHoursEnd})`);
    bindingConstraints.push({
      rule: 'zone_operating_hours',
      threshold: `${operatingHoursStart} - ${operatingHoursEnd}`,
      actual: `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`
    });
  }

  return {
    isValid: violations.length === 0,
    violations,
    bindingConstraints
  };
}

/**
 * Assembles explanation string dynamically from validator/solver data.
 * Does NOT use static pre-written sentences.
 */
export function buildDecisionExplanation(
  status: 'optimal_proven' | 'best_within_time' | 'fallback',
  selectedBayNumber: string,
  p90DurationMin: number,
  spilloverDeltaMeterMin: number,
  bindingConstraints: { rule: string; threshold: string | number; actual: string | number }[],
  isStagingUsed: boolean = false
): string {
  const parts: string[] = [];

  if (status === 'optimal_proven') {
    parts.push(`Pencarian terbukti optimal.`);
  } else if (status === 'best_within_time') {
    parts.push(`Pencarian menemukan solusi terbaik dalam batas waktu solver.`);
  } else {
    parts.push(`Solver beralih ke heuristik fallback deterministik.`);
  }

  parts.push(`Slot dialokasikan pada Bay ${selectedBayNumber} dengan estimasi durasi P90 = ${p90DurationMin} menit.`);

  if (spilloverDeltaMeterMin <= 0) {
    parts.push(`Estimasi luberan antrean: 0 meter-menit (tidak meluber ke jalan umum).`);
  } else {
    parts.push(`Luberan antrean berhasil ditekan menjadi ${spilloverDeltaMeterMin} meter-menit.`);
  }

  if (isStagingUsed) {
    parts.push(`Truk diarahkan ke Staging Area terlebih dahulu sebelum waktu rilis bay.`);
  }

  if (bindingConstraints && bindingConstraints.length > 0) {
    const rulesStr = bindingConstraints.map((c) => `${c.rule} (${c.actual} vs batas ${c.threshold})`).join(', ');
    parts.push(`Kendala yang mengikat: ${rulesStr}.`);
  }

  return parts.join(' ');
}
