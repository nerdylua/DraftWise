class TimeoutError extends Error { readonly code = 'TIMEOUT' as const; constructor(){ super('TIMEOUT'); } }

export function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError()), ms);
  });
  return Promise.race([p, timeout]).finally(() => { if (timer) clearTimeout(timer); });
}

export const MAX_PRD_CHARS = 8000; // hard cap accepted by endpoints
