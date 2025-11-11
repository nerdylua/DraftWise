import type { NextApiRequest, NextApiResponse } from 'next';
import { rateLimit } from "@/lib/security";
import { MAX_PRD_CHARS, withConcurrency, withTimeout } from "@/lib/gates";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!rateLimit(req, res, { windowMs: 60_000, max: 10 })) return;

  const { prd } = req.body;

  if (!prd || typeof prd !== "string") {
    return res.status(400).json({ error: "PRD text is required" });
  }
  if (prd.length > MAX_PRD_CHARS) {
    return res.status(413).json({ error: "PRD too large" });
  }

  const prompt = `
Given the following Product Requirement Document (PRD), return a STRICT JSON array of roles that should debate it. 
ONLY use these roles: ["UX Lead", "Backend Engineer", "Data Scientist", "DevOps Engineer", "Security Specialist", "Finance Analyst", "Legal Advisor", "Marketing Strategist"].

PRD:
${prd}

Respond ONLY with valid JSON. Example:
["UX Lead", "Backend Engineer"]
`;

  try {
    const geminiModel: any = google('gemini-2.0-flash-lite');
    // @ts-ignore suppress model type mismatch due to mixed internal versions
    const { text } = await withConcurrency('llm-role', 3, () => withTimeout(
      generateText({ model: geminiModel, prompt, temperature: 0.2 }),
      20000
    ));

    const cleanText = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanText);

    res.status(200).json({ agents: parsed });
  } catch {
    res.status(500).json({ error: "Failed to fetch agents" });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '200kb',
    },
  },
};