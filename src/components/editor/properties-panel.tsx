'use client';

import type { Tool, Clip } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import AiTools from './ai-tools';
import { Info, Wand2, Upload, FileVideo, Type, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const fontFamilies = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Lobster', value: 'Lobster, cursive' },
    { name: 'Courier Prime', value: '"Courier Prime", monospace' },
];

interface PropertiesPanelProps {
  activeTool: Tool;
  selectedClip: Clip | null;
  onAddClip: (clip: Clip) => void;
  onUpdateClip: (clip: Clip) => void;
  onDeleteClip: (clipId: string) => void;
}

function TextPanel({ onAddClip }: { onAddClip: (clip: Clip) => void }) {
  const { toast } = useToast();
  const handleAddText = () => {
    const newClip: Clip = {
      id: `text-${Date.now()}`,
      type: 'text',
      name: 'New Text',
      start: 0,
      duration: 5,
      track: 'video',
      text: 'Your Text Here',
      fontSize: 48,
      color: '#FFFFFF',
      fontFamily: 'Inter, sans-serif'
    };
    onAddClip(newClip);
    toast({
      title: 'Text clip added',
      description: 'A new text clip has been added to the timeline.',
    });
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5 text-primary" />
            Add Text
          </CardTitle>
          <CardDescription>Add a new text overlay to your video.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleAddText}>
            Add Text Clip
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


export default function PropertiesPanel({ activeTool, selectedClip, onAddClip, onUpdateClip, onDeleteClip }: PropertiesPanelProps) {
  const [clip, setClip] = useState<Clip | null>(selectedClip);

  useEffect(() => {
    setClip(selectedClip);
  }, [selectedClip]);
  
  const handleUpdate = (props: Partial<Clip>) => {
    if (clip) {
        const updatedClip = { ...clip, ...props };
        setClip(updatedClip);
        onUpdateClip(updatedClip);
    }
  }

  const renderContent = () => {
    if (activeTool === 'ai') {
      return <AiTools onAddClip={onAddClip} />;
    }
    
    if (activeTool === 'text') {
      return <TextPanel onAddClip={onAddClip} />;
    }

    if (clip) {
      return (
        <div className="p-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Clip Properties
              </CardTitle>
              <CardDescription>Details for '{clip.name}'</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span>{clip.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="capitalize">{clip.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start:</span>
                <span>{clip.start.toFixed(2)}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span>{clip.duration.toFixed(2)}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Track:</span>
                <span className="capitalize">{clip.track}</span>
              </div>

              {(clip.type === 'video' || clip.type === 'audio') && (
                <div className="space-y-2 pt-2">
                    <Label>Volume</Label>
                    <Slider
                        min={0}
                        max={1}
                        step={0.05}
                        value={[clip.volume ?? 1]}
                        onValueChange={(value) => handleUpdate({ volume: value[0]})}
                    />
                </div>
              )}
               {clip.type === 'text' && (
                <div className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="text-content">Text Content</Label>
                    <Textarea
                        id="text-content"
                        value={clip.text ?? ''}
                        onChange={(e) => handleUpdate({ text: e.target.value })}
                        rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="font-family">Font</Label>
                     <Select value={clip.fontFamily} onValueChange={(value) => handleUpdate({ fontFamily: value })}>
                        <SelectTrigger id="font-family">
                            <SelectValue placeholder="Select a font" />
                        </SelectTrigger>
                        <SelectContent>
                            {fontFamilies.map(font => (
                                <SelectItem key={font.value} value={font.value} style={{fontFamily: font.value}}>{font.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                   <div className="space-y-2">
                     <Label>Font Size</Label>
                     <Slider
                         min={12}
                         max={128}
                         step={2}
                         value={[clip.fontSize ?? 48]}
                         onValueChange={(value) => handleUpdate({ fontSize: value[0] })}
                     />
                   </div>
                   <div className="space-y-2">
                     <Label>Color</Label>
                     <Input
                         type="color"
                         value={clip.color ?? '#FFFFFF'}
                         onChange={(e) => handleUpdate({ color: e.target.value })}
                         className="w-full h-10 p-1"
                     />
                   </div>
                </div>
              )}
               <Button variant="destructive" size="sm" className="w-full mt-6" onClick={() => onDeleteClip(clip.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Clip
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="p-4 bg-secondary rounded-full mb-4">
            {activeTool === 'ai' && <Wand2 className="w-10 h-10 text-primary" />}
            {activeTool === 'upload' && <Upload className="w-10 h-10 text-primary" />}
            {activeTool === 'text' && <Type className="w-10 h-10 text-primary" />}
            {activeTool !== 'ai' && activeTool !== 'upload' && activeTool !== 'text' && <Info className="w-10 h-10 text-primary" />}
        </div>
        <h3 className="font-semibold text-lg">Properties</h3>
        <p className="text-sm text-muted-foreground">
          {activeTool === 'ai' 
            ? 'Select an AI tool to get started.'
            : activeTool === 'upload'
            ? 'Upload media to your project.'
            : activeTool === 'text'
            ? 'Add a new text clip to the timeline.'
            : 'Select a clip on the timeline to see its properties or choose a tool from the toolbar.'
          }
        </p>
      </div>
    )
  };

  return (
    <aside className="w-full h-full border-l bg-secondary/20">
      <ScrollArea className="h-full">
        {renderContent()}
      </ScrollArea>
    </aside>
  );
}
