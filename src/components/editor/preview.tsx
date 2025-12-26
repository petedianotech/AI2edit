'use client';

import { useRef, useEffect } from 'react';
import type { Clip } from '@/lib/types';
import DraggableResizableText from './draggable-resizable-text';

interface PreviewProps {
  clips: Clip[];
  playhead: number;
  isPlaying: boolean;
  onUpdateClip: (clip: Clip) => void;
  selectedClipId?: string | null;
  onSelectClip: (clip: Clip | null) => void;
}

export default function Preview({ clips, playhead, isPlaying, onUpdateClip, selectedClipId, onSelectClip }: PreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
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

  useEffect(() => {
    if (videoRef.current && activeVideoClip) {
      if (isPlaying) {
        videoRef.current.play().catch(e => console.error("Playback error:", e));
      } else {
        videoRef.current.pause();
      }
      const videoTime = playhead - activeVideoClip.start;
      if (Math.abs(videoRef.current.currentTime - videoTime) > 0.1) {
          videoRef.current.currentTime = videoTime;
      }
    }
  }, [isPlaying, playhead, activeVideoClip]);


  return (
    <div
      ref={containerRef}
      className="w-full max-w-[360px] aspect-[9/16] bg-black rounded-lg shadow-lg overflow-hidden flex flex-col mx-auto relative"
      onClick={() => onSelectClip(null)} // Deselect when clicking background
    >
      <div className="w-full h-full">
        {activeVideoClip && activeVideoClip.src && (
          <video
            ref={videoRef}
            key={activeVideoClip.id}
            src={activeVideoClip.src}
            className="w-full h-full object-contain"
            muted
            playsInline
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
