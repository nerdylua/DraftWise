import type { NextApiRequest, NextApiResponse } from "next";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { rateLimit } from "@/lib/security";
import { MAX_PRD_CHARS, withTimeout } from "@/lib/gates";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!rateLimit(req, res, { windowMs: 60_000, max: 10 })) return;

  const { prd, debate } = req.body as { prd: string; debate: Array<{ name: string; message: string; round?: number }> };
  if (!prd || !debate?.length) return res.status(400).json({ error: 'Missing PRD or debate history' });
  if (typeof prd !== 'string' || prd.length > MAX_PRD_CHARS) return res.status(413).json({ error: 'PRD too large' });

  // AI SDK summarization
  const debateTranscript = debate.map(d => `${d.name}: ${d.message}`).join('\n');
  const prompt = `Improve PRD in plain text (no markdown). Structure with: Project Name, Overview, Features and Requirements, Implementation. Incorporate debate feedback.\nOriginal PRD:\n${prd}\nDebate:\n${debateTranscript}`;
  try {
    const geminiModel: any = google('gemini-2.0-flash');
    // @ts-ignore suppress model type mismatch
    const { text } = await withTimeout(
      generateText({ model: geminiModel, prompt, temperature: 0.2 } as any),
      25000
    );
    const improvedPrd = text.trim();
    res.status(200).json({ improvedPrd });
  } catch {
    res.status(500).json({ error: 'Synthesis failed' });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '200kb' } }
};
