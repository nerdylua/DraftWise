import type { NextApiRequest, NextApiResponse } from "next";
import { rateLimit } from "@/lib/security";
import { MAX_PRD_CHARS } from "@/lib/gates";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Enforce JSON body
  const ct = (req.headers['content-type'] || '').toString();
  if (!ct.includes('application/json')) {
    return res.status(415).json({ error: 'Unsupported Media Type' });
  }

  if (!rateLimit(req, res, { windowMs: 60_000, max: 10 })) return;

  const { prdContent } = req.body as { prdContent?: string };

  if (typeof prdContent !== 'string' || prdContent.trim().length === 0) {
    return res.status(400).json({ error: 'Missing PRD content' });
  }
  if (prdContent.length > MAX_PRD_CHARS) {
    return res.status(413).json({ error: 'PRD too large' });
  }

  try {
    // Here you would typically save to your database
    // For now, we'll just return success
    return res.status(200).json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Failed to save PRD' });
  }
} 

export const config = {
  api: {
    bodyParser: { sizeLimit: '200kb' },
  },
};