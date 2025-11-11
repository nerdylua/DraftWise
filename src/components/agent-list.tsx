import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { AgentName } from "@/lib/agents";

interface Props {
  agents: AgentName[];
  onRemove?: (agent: AgentName) => void;
}

export function AgentList({ agents, onRemove }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {agents.map((agent) => (
        <div 
          key={agent} 
          className="relative flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border rounded-lg hover:bg-muted/70 transition-colors"
        >
          <Avatar className="h-8 w-8">
            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-medium text-sm">
              {agent[0]}
            </div>
          </Avatar>
          <div className="pr-6">
            <div className="font-medium text-sm">{agent}</div>
          </div>
          {onRemove && (
            <Button
              aria-label={`Remove ${agent}`}
              title={`Remove ${agent}`}
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onRemove(agent)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
