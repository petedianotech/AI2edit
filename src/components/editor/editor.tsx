'use client';

import { useState } from 'react';
import type { Clip, Tool } from '@/lib/types';
import Header from './header';
import Toolbar from './toolbar';
import Preview from './preview';
import Timeline from './timeline';
import PropertiesPanel from './properties-panel';

const initialClips: Clip[] = [
  { id: '1', type: 'video', name: 'Nature Sunset', start: 0, duration: 5, track: 'video' },
  { id: '2', type: 'video', name: 'City Skyline', start: 5, duration: 7, track: 'video' },
  { id: '3', type: 'audio', name: 'Uplifting Music', start: 0, duration: 12, track: 'audio1' },
  { id: '4', type: 'text', name: 'Hello World', start: 1, duration: 3, track: 'video' },
];

export default function Editor() {
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [clips, setClips] = useState<Clip[]>(initialClips);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);

  const handleAddClip = (newClip: Clip) => {
    setClips(prev => [...prev, newClip]);
  }

  const handleSelectClip = (clip: Clip | null) => {
    if (activeTool !== 'select' && activeTool !== 'ai' && activeTool !== 'upload') {
      setActiveTool('select');
    }
    setSelectedClip(clip);
  }

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
                />
            </div>
          </div>
          <Timeline
            clips={clips}
            selectedClip={selectedClip}
            onSelectClip={handleSelectClip}
          />
        </main>
      </div>
    </div>
  );
}
