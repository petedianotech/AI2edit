'use client';

import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import type { Clip } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { exportVideo } from '@/lib/ffmpeg';
import { Progress } from '../ui/progress';
import { Logo } from '../icons/logo';
import { SidebarTrigger } from '../ui/sidebar';

interface HeaderProps {
  clips?: Clip[]; // Make clips optional
}

export default function Header({ clips = [] }: HeaderProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleExport = async () => {
    if (clips.length === 0) {
      toast({
        title: 'Cannot export empty video',
        description: 'Please add some clips to the timeline first.',
        variant: 'destructive',
      });
      return;
    }
    setIsExporting(true);
    setExportProgress(0);
    try {
      const videoBlob = await exportVideo(clips, (progress) => {
        setExportProgress(progress);
      });
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `motionspeak-export-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: 'Export complete!',
        description: 'Your video has been downloaded.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Export failed',
        description: 'There was an error while exporting your video.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };


  return (
    <header className="shrink-0 bg-card border-b">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <h1 className="font-semibold text-lg">MotionSpeak</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Button onClick={handleExport} disabled={isExporting} className="font-semibold">
              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2" />}
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
            {isExporting && (
              <div className="absolute bottom-[-10px] left-0 right-0 h-1">
                 <Progress value={exportProgress * 100} className="h-1" />
              </div>
            )}
          </div>
          <SidebarTrigger side="right" />
        </div>
      </div>
    </header>
  );
}
