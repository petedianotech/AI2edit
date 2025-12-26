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
  Text,
  Plus,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import AiTools from './ai-tools';
import UploadPanel from './upload-panel';
import PropertiesPanel from './properties-panel';
import { Sidebar, SidebarTrigger } from '../ui/sidebar';

const initialClips: Clip[] = [];

export default function Editor() {
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [clips, setClips] = useState<Clip[]>(initialClips);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [playhead, setPlayhead] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTextEditorOpen, setIsTextEditorOpen] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isUploadPanelOpen, setIsUploadPanelOpen] = useState(false);

  const { toast } = useToast();
  
  const totalDuration = Math.max(60, ...clips.map(c => c.start + c.duration)) + 5;


  useEffect(() => {
    let animationFrameId: number;
    if (isPlaying) {
      const startTime = performance.now() - playhead * 1000;
      const animate = () => {
        const newPlayhead = (performance.now() - startTime) / 1000;
        if (newPlayhead < totalDuration) {
          setPlayhead(newPlayhead);
          animationFrameId = requestAnimationFrame(animate);
        } else {
          setIsPlaying(false);
          setPlayhead(0);
        }
      };
      animationFrameId = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, totalDuration]);


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
        // If we select a text clip, don't automatically open the full editor
        // but ensure the properties panel shows the text options.
        // setIsTextEditorOpen(true); 
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
            textShadow: { color: '#000000', blur: 4, offsetX: 2, offsetY: 2 },
            textOutline: { color: '#000000', width: 2 },
            textBackground: { color: '#00000080', padding: 10, borderRadius: 10 },
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
    // We don't null out selected clip so the properties panel stays populated
  }

  const BottomToolbar = () => (
    <div className="flex items-center justify-around bg-card border-t p-2">
      <Button variant="ghost" className="flex flex-col h-auto" onClick={() => setIsAiPanelOpen(true)}>
        <Wand2 className="w-6 h-6" />
        <span className="text-xs">AI Tools</span>
      </Button>
      <Button variant="ghost" className="flex flex-col h-auto" onClick={() => setIsUploadPanelOpen(true)}>
        <Upload className="w-6 h-6" />
        <span className="text-xs">Media</span>
      </Button>
      <Button variant="ghost" className="flex flex-col h-auto" onClick={openTextEditor}>
        <Text className="w-6 h-6" />
        <span className="text-xs">Text</span>
      </Button>
    </div>
  )

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center bg-[#111111] p-4 relative">
              <Preview
                clips={clips}
                playhead={playhead}
                isPlaying={isPlaying}
                onUpdateClip={handleUpdateClip}
                selectedClipId={selectedClip?.id}
                onSelectClip={handleSelectClip}
              />
              <BottomToolbar />
          </div>
          
          <div className="md:hidden">
              <Sheet>
                  <SheetTrigger asChild>
                      <SidebarTrigger side="right" />
                  </SheetTrigger>
                  <SheetContent side="right" className="p-0 w-80">
                      <PropertiesPanel selectedClip={selectedClip} onUpdateClip={handleUpdateClip} onDeleteClip={handleDeleteClip} onOpenTextEditor={openTextEditor}/>
                  </SheetContent>
              </Sheet>
          </div>
          <Sidebar side="right" className="hidden md:flex flex-col">
              <PropertiesPanel selectedClip={selectedClip} onUpdateClip={handleUpdateClip} onDeleteClip={handleDeleteClip} onOpenTextEditor={openTextEditor}/>
          </Sidebar>
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
              totalDuration={totalDuration}
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
        
        <Sheet open={isAiPanelOpen} onOpenChange={setIsAiPanelOpen}>
            <SheetContent side="bottom" className="h-[90vh] bg-card text-foreground border-t flex flex-col p-0">
               <SheetHeader className="p-4 border-b">
                <SheetTitle>AI Tools</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto">
                <AiTools onAddClip={handleAddClip} />
              </div>
            </SheetContent>
        </Sheet>

        <Sheet open={isUploadPanelOpen} onOpenChange={setIsUploadPanelOpen}>
            <SheetContent side="bottom" className="h-[90vh] bg-card text-foreground border-t flex flex-col p-0">
               <SheetHeader className="p-4 border-b">
                <SheetTitle>Upload Media</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto">
                <UploadPanel onAddClip={handleAddClip}/>
              </div>
            </SheetContent>
        </Sheet>

      </div>
  );
}
