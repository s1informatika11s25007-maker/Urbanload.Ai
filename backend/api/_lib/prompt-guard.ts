/**
 * Security Edge Layer: Prompt Injection & Security Guard Interceptor
 * Inspired by meta-llama/llama-prompt-guard-2-22m & 86m.
 * Inspects incoming text payloads to detect prompt injection, jailbreak attempts,
 * SQL injection patterns, and GPS spoofing anomalies before reaching core services.
 */

export interface PromptGuardResult {
  isSafe: boolean;
  score: number; // 0.0 (safe) to 1.0 (malicious)
  reason?: string;
}

const INJECTION_PATTERNS = [
  /ignore\s+previous\s+instructions/i,
  /ignore\s+all\s+rules/i,
  /system\s+prompt/i,
  /drop\s+table/i,
  /select\s+\*\s+from/i,
  /union\s+select/i,
  /jailbreak/i,
  /bypass\s+geofence/i,
  /override\s+capacity/i,
  /grant\s+unrestricted/i,
  /<script>/i,
];

export function validatePromptSecurity(input: string): PromptGuardResult {
  if (!input || typeof input !== 'string') {
    return { isSafe: true, score: 0.0 };
  }

  const cleanInput = input.trim();

  // 1. Fast Pattern Classifier (< 2ms)
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(cleanInput)) {
      return {
        isSafe: false,
        score: 0.95,
        reason: `Terdeteksi indikasi manipulasi input/prompt injection: '${pattern.source}'`
      };
    }
  }

  // 2. Length & Anomaly Inspection
  if (cleanInput.length > 2000) {
    return {
      isSafe: false,
      score: 0.85,
      reason: 'Panjang muatan input melebihi batas toleransi keamanan Edge (max 2000 karakter).'
    };
  }

  return { isSafe: true, score: 0.05 };
}
