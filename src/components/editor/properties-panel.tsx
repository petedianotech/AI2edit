'use client';

import type { Tool, Clip } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import AiTools from './ai-tools';
import { Info, Wand2 } from 'lucide-react';

interface PropertiesPanelProps {
  activeTool: Tool;
  selectedClip: Clip | null;
  onAddClip: (clip: Clip) => void;
}

export default function PropertiesPanel({ activeTool, selectedClip, onAddClip }: PropertiesPanelProps) {
  
  const renderContent = () => {
    if (activeTool === 'ai') {
      return <AiTools onAddClip={onAddClip} />;
    }

    if (selectedClip) {
      return (
        <div className="p-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Clip Properties
              </CardTitle>
              <CardDescription>Details for '{selectedClip.name}'</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span>{selectedClip.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="capitalize">{selectedClip.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start:</span>
                <span>{selectedClip.start}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span>{selectedClip.duration}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Track:</span>
                <span className="capitalize">{selectedClip.track}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="p-4 bg-secondary rounded-full mb-4">
            {activeTool === 'ai' ? <Wand2 className="w-10 h-10 text-primary" /> : <Info className="w-10 h-10 text-primary" />}
        </div>
        <h3 className="font-semibold text-lg">Properties</h3>
        <p className="text-sm text-muted-foreground">
          {activeTool === 'ai' 
            ? 'Select an AI tool to get started.'
            : 'Select a clip on the timeline to see its properties or choose a tool from the toolbar.'
          }
        </p>
      </div>
    )
  };

  return (
    <aside className="w-full max-w-sm border-l bg-secondary/20">
      <ScrollArea className="h-full">
        {renderContent()}
      </ScrollArea>
    </aside>
  );
}
