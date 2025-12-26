'use client';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
    selectedColor: string;
    onColorChange: (color: string) => void;
}

const colors = [
    '#FFFFFF', '#E0E0E0', '#BDBDBD', '#757575', '#212121',
    '#FFCDD2', '#E57373', '#D32F2F', '#B71C1C',
    '#FFF9C4', '#FFF176', '#FBC02D', '#F57F17',
    '#FFCC80', '#FFB74D', '#FB8C00', '#E65100'
];

export default function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
    return (
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-2 pb-2">
                {/* Special picker buttons can be added here if needed */}
                {colors.map(color => (
                    <Button
                        key={color}
                        variant="ghost"
                        className={cn(
                            "w-8 h-8 rounded-full p-0 border-2",
                            selectedColor.toLowerCase() === color.toLowerCase() ? 'border-blue-500' : 'border-gray-600'
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => onColorChange(color)}
                    />
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}
