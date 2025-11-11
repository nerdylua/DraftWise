import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Download, 
  FileText, 
  FileType,
  Rocket,
  Edit,
  Check,
  X 
} from "lucide-react";
import { RateLimitDialog } from "@/components/RateLimitDialog";

interface PRDDisplayProps {
  prdContent: string;
  onSave?: (content: string) => void;
}

export function PRDDisplay({ prdContent, onSave }: PRDDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(prdContent);
  const [rateLimited, setRateLimited] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    onSave?.(editedContent);
  };

  const downloadAsTxt = () => {
    const blob = new Blob([editedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'final-prd.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsMarkdown = () => {
    const blob = new Blob([editedContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'final-prd.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsPdf = async () => {
    try {
      const response = await fetch('/api/download-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prdContent: editedContent }),
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          setRateLimited(true);
          return;
        }
        throw new Error(`PDF generation failed: ${response.statusText}`);
      }

      // Get the blob directly without checking content type
      const blob = await response.blob();
      
      // Create object URL and trigger download
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'final-prd.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <Card className="border shadow-md">
      <CardContent className="p-6 space-y-6">
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} variant="default" className="cursor-pointer hover:opacity-90">
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <Button 
                onClick={() => {
                  setEditedContent(prdContent);
                  setIsEditing(false);
                }}
                variant="outline"
                className="cursor-pointer hover:opacity-90"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {editedContent}
              </pre>
            </ScrollArea>
            
            <div className="flex flex-wrap items-center justify-between w-full gap-2">
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="cursor-pointer hover:opacity-90"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <div className="relative pt-5">
                <span className="absolute left-0 -top-1 text-xs text-muted-foreground">
                  download as
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={downloadAsTxt}
                    variant="secondary"
                    size="sm"
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    TXT
                  </Button>
                  <Button
                    onClick={downloadAsMarkdown}
                    variant="secondary"
                    size="sm"
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <FileType className="mr-2 h-4 w-4" />
                    MD
                  </Button>
                  <Button
                    onClick={downloadAsPdf}
                    variant="secondary"
                    size="sm"
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <FileType className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <RateLimitDialog open={rateLimited} onOpenChange={setRateLimited} />
    </Card>
  );
}
