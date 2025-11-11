"use client";

import { useEffect } from 'react';
import { Dialog } from "@/components/ui/dialog"; // keep Dialog import minimal; we override styling
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RateLimitDialog({ open, onOpenChange }: Props) {
  // Auto-hide after some seconds to avoid persistent obstruction
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onOpenChange(false), 6000);
    return () => clearTimeout(t);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 w-[260px] animate-in fade-in slide-in-from-top rounded-md border bg-background/95 backdrop-blur p-4 shadow-lg flex flex-col gap-3"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-semibold">Usage Limit Reached</div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
          aria-label="Close"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        You’ve hit the current quota. Try again shortly, or self-deploy to lift limits.
      </p>
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="secondary"
          className="cursor-pointer hover:opacity-90"
          onClick={() => onOpenChange(false)}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}
