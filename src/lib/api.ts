import { AgentName } from "./agents";

export async function fetchAgents(prd: string): Promise<AgentName[]> {
  const res = await fetch('/api/select-agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prd }),
  });
  if (res.status === 429) {
    await res.json().catch(() => null);
    throw new Error('RATE_LIMIT');
  }
  if (!res.ok) {
    await res.json().catch(() => null);
    throw new Error('FAILED');
  }
  const data = await res.json();
  return (data.agents || []) as AgentName[];
}
  