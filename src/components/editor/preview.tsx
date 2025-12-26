'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Play, Pause, FastForward, Rewind, Volume2, Maximize } from 'lucide-react';
import type { Clip } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

interface PreviewProps {
    clips: Clip[];
    playhead: number;
}

const alignmentClasses = {
    left: 'items-center justify-start text-left',
    center: 'items-center justify-center text-center',
    right: 'items-center justify-end text-right',
}

export default function Preview({ clips, playhead }: PreviewProps) {
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
    <div className="w-full max-w-[360px] aspect-[9/16] bg-black rounded-lg shadow-lg overflow-hidden flex flex-col mx-auto">
      <div className="flex-1 relative bg-black">
        {activeVideoClip && activeVideoClip.src && (
          <video
            key={activeVideoClip.src}
            src={activeVideoClip.src}
            className="w-full h-full object-contain"
            autoPlay={false} // Manage playback via state
            muted
          />
        )}
        <div className="absolute inset-0 pointer-events-none">
            {visibleTextClips.map(clip => (
                <div 
                    key={clip.id}
                    className={cn(
                        "absolute inset-x-4 h-full flex p-4",
                        alignmentClasses[clip.textAlign || 'center']
                    )}
                    style={{
                        fontFamily: clip.fontFamily,
                        fontSize: `${clip.fontSize}px`,
                        color: clip.color,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                    }}
                >
                    <div className="w-full">{clip.text}</div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
