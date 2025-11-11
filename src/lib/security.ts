import type { NextApiRequest, NextApiResponse } from 'next';

type RateRecord = { count: number; resetAt: number };
const rateStore = new Map<string, RateRecord>();

export function getClientIp(req: NextApiRequest): string {
  const xff = (req.headers['x-forwarded-for'] || '') as string;
  const socketAddr = typeof req.socket.remoteAddress === 'string' ? req.socket.remoteAddress : '';
  const ip = xff.split(',')[0].trim() || socketAddr || 'unknown';
  return ip;
}

export function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  opts?: { windowMs?: number; max?: number }
): boolean {
  const windowMs = opts?.windowMs ?? 60_000; // 1 minute
  const max = opts?.max ?? 30; // 30 requests per window by default
  const ip = getClientIp(req);
  const key = `anon:${ip}`;
  const now = Date.now();
  const rec = rateStore.get(key);
  if (!rec || now > rec.resetAt) {
    rateStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (rec.count >= max) {
    const retry = Math.max(0, rec.resetAt - now);
    res.setHeader('Retry-After', Math.ceil(retry / 1000));
    res.status(429).json({ error: 'Too Many Requests' });
    return false;
  }
  rec.count += 1;
  rateStore.set(key, rec);
  return true;
}
