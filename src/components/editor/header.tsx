'use client';

import { Logo } from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download } from 'lucide-react';

export default function Header() {
  return (
    <header className="shrink-0">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold tracking-tighter text-foreground">
            MotionSpeak
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">Help</Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      <Separator />
    </header>
  );
}
