'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Play, Pause, FastForward, Rewind, Volume2, Maximize } from 'lucide-react';
import type { Clip } from '@/lib/types';

interface PreviewProps {
    clips: Clip[];
    playhead: number;
}

export default function Preview({ clips, playhead }: PreviewProps) {
  const previewImage = PlaceHolderImages.find(img => img.id === 'video-preview');

  const visibleTextClips = clips.filter(clip => 
    clip.type === 'text' && 
    playhead >= clip.start && 
    playhead < (clip.start + clip.duration)
  );

  const videoClip = clips.find(clip => 
    clip.type === 'video' && 
    playhead >= clip.start && 
    playhead < (clip.start + clip.duration)
  );

  return (
    <div className="w-full max-w-[360px] aspect-[9/16] bg-card rounded-lg shadow-lg overflow-hidden flex flex-col mx-auto">
      <div className="flex-1 relative bg-black">
        {previewImage && (
          <Image
            src={previewImage.imageUrl}
            alt={previewImage.description}
            fill
            className="object-cover"
            data-ai-hint={previewImage.imageHint}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center p-4">
            {visibleTextClips.map(clip => (
                <div 
                    key={clip.id}
                    style={{
                        fontFamily: clip.fontFamily,
                        fontSize: `${clip.fontSize}px`,
                        color: clip.color,
                        // Basic text shadow for better visibility
                        textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
                    }}
                >
                    {clip.text}
                </div>
            ))}
        </div>
      </div>
      <div className="bg-secondary/30 p-2 border-t">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Rewind className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="bg-primary/20">
              <Play className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon">
              <FastForward className="h-5 w-5" />
            </Button>
            <div className="text-sm text-muted-foreground font-mono">00:00 / 00:12</div>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon">
              <Volume2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
