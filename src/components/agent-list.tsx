import { Card, CardContent, CardDescription } from "@/components/ui/card";
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
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {agents.map((agent) => (
          <Card key={agent} className="relative flex items-center p-2 bg-muted/50">
            <Avatar className="h-8 w-8 mr-2">
              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-medium">
                {agent[0]}
              </div>
            </Avatar>
            <CardContent className="p-0 pr-6">
              <div className="font-medium">{agent}</div>
              <CardDescription className="text-xs">Expert Agent</CardDescription>
            </CardContent>
            {onRemove && (
              <Button
                aria-label={`Remove ${agent}`}
                title={`Remove ${agent}`}
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => onRemove(agent)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
