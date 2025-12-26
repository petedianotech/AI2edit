'use client';

import React, { useState } from 'react';
import type { Clip } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Video, Music, Type } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface TimelineProps {
  clips: Clip[];
  selectedClip: Clip | null;
  onSelectClip: (clip: Clip | null) => void;
  playhead: number;
  setPlayhead: (value: number) => void;
}

const TOTAL_DURATION = 60; // seconds
const PIXELS_PER_SECOND = 40;

const trackConfig = {
  video: { icon: Video, label: 'Video', bg: 'bg-primary/10', border: 'border-primary/50' },
  audio1: { icon: Music, label: 'Audio 1', bg: 'bg-accent/10', border: 'border-accent/50' },
};

export default function Timeline({ clips, selectedClip, onSelectClip, playhead, setPlayhead }: TimelineProps) {
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
    <div className="relative h-16 bg-card border-b" key={trackId} onClick={(e) => {
        // Clear selection if clicking on empty space
        if (e.target === e.currentTarget) {
            onSelectClip(null);
        }
    }}>
      {clips.filter(c => c.track === trackId).map(clip => (
        <div
          key={clip.id}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 h-12 rounded-md overflow-hidden flex items-center px-2 cursor-pointer transition-all duration-200 ease-in-out",
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

  return (
    <div className="h-[250px] bg-secondary/20 border-t flex flex-col">
      <div className="flex h-full">
        <div className="w-32 border-r p-2 flex flex-col gap-2">
          {Object.entries(trackConfig).map(([key, { icon: Icon, label, bg, border }]) => (
            <div key={key} className={cn("h-16 rounded-md flex items-center p-2 text-sm font-semibold", bg, border)}>
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </div>
          ))}
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
