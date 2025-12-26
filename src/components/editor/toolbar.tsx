'use client';

import type { Tool } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MousePointer, Scissors, Type, Wand2, Film, Upload } from 'lucide-react';

interface ToolbarProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
}

const tools = [
  { id: 'select', name: 'Select', icon: MousePointer },
  { id: 'trim', name: 'Trim/Cut', icon: Scissors },
  { id: 'upload', name: 'Upload Media', icon: Upload },
  { id: 'text', name: 'Add Text', icon: Type },
  { id: 'effects', name: 'Effects', icon: Film },
  { id: 'ai', name: 'AI Tools', icon: Wand2 },
] as const;


export default function Toolbar({ activeTool, setActiveTool }: ToolbarProps) {
  return (
    <aside className="flex flex-col items-center gap-2 border-r bg-secondary/20 p-2">
      <TooltipProvider delayDuration={0}>
        {tools.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === tool.id ? 'default' : 'ghost'}
                size="icon"
                className={`transition-all duration-200 ${activeTool === tool.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                onClick={() => setActiveTool(tool.id)}
              >
                <tool.icon className="h-5 w-5" />
                <span className="sr-only">{tool.name}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{tool.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </aside>
  );
}
