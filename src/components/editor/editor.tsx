'use client';

import { useState } from 'react';
import type { Clip, Tool } from '@/lib/types';
import Header from './header';
import Toolbar from './toolbar';
import Preview from './preview';
import Timeline from './timeline';
import PropertiesPanel from './properties-panel';
import { useToast } from '@/hooks/use-toast';

const initialClips: Clip[] = [
  { id: '1', type: 'video', name: 'Nature Sunset', start: 0, duration: 5, track: 'video', volume: 1 },
  { id: '2', type: 'video', name: 'City Skyline', start: 5, duration: 7, track: 'video', volume: 1 },
  { id: '3', type: 'audio', name: 'Uplifting Music', start: 0, duration: 12, track: 'audio1', volume: 0.5 },
  { id: '4', type: 'text', name: 'Hello World', start: 1, duration: 3, track: 'video', text: 'Hello World!' },
];

export default function Editor() {
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [clips, setClips] = useState<Clip[]>(initialClips);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [playhead, setPlayhead] = useState(0);
  const { toast } = useToast();

  const handleAddClip = (newClip: Clip) => {
    // Prevent overlap
    const newClips = clips.filter(c => c.track !== newClip.track || (newClip.start + newClip.duration <= c.start || newClip.start >= c.start + c.duration));
    if (newClips.length !== clips.length) {
      // Find a free spot
      let newStart = 0;
      const trackClips = clips.filter(c => c.track === newClip.track).sort((a,b) => a.start - b.start);
      for (const clip of trackClips) {
        if (newStart + newClip.duration <= clip.start) {
          break;
        }
        newStart = clip.start + clip.duration;
      }
      newClip.start = newStart;
    }
    setClips(prev => [...prev, newClip]);
  }

  const handleSelectClip = (clip: Clip | null) => {
    if (activeTool !== 'select' && activeTool !== 'split' && activeTool !== 'ai' && activeTool !== 'upload' && activeTool !== 'text') {
      setActiveTool('select');
    }
    
    if (activeTool === 'split' && clip) {
      handleSplitClip(clip.id);
      return;
    }

    setSelectedClip(clip);
  }

  const handleUpdateClip = (updatedClip: Clip) => {
    setClips(prev => prev.map(c => c.id === updatedClip.id ? updatedClip : c));
    if (selectedClip && selectedClip.id === updatedClip.id) {
        setSelectedClip(updatedClip);
    }
  }

  const handleDeleteClip = (clipId: string) => {
    setClips(prev => prev.filter(c => c.id !== clipId));
    setSelectedClip(null);
    toast({ title: 'Clip deleted' });
  }

  const handleSplitClip = (clipId: string) => {
    const clipToSplit = clips.find(c => c.id === clipId);
    if (!clipToSplit) return;

    if (playhead <= clipToSplit.start || playhead >= clipToSplit.start + clipToSplit.duration) {
      toast({ title: 'Split Error', description: 'Playhead must be within the clip to split.', variant: 'destructive'});
      return;
    }

    const part1Duration = playhead - clipToSplit.start;
    const part2Duration = clipToSplit.duration - part1Duration;

    const part1: Clip = {
      ...clipToSplit,
      duration: part1Duration,
    };

    const part2: Clip = {
      ...clipToSplit,
      id: `${clipToSplit.type}-${Date.now()}`,
      start: playhead,
      duration: part2Duration,
    };
    
    setClips(prev => [...prev.filter(c => c.id !== clipId), part1, part2]);
    setSelectedClip(null);
    toast({ title: 'Clip split', description: `${clipToSplit.name} was split into two parts.`});
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} />
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 p-4 lg:p-6 overflow-auto relative">
            <div className="flex-1 flex items-center justify-center">
              <Preview />
            </div>
            <div className="w-full max-w-sm">
                <PropertiesPanel
                    activeTool={activeTool}
                    selectedClip={selectedClip}
                    onAddClip={handleAddClip}
                    onUpdateClip={handleUpdateClip}
                    onDeleteClip={handleDeleteClip}
                />
            </div>
          </div>
          <Timeline
            clips={clips}
            selectedClip={selectedClip}
            onSelectClip={handleSelectClip}
            playhead={playhead}
            setPlayhead={setPlayhead}
          />
        </main>
      </div>
    </div>
  );
}
