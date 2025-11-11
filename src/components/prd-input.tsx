"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { fetchAgents } from "@/lib/api";
import { RateLimitDialog } from "@/components/RateLimitDialog";
import { toast } from "sonner";
import { AgentName } from "@/lib/agents";
import { FileText, Loader2 } from "lucide-react";

interface Props {
  onAgentsSelected: (agents: AgentName[]) => void;
  setPRD: (prd: string) => void;
}

export function PRDInput({ onAgentsSelected, setPRD }: Props) {
  const [prdText, setPrdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rateLimited, setRateLimited] = useState(false);

  const handleSubmit = async () => {
    if (!prdText.trim()) {
      toast.error("Please enter a PRD to analyze");
      return;
    }
    setLoading(true);
    setProgress(0);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 300);

      try {
        const agents = await fetchAgents(prdText);
        clearInterval(interval);
        setProgress(100);
        onAgentsSelected(agents);    
        setPRD(prdText);
        toast.success("Agents selected successfully!");
      } catch (e: unknown) {
        clearInterval(interval);
        if (e instanceof Error && e.message === 'RATE_LIMIT') {
          setRateLimited(true);
          toast.error('Rate limit exceeded');
        } else {
          toast.error("Failed to analyze PRD. Please try again.");
        }
      }
    } catch {
      toast.error("Failed to analyze PRD. Please try again.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm p-6 space-y-6">
      <div className="flex items-center gap-2 border-b pb-3">
        <FileText className="h-5 w-5 text-primary" />
        <div>
          <h3 className="font-semibold">Product Requirements Document</h3>
          <p className="text-sm text-muted-foreground">
            Paste your PRD or product abstract below to begin the analysis
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="prd-input" className="text-sm font-medium">
          Document Content
        </Label>
        <Textarea
          id="prd-input"
          placeholder="Enter your product requirements here..."
          value={prdText}
          onChange={(e) => setPrdText(e.target.value)}
          className="min-h-[250px] resize-none font-mono text-sm"
          disabled={loading}
        />
      </div>
      
      <div className="space-y-4">
        <Button 
          onClick={handleSubmit} 
          disabled={loading || !prdText.trim()}
          className="w-full cursor-pointer hover:opacity-80 transition-opacity"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing PRD...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Start Agent Selection
            </>
          )}
        </Button>
        
        {loading && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing document and selecting expert agents...
            </p>
          </div>
        )}
      </div>
      <RateLimitDialog open={rateLimited} onOpenChange={setRateLimited} />
    </div>
  );
}
