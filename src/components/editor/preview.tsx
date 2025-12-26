'use client';

import { useRef } from 'react';
import type { Clip } from '@/lib/types';
import DraggableResizableText from './draggable-resizable-text';

interface PreviewProps {
  clips: Clip[];
  playhead: number;
  onUpdateClip: (clip: Clip) => void;
  selectedClipId?: string | null;
  onSelectClip: (clip: Clip | null) => void;
}

export default function Preview({ clips, playhead, onUpdateClip, selectedClipId, onSelectClip }: PreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const visibleTextClips = clips.filter(clip =>
    clip.type === 'text' &&
    playhead >= clip.start &&
    playhead < (clip.start + clip.duration)
  );

  const activeVideoClip = clips.find(clip =>
    clip.type === 'video' &&
    playhead >= clip.start &&
    playhead < (clip.start + clip.duration)
  );

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[360px] aspect-[9/16] bg-black rounded-lg shadow-lg overflow-hidden flex flex-col mx-auto relative"
      onClick={() => onSelectClip(null)} // Deselect when clicking background
    >
      <div className="w-full h-full">
        {activeVideoClip && activeVideoClip.src && (
          <video
            key={activeVideoClip.src}
            src={activeVideoClip.src}
            className="w-full h-full object-contain"
            autoPlay={false} // Manage playback via state
            muted
          />
        )}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {visibleTextClips.map(clip => (
          <DraggableResizableText
            key={clip.id}
            clip={clip}
            containerRef={containerRef}
            onUpdateClip={onUpdateClip}
            isSelected={clip.id === selectedClipId}
            onSelectClip={() => onSelectClip(clip)}
          />
        ))}
      </div>
    </div>
  );
}
