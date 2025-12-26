'use client';

import type { Clip } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Info, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
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
  selectedClip: Clip | null;
  onUpdateClip: (clip: Clip) => void;
  onDeleteClip: (clipId: string) => void;
}

export default function PropertiesPanel({ selectedClip, onUpdateClip, onDeleteClip }: PropertiesPanelProps) {
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
                <span className="truncate max-w-[150px]">{clip.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="capitalize">{clip.type}</span>
              </div>
              <div className="space-y-2">
                <Label>Start</Label>
                <Input type="number" value={clip.start.toFixed(2)} onChange={(e) => handleUpdate({ start: parseFloat(e.target.value) })} step="0.1" />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input type="number" value={clip.duration.toFixed(2)} onChange={(e) => handleUpdate({ duration: parseFloat(e.target.value) })} step="0.1" />
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
            <Info className="w-10 h-10 text-primary" />
        </div>
        <h3 className="font-semibold text-lg">Properties</h3>
        <p className="text-sm text-muted-foreground">
          Select a clip on the timeline to see its properties.
        </p>
      </div>
    )
  };

  return renderContent();
}
