'use client';
import { Rnd } from 'react-rnd';
import type { Clip } from '@/lib/types';

interface DraggableResizableTextProps {
    clip: Clip;
    containerRef: React.RefObject<HTMLDivElement>;
    onUpdateClip: (clip: Clip) => void;
    isSelected: boolean;
    onSelectClip: () => void;
}

export default function DraggableResizableText({
    clip,
    containerRef,
    onUpdateClip,
    isSelected,
    onSelectClip
}: DraggableResizableTextProps) {
    if (!containerRef.current) return null;

    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;

    const handleDragStop = (e: any, d: any) => {
        onUpdateClip({
            ...clip,
            position: {
                x: d.x / containerWidth,
                y: d.y / containerHeight,
            },
        });
    };

    const handleResizeStop = (e: any, direction: any, ref: any, delta: any, position: any) => {
        onUpdateClip({
            ...clip,
            fontSize: (clip.fontSize || 48) * (ref.offsetWidth / (ref.offsetWidth - delta.width)),
            position: {
                x: position.x / containerWidth,
                y: position.y / containerHeight,
            },
        });
    };

    return (
        <Rnd
            className={`flex items-center justify-center p-2 box-border pointer-events-auto ${isSelected ? 'border-2 border-dashed border-primary bg-primary/10' : 'border-transparent'}`}
            size={{
                width: 'auto',
                height: 'auto',
            }}
            position={{
                x: (clip.position?.x ?? 0.5) * containerWidth,
                y: (clip.position?.y ?? 0.5) * containerHeight
            }}
            onDragStart={onSelectClip}
            onDragStop={handleDragStop}
            onResizeStart={onSelectClip}
            onResizeStop={handleResizeStop}
            minWidth={50}
            minHeight={20}
            bounds="parent"
            cancel=".not-draggable"
        >
            <div
                style={{
                    fontFamily: clip.fontFamily,
                    fontSize: `${clip.fontSize}px`,
                    color: clip.color,
                    textAlign: clip.textAlign,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                    whiteSpace: 'nowrap'
                }}
            >
                {clip.text}
            </div>
        </Rnd>
    );
}
