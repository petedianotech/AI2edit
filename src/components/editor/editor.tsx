'use client';

import { useState, useEffect } from 'react';
import type { Clip, Tool } from '@/lib/types';
import Header from './header';
import Preview from './preview';
import Timeline from './timeline';
import { useToast } from '@/hooks/use-toast';
import TextEditor from './text-editor';
import {
  Wand2,
  Upload,
  Plus,
  Text,
  Scissors,
  Trash2,
  Smile,
  Sparkles,
  Crop,
  X,
  Check,
  Palette,
  Type as TypeIcon,
  AlignLeft,
} from 'lucide-react';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';


const initialClips: Clip[] = [];

export default function Editor() {
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [clips, setClips] = useState<Clip[]>(initialClips);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [playhead, setPlayhead] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTextEditorOpen, setIsTextEditorOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let animationFrameId: number;
    if (isPlaying) {
      const startTime = performance.now() - playhead * 1000;
      const animate = () => {
        const newPlayhead = (performance.now() - startTime) / 1000;
        setPlayhead(newPlayhead);
        if (newPlayhead < 60) { // Assuming 60s total duration
          animationFrameId = requestAnimationFrame(animate);
        } else {
          setIsPlaying(false);
          setPlayhead(0);
        }
      };
      animationFrameId = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, playhead]);


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
    return finalClip;
  }

  const handleSelectClip = (clip: Clip | null) => {
    if (activeTool === 'split' && clip) {
      handleSplitClip(clip.id);
      return;
    }

    setSelectedClip(clip);
    if (clip?.type === 'text') {
        setIsTextEditorOpen(true);
    }
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

  const openTextEditor = () => {
    if (selectedClip && selectedClip.type === 'text') {
        // Edit existing text clip
        setIsTextEditorOpen(true);
    } else {
        // Add new text clip
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
            fontFamily: 'Inter, sans-serif',
            textAlign: 'center',
            position: { x: 0.5, y: 0.5 }, // Center of the screen
        };
        const addedClip = handleAddClip(newClip);
        setSelectedClip(addedClip);
        setIsTextEditorOpen(true);
    }
    setActiveTool('select'); // Switch back to select tool
  }
  
  const handleTextEditorClose = (save: boolean, originalClip?: Clip) => {
    if (!save) {
      if (originalClip && clips.find(c => c.id === originalClip.id)) {
        // Revert to original clip if user cancels
        handleUpdateClip(originalClip);
      } else if (selectedClip?.name === 'New Text') {
        // If it was a new clip and user cancelled, delete it
        handleDeleteClip(selectedClip.id);
      }
    }
    setIsTextEditorOpen(false);
    setSelectedClip(null);
  }

  const ToolButton = ({ tool, icon, label, onClick }: {tool: Tool, icon: React.ReactNode, label: string, onClick?: () => void}) => (
    <Button variant="ghost" className={`flex flex-col h-auto p-2 gap-1 ${activeTool === tool ? 'text-primary' : ''}`} onClick={onClick ? onClick : () => setActiveTool(tool)}>
      {icon}
      <span className="text-xs">{label}</span>
    </Button>
  );

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      <Header clips={clips}/>
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center bg-black p-4">
            <Preview
              clips={clips}
              playhead={playhead}
              isPlaying={isPlaying}
              onUpdateClip={handleUpdateClip}
              selectedClipId={selectedClip?.id}
              onSelectClip={handleSelectClip}
            />
        </div>
        <div className="w-full bg-card border-t p-2">
            <ScrollArea>
                <div className="flex flex-row items-center gap-2">
                    <ToolButton tool="ai" icon={<Smile />} label="Sticker" />
                    <ToolButton tool="text" icon={<Text />} label="Text" onClick={openTextEditor} />
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
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            onUpdateClip={handleUpdateClip}
            onAddClip={handleAddClip}
        />
        
      <Sheet open={isTextEditorOpen} onOpenChange={setIsTextEditorOpen}>
          <SheetContent side="bottom" className="h-[90vh] bg-black text-white border-t border-gray-800 flex flex-col p-0">
            <SheetHeader className="p-4 border-b border-gray-800">
              <SheetTitle className="text-white">Text Editor</SheetTitle>
            </SheetHeader>
             {selectedClip?.type === 'text' && (
                <TextEditor
                    clip={selectedClip}
                    onUpdateClip={handleUpdateClip}
                    onClose={handleTextEditorClose}
                />
             )}
          </SheetContent>
      </Sheet>
    </div>
  );
}
