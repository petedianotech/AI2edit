'use client';

import React, { useState, useRef } from 'react';
import type { Clip } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Video, Music, Type, Plus, Loader2, Play, Pause } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';


interface TimelineProps {
  clips: Clip[];
  selectedClip: Clip | null;
  onSelectClip: (clip: Clip | null) => void;
  playhead: number;
  setPlayhead: (value: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onUpdateClip: (clip: Clip) => void;
  onAddClip: (clip: Clip) => void;
}

const TOTAL_DURATION = 60; // seconds
const PIXELS_PER_SECOND = 50;

const trackConfig = {
  video: { icon: Video, label: 'Video', bg: 'bg-primary/10', border: 'border-primary/50' },
  audio1: { icon: Music, label: 'Audio 1', bg: 'bg-accent/10', border: 'border-accent/50' },
};

function fileToDataUri(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
}

function getMediaDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const media = document.createElement(file.type.startsWith('video') ? 'video' : 'audio');
        media.addEventListener('loadedmetadata', () => {
            resolve(media.duration);
            URL.revokeObjectURL(url);
        });
        media.addEventListener('error', (e) => {
            reject('Failed to load media metadata');
            URL.revokeObjectURL(url);
        })
        media.src = url;
    })
}

export default function Timeline({ clips, selectedClip, onSelectClip, playhead, setPlayhead, isPlaying, setIsPlaying, onAddClip }: TimelineProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const isVideo = file.type.startsWith('video/');
      const [src, duration] = await Promise.all([
          fileToDataUri(file),
          getMediaDuration(file),
      ]);
      
      const newClip: Clip = {
        id: `${isVideo ? 'video' : 'audio'}-${Date.now()}`,
        type: isVideo ? 'video' : 'audio',
        name: file.name,
        start: 0,
        duration: duration,
        track: isVideo ? 'video' : 'audio1',
        src: src,
        volume: 1,
      };

      onAddClip(newClip);
      toast({
        title: 'Media added',
        description: `${file.name} has been added to the timeline.`,
      });
    } catch (error) {
      console.error('Error adding media:', error);
      toast({
        title: 'Upload failed',
        description: 'Could not process the selected file.',
        variant: 'destructive',
      });
    } finally {
        setUploading(false);
        // Reset file input
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  const renderRuler = () => {
    const markers = [];
    for (let i = 0; i <= TOTAL_DURATION; i += 1) {
      const isMajor = i % 5 === 0;
      markers.push(
        <div
          key={`marker-${i}`}
          className="h-full flex flex-col items-start"
          style={{ width: PIXELS_PER_SECOND }}
        >
          <div className={cn("w-px bg-muted-foreground/50", isMajor ? 'h-4' : 'h-2')}></div>
          {isMajor && <span className="text-xs -ml-1 text-muted-foreground">{i}s</span>}
        </div>
      );
    }
    return <div className="flex h-full">{markers}</div>;
  };

  const ClipIcon = ({ type }: { type: Clip['type'] }) => {
    switch (type) {
      case 'video': return <Video className="w-3 h-3 mr-1" />;
      case 'audio': return <Music className="w-3 h-3 mr-1" />;
      case 'text': return <Type className="w-3 h-3 mr-1" />;
      default: return null;
    }
  };

  const renderTrack = (trackId: keyof typeof trackConfig) => (
    <div className="relative h-14 bg-card border-b" key={trackId} onClick={(e) => {
        // Clear selection if clicking on empty space
        if (e.target === e.currentTarget) {
            onSelectClip(null);
        }
    }}>
      {clips.filter(c => c.track === trackId).map(clip => (
        <div
          key={clip.id}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 h-10 rounded-md overflow-hidden flex items-center px-2 cursor-pointer transition-all duration-200 ease-in-out",
            "bg-secondary hover:bg-secondary/80 border",
            selectedClip?.id === clip.id ? "border-primary ring-2 ring-primary" : "border-border"
          )}
          style={{
            left: `${clip.start * PIXELS_PER_SECOND}px`,
            width: `${clip.duration * PIXELS_PER_SECOND}px`,
          }}
          onClick={(e) => {
              e.stopPropagation();
              onSelectClip(clip);
            }
          }
        >
          <ClipIcon type={clip.type} />
          <span className="text-xs font-medium truncate text-foreground">{clip.name}</span>
        </div>
      ))}
    </div>
  );
  
  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newPlayhead = x / PIXELS_PER_SECOND;
    setPlayhead(Math.max(0, Math.min(TOTAL_DURATION, newPlayhead)));
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  }

  return (
    <div className="h-[220px] bg-secondary/20 flex flex-col">
      <div className="flex h-full">
        <div className="w-20 border-r p-2 flex flex-col justify-start items-center gap-2">
             <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="video/*,audio/*"
                disabled={uploading}
            />
            <Button onClick={handleAddClick} size="icon" variant="outline" className="rounded-lg w-12 h-12 bg-card" disabled={uploading}>
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            </Button>
            <Button onClick={handlePlayPause} size="icon" variant="outline" className="rounded-lg w-12 h-12 bg-card">
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
        </div>
        <ScrollArea className="flex-1 whitespace-nowrap">
          <div className="relative" style={{ width: TOTAL_DURATION * PIXELS_PER_SECOND }}>
            <div className="h-8 border-b cursor-pointer" onClick={handleRulerClick}>
              {renderRuler()}
            </div>
            {Object.keys(trackConfig).map(key => renderTrack(key as keyof typeof trackConfig))}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
              style={{ left: `${playhead * PIXELS_PER_SECOND}px` }}
            >
              <div className="absolute -top-1 -left-1.5 w-4 h-4 bg-red-500 rounded-full"></div>
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
