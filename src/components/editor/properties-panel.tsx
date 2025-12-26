'use client';

import type { Tool, Clip } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import AiTools from './ai-tools';
import { Info, Wand2, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PropertiesPanelProps {
  activeTool: Tool;
  selectedClip: Clip | null;
  onAddClip: (clip: Clip) => void;
}

function UploadPanel({ onAddClip }: { onAddClip: (clip: Clip) => void }) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please choose a video file to upload.',
        variant: 'destructive',
      });
      return;
    }

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const newClip: Clip = {
        id: `video-${Date.now()}`,
        type: 'video',
        name: selectedFile.name,
        start: 0,
        duration: video.duration,
        track: 'video',
      };
      onAddClip(newClip);
      toast({
        title: 'Upload successful',
        description: `${selectedFile.name} has been added to the timeline.`,
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    video.onerror = () => {
        toast({
            title: 'Error reading video',
            description: 'Could not determine video duration.',
            variant: 'destructive',
        });
    };
    video.src = URL.createObjectURL(selectedFile);
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Media
          </CardTitle>
          <CardDescription>Add video clips to your project timeline.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="video-upload">Video File</Label>
            <Input id="video-upload" type="file" accept="video/*" onChange={handleFileChange} ref={fileInputRef} />
          </div>
          {selectedFile && <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>}
          <Button onClick={handleUpload} className="w-full" disabled={!selectedFile}>
            Add to Timeline
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


export default function PropertiesPanel({ activeTool, selectedClip, onAddClip }: PropertiesPanelProps) {
  
  const renderContent = () => {
    if (activeTool === 'ai') {
      return <AiTools onAddClip={onAddClip} />;
    }
    
    if (activeTool === 'upload') {
      return <UploadPanel onAddClip={onAddClip} />;
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
            {activeTool === 'ai' ? <Wand2 className="w-10 h-10 text-primary" /> : 
             activeTool === 'upload' ? <Upload className="w-10 h-10 text-primary" /> : <Info className="w-10 h-10 text-primary" />}
        </div>
        <h3 className="font-semibold text-lg">Properties</h3>
        <p className="text-sm text-muted-foreground">
          {activeTool === 'ai' 
            ? 'Select an AI tool to get started.'
            : activeTool === 'upload'
            ? 'Choose a video file to upload.'
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
