'use client';

import { useState } from 'react';
import type { Clip, Tool } from '@/lib/types';
import Header from './header';
import Toolbar from './toolbar';
import Preview from './preview';
import Timeline from './timeline';
import PropertiesPanel from './properties-panel';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AiTools from './ai-tools';
import UploadPanel from './upload-panel';
import TextPanel from './text-panel';
import { Wand2, Upload, Type } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

const initialClips: Clip[] = [];

export default function Editor() {
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [clips, setClips] = useState<Clip[]>(initialClips);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [playhead, setPlayhead] = useState(0);
  const { toast } = useToast();

  const handleAddClip = (newClip: Clip) => {
    let finalClip = { ...newClip };

    // Prevent overlap
    const trackClips = clips.filter(c => c.track === finalClip.track).sort((a,b) => a.start - b.start);
    let newStart = 0;
    for (const clip of trackClips) {
        if (newStart + finalClip.duration <= clip.start) {
          break;
        }
        newStart = clip.start + clip.duration;
    }
    finalClip.start = newStart;

    setClips(prev => [...prev, finalClip]);
  }

  const handleSelectClip = (clip: Clip | null) => {
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
    if (selectedClip && selectedClip.id === clipId) {
        setSelectedClip(null);
    }
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
      // For video/audio, we might need to adjust src or add seeking info
    };
    
    setClips(prev => [...prev.filter(c => c.id !== clipId), part1, part2]);
    setSelectedClip(null);
    toast({ title: 'Clip split', description: `${clipToSplit.name} was split into two parts.`});
  };
  
  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      <Header clips={clips}/>
      <div className="flex flex-1 overflow-hidden">
        <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} />
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-hidden">
            <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="flex-1 flex items-center justify-center bg-card rounded-lg relative overflow-hidden">
                    <Preview clips={clips} playhead={playhead} selectedClip={selectedClip} />
                </div>
                <Timeline
                    clips={clips}
                    selectedClip={selectedClip}
                    onSelectClip={handleSelectClip}
                    playhead={playhead}
                    setPlayhead={setPlayhead}
                    onUpdateClip={handleUpdateClip}
                />
            </div>
            <div className="lg:col-span-1 flex flex-col">
                <aside className="w-full h-full border-l bg-secondary/20 rounded-lg">
                    <ScrollArea className="h-full">
                         <Tabs defaultValue="properties" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="properties">Properties</TabsTrigger>
                                <TabsTrigger value="upload"><Upload className="w-4 h-4 mr-2" /> Media</TabsTrigger>
                                <TabsTrigger value="ai"><Wand2 className="w-4 h-4 mr-2" /> AI</TabsTrigger>
                            </TabsList>
                             <TabsContent value="properties">
                                <PropertiesPanel
                                    selectedClip={selectedClip}
                                    onUpdateClip={handleUpdateClip}
                                    onDeleteClip={handleDeleteClip}
                                />
                             </TabsContent>
                             <TabsContent value="upload">
                                 <UploadPanel onAddClip={handleAddClip} />
                             </TabsContent>
                             <TabsContent value="ai">
                                 <AiTools onAddClip={handleAddClip} />
                             </TabsContent>
                         </Tabs>
                    </ScrollArea>
                </aside>
            </div>
        </main>
      </div>
    </div>
  );
}
