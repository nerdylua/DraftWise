// Simple concurrency and timeout gates to avoid resource exhaustion
const counters = new Map<string, number>();

class BusyError extends Error { readonly code = 'BUSY' as const; constructor(){ super('BUSY'); } }
class TimeoutError extends Error { readonly code = 'TIMEOUT' as const; constructor(){ super('TIMEOUT'); } }

export async function withConcurrency<T>(key: string, limit: number, fn: () => Promise<T>): Promise<T> {
  const current = counters.get(key) ?? 0;
  if (current >= limit) {
    throw new BusyError();
  }
  counters.set(key, current + 1);
  try {
    return await fn();
  } finally {
    counters.set(key, Math.max((counters.get(key) ?? 1) - 1, 0));
  }
}

export function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError()), ms);
  });
  return Promise.race([p, timeout]).finally(() => { if (timer) clearTimeout(timer); });
}

export const MAX_PRD_CHARS = 8000; // hard cap accepted by endpoints
