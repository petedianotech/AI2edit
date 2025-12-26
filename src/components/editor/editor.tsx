'use client';

import { useState } from 'react';
import type { Clip, Tool } from '@/lib/types';
import Header from './header';
import Preview from './preview';
import Timeline from './timeline';
import PropertiesPanel from './properties-panel';
import { useToast } from '@/hooks/use-toast';
import AiTools from './ai-tools';
import UploadPanel from './upload-panel';
import { Wand2, Upload, Plus, Text, Scissors, Trash2, Smile, Sparkles, Crop } from 'lucide-react';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Button } from '../ui/button';

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

  const handleDeleteClip = (clipId?: string) => {
    const idToDelete = clipId || selectedClip?.id;
    if (!idToDelete) {
        toast({title: 'No clip selected', description: 'Please select a clip to delete.', variant: 'destructive'})
        return;
    };
    setClips(prev => prev.filter(c => c.id !== idToDelete));
    if (selectedClip && selectedClip.id === idToDelete) {
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

  const handleAddText = () => {
    const newClip: Clip = {
      id: `text-${Date.now()}`,
      type: 'text',
      name: 'New Text',
      start: playhead,
      duration: 5,
      track: 'video', // Text clips go on the video track for overlay
      text: 'Your Text Here',
      fontSize: 48,
      color: '#FFFFFF',
      fontFamily: 'Inter, sans-serif'
    };
    handleAddClip(newClip);
    setSelectedClip(newClip);
    setActiveTool('select'); // Switch back to select tool
  }
  
  const renderPanelContent = () => {
    switch(activeTool) {
      case 'ai':
        return <AiTools onAddClip={handleAddClip} />;
      case 'upload':
        return <UploadPanel onAddClip={handleAddClip} />
      case 'select':
      default:
        return <PropertiesPanel selectedClip={selectedClip} onUpdateClip={handleUpdateClip} onDeleteClip={handleDeleteClip} />;
    }
  };

  const ToolButton = ({ tool, icon, label }: {tool: Tool, icon: React.ReactNode, label: string}) => (
    <Button variant="ghost" className={`flex flex-col h-auto p-2 gap-1 ${activeTool === tool ? 'text-primary' : ''}`} onClick={() => setActiveTool(tool)}>
      {icon}
      <span className="text-xs">{label}</span>
    </Button>
  );

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      <Header clips={clips}/>
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center bg-black p-4">
            <Preview clips={clips} playhead={playhead} />
        </div>
        <div className="w-full bg-card border-t p-2">
            <ScrollArea>
                <div className="flex flex-row items-center gap-2">
                    <ToolButton tool="ai" icon={<Smile />} label="Sticker" />
                    <ToolButton tool="text" icon={<Text />} label="Text" />
                    <ToolButton tool="split" icon={<Scissors />} label="Split" />
                     <Button variant="ghost" className="flex flex-col h-auto p-2 gap-1" onClick={() => handleDeleteClip()}>
                        <Trash2 />
                        <span className="text-xs">Delete</span>
                    </Button>
                    <ToolButton tool="ai" icon={<Sparkles />} label="Enhance" />
                    <ToolButton tool="ai" icon={<Crop />} label="Cutout" />

                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
      </main>
      <Timeline
            clips={clips}
            selectedClip={selectedClip}
            onSelectClip={handleSelectClip}
            playhead={playhead}
            setPlayhead={setPlayhead}
            onUpdateClip={handleUpdateClip}
            onAddClip={handleAddClip}
        />
    </div>
  );
}
