"use client";

import { useState } from "react";
import { PRDInput } from "@/components/prd-input";
import { AgentList } from "@/components/agent-list";
import { DebatePanel } from "@/components/debate-panel";
import { AgentName } from "@/lib/agents";
import { Card, CardContent} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "next-themes";

export default function HomePage() {
  const [agents, setAgents] = useState<AgentName[]>([]);
  const [prd, setPrd] = useState("");
  const [debateStarted, setDebateStarted] = useState(false);
  const { setTheme } = useTheme();

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-b from-background to-muted">
      <div className="fixed top-4 right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Laptop className="mr-2 h-4 w-4" />
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <main className="container max-w-5xl mx-auto py-6 px-4 space-y-6 min-h-full">
        <div className="text-center space-y-2 pb-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            DraftWise
          </h1>
          <p className="text-2xl text-muted-foreground">
            AI-powered PRD Enhancement Platform
          </p>
        </div>
        <div className="space-y-8">
          <section>
            <h2 className="text-3xl font-semibold mb-4">Product Requirements</h2>
            <PRDInput
              onAgentsSelected={(newAgents) => {
                setAgents(newAgents as AgentName[]);
              }}
              setPRD={setPrd}
            />
          </section>
          {agents.length > 0 && !debateStarted && (
            <>
              <Separator />
              <section>
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold">Selected Experts</h2>
                  <p className="text-muted-foreground mt-1">
                    Expert panel for your PRD review
                  </p>
                </div>
                <Card className="border shadow-sm">
                  <CardContent className="p-6">
                    <AgentList
                      agents={agents}
                      onRemove={(agent) => {
                        setAgents((prev) => prev.filter((a) => a !== agent));
                      }}
                    />
                    {agents.length > 0 && (
                      <div className="mt-6 flex justify-end items-center gap-4">
                        {agents.length < 2 && (
                          <p className="text-sm text-muted-foreground">
                            You need at least 2 agents to have a debate.
                          </p>
                        )}
                        <Button
                          size="lg"
                          onClick={() => setDebateStarted(true)}
                          disabled={!prd || agents.length < 2}
                          title={agents.length < 2 ? 'Select at least 2 agents to start a debate' : undefined}
                        >
                          Start Debate
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>
            </>
          )}
          {debateStarted && agents.length > 0 && prd && (
            <>
              <Separator />
              <section>
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold">Expert Debate</h2>
                  <p className="text-muted-foreground mt-1">
                    Live discussion and analysis of your PRD
                  </p>
                </div>
                <DebatePanel prd={prd} agents={agents} active={debateStarted} />
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
