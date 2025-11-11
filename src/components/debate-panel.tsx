"use client";

import { useEffect, useRef, useState } from "react";
import { agentProfiles, AgentName } from "@/lib/agents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PRDDisplay } from "@/components/PRDDisplay";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { RateLimitDialog } from "@/components/RateLimitDialog";
import { Loader2 } from "lucide-react";

interface Props {
  prd: string;
  agents: AgentName[];
  active?: boolean;
}

type Turn = {
  name: AgentName;
  message: string;
};

export function DebatePanel({ prd, agents, active = true }: Props) {
  const [debate, setDebate] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [finalPRD, setFinalPRD] = useState("");
  const [generatingFinal, setGeneratingFinal] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  const startedRef = useRef(false);

  useEffect(() => {
    if (!agents.length || !active) return;
    if (startedRef.current) return;
    startedRef.current = true;
    let cancelled = false;
    setLoading(true);
    setFinalPRD("");
    setDebate([]);

    const run = async () => {
      try {
        const res = await fetch('/api/debate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
          },
          body: JSON.stringify({ prd, agents }),
        });
        if (res.status === 429) {
          setRateLimited(true);
          setLoading(false);
          return;
        }
        if (!res.ok || !res.body) {
          throw new Error('Failed to start stream');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const processChunk = (text: string) => {
          buffer += text;
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';
          for (const part of parts) {
            const lines = part.split(/\r?\n/);
            let event: string | null = null;
            let data = '';
            for (const line of lines) {
              if (line.startsWith('event: ')) event = line.slice(7).trim();
              else if (line.startsWith('data: ')) data += line.slice(6);
            }
            if (!event) continue;
            if (event === 'turn-start') {
              try {
                const obj = JSON.parse(data);
                setDebate((prev) => [...prev, { name: obj.name as AgentName, message: '' }]);
              } catch { /* ignore */ }
            } else if (event === 'turn-delta') {
              try {
                const obj = JSON.parse(data) as { name: string; delta: string };
                setDebate((prev) => {
                  if (!prev.length) return prev;
                  const next = prev.slice();
                  const last = next[next.length - 1];
                  // append delta to last turn (streaming)
                  next[next.length - 1] = { ...last, message: (last.message || '') + (obj.delta || '') } as any;
                  return next as any;
                });
              } catch { /* ignore */ }
            } else if (event === 'turn-end') {
              try {
                const obj = JSON.parse(data);
                setDebate((prev) => {
                  if (!prev.length) return prev;
                  const next = prev.slice();
                  next[next.length - 1] = { name: obj.name as AgentName, message: obj.message };
                  return next;
                });
              } catch { /* ignore */ }
            } else if (event === 'turn') {
              try {
                const obj = JSON.parse(data);
                setDebate((prev) => [...prev, { name: obj.name as AgentName, message: obj.message }]);
              } catch { /* ignore */ }
            } else if (event === 'error') {
              toast.error('Streaming error');
            } else if (event === 'end') {
              setLoading(false);
            }
          }
        };

        while (!cancelled) {
          const { value, done } = await reader.read();
          if (done) break;
          processChunk(decoder.decode(value, { stream: true }));
        }
      } catch {
        if (!cancelled) toast.error('Failed to simulate debate.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [agents, prd, active]);

  const synthesizeFinalPRD = async () => {
    setGeneratingFinal(true);
    try {
      const res = await fetch("/api/synthesize-prd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prd, debate }),
      });
      if (res.status === 429) {
        setRateLimited(true);
        return;
      }
      const data = await res.json();
      setFinalPRD(data.improvedPrd);
    } catch {
      toast.error("Failed to generate final PRD.");
    } finally {
      setGeneratingFinal(false);
    }
  };

  const handleSavePRD = async (content: string) => {
    try {
      const res = await fetch("/api/save-prd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prdContent: content }),
      });
      if (!res.ok) throw new Error("Failed to save PRD");
      toast.success("PRD saved successfully!");
    } catch {
      toast.error("Failed to save PRD");
    }
  };

  const handleAcceptPRD = async (content: string) => {
    await handleSavePRD(content);
    toast.success("PRD accepted and saved!");
  };

  return (
    <Card className="border shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Expert Discussion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {debate.map((turn, index) => {
              const profile = agentProfiles[turn.name];
              return (
                <Card
                  key={index}
                  className="transition-all hover:shadow-md"
                  style={{ 
                    borderLeft: `4px solid ${profile.color}`,
                    background: `linear-gradient(to right, ${profile.color}05, transparent)`
                  }}
                >
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="shrink-0">
                      <img
                        src={profile.avatar}
                        alt={turn.name}
                        className="w-10 h-10 rounded-full ring-2 ring-background"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-semibold" style={{ color: profile.color }}>
                        {turn.name}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {turn.message}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {loading && (
              <div className="space-y-4">
                <Skeleton className="h-[80px] w-full" />
                <Skeleton className="h-[80px] w-full" />
              </div>
            )}
          </div>
        </ScrollArea>

        {!loading && !finalPRD && (
          <div className="flex flex-col items-center w-full">
            <Button 
              onClick={synthesizeFinalPRD} 
              className="w-full cursor-pointer hover:opacity-80 transition-opacity"
              variant="default"
              size="lg"
              disabled={generatingFinal}
            >
              {generatingFinal ? "Generating Final PRD..." : "Synthesize Final PRD"}
            </Button>
            {generatingFinal && (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Working on synthesis…</span>
              </div>
            )}
          </div>
        )}

        {finalPRD && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Improved PRD</CardTitle>
            </CardHeader>
            <CardContent>
              <PRDDisplay 
                prdContent={finalPRD}
                onSave={handleSavePRD}
              />
            </CardContent>
          </Card>
        )}
      </CardContent>
      <RateLimitDialog open={rateLimited} onOpenChange={setRateLimited} />
    </Card>
  );
}
