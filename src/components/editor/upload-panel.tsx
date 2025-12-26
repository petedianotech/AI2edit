'use client';

import React, { useState } from 'react';
import type { Clip } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Upload, Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface UploadPanelProps {
  onAddClip: (clip: Clip) => void;
}


function fileToDataUri(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
}

function getMediaDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const media = document.createElement(file.type.startsWith('video') ? 'video' : 'audio');
        media.addEventListener('loadedmetadata', () => {
            resolve(media.duration);
            URL.revokeObjectURL(url);
        });
        media.addEventListener('error', (e) => {
            reject('Failed to load media metadata');
            URL.revokeObjectURL(url);
        })
        media.src = url;
    })
}


export default function UploadPanel({ onAddClip }: UploadPanelProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const isVideo = file.type.startsWith('video/');
      const [src, duration] = await Promise.all([
          fileToDataUri(file),
          getMediaDuration(file),
      ]);
      
      const newClip: Clip = {
        id: `${isVideo ? 'video' : 'audio'}-${Date.now()}`,
        type: isVideo ? 'video' : 'audio',
        name: file.name,
        start: 0,
        duration: duration,
        track: isVideo ? 'video' : 'audio1',
        src: src,
        volume: 1,
      };

      onAddClip(newClip);
      toast({
        title: 'Media added',
        description: `${file.name} has been added to the timeline.`,
      });
    } catch (error) {
      console.error('Error adding media:', error);
      toast({
        title: 'Upload failed',
        description: 'Could not process the selected file.',
        variant: 'destructive',
      });
    } finally {
        setUploading(false);
    }
  };
  
  const handleAddStock = (image: typeof PlaceHolderImages[0]) => {
      const newClip: Clip = {
          id: `video-${Date.now()}`,
          type: 'video',
          name: image.description,
          start: 0,
          duration: 10,
          track: 'video',
          src: image.imageUrl,
          volume: 0, // Stock images have no audio
      };
      onAddClip(newClip);
       toast({
        title: 'Stock footage added',
        description: `Added ${image.description} to timeline.`,
      });
  }


  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Upload Media
          </CardTitle>
          <CardDescription>Upload video or audio files to your project.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="media-file">Local File</Label>
            <Input id="media-file" type="file" accept="video/*,audio/*" onChange={handleFileChange} disabled={uploading} />
          </div>
          {uploading && <div className="flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</div>}
           <div className="space-y-2">
                <h4 className="font-semibold text-sm">Stock Footage</h4>
                <div className="grid grid-cols-2 gap-2">
                    {PlaceHolderImages.map(image => (
                        <button key={image.id} onClick={() => handleAddStock(image)} className="border rounded-md overflow-hidden aspect-video relative group">
                            <img src={image.imageUrl} alt={image.description} className="w-full h-full object-cover"/>
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs text-center p-1">{image.description}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
