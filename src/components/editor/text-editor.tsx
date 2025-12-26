'use client';
import { useState, useEffect } from 'react';
import type { Clip } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Check, Type, Palette, AlignLeft, Keyboard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ColorPicker from './color-picker';

const fontFamilies = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Lobster', value: 'Lobster, cursive' },
    { name: 'Courier Prime', value: '"Courier Prime", monospace' },
];

interface TextEditorProps {
    clip: Clip;
    onUpdateClip: (clip: Clip) => void;
    onClose: (save: boolean) => void;
}

export default function TextEditor({ clip, onUpdateClip, onClose }: TextEditorProps) {
    const [localClip, setLocalClip] = useState<Clip>(clip);

    useEffect(() => {
        setLocalClip(clip);
    }, [clip]);

    const handleUpdate = (props: Partial<Clip>) => {
        const updatedClip = { ...localClip, ...props };
        setLocalClip(updatedClip);
    };

    const handleSave = () => {
        onUpdateClip(localClip);
        onClose(true);
    };

    const handleCancel = () => {
        // Revert changes by not calling onUpdateClip
        onClose(false);
    };

    const renderTextTab = () => (
        <div className="p-4 space-y-4">
            <Textarea 
                value={localClip.text}
                onChange={(e) => handleUpdate({ text: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white text-lg focus:ring-primary"
                rows={3}
            />
             <div className="text-sm text-gray-400">Color</div>
             <ColorPicker
                selectedColor={localClip.color || '#FFFFFF'}
                onColorChange={(color) => handleUpdate({ color })}
            />
        </div>
    );

    const renderFontTab = () => (
        <div className="p-4 space-y-4">
            <div className="text-sm text-gray-400 mb-2">Select Font</div>
            <div className="flex flex-wrap gap-2">
                {fontFamilies.map(font => (
                    <Button 
                        key={font.value}
                        variant={localClip.fontFamily === font.value ? 'secondary' : 'ghost'}
                        onClick={() => handleUpdate({ fontFamily: font.value })}
                        style={{fontFamily: font.value}}
                        className="flex-grow"
                    >
                        {font.name}
                    </Button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <header className="flex items-center justify-between p-2 border-b border-gray-800">
                <Button variant="ghost" size="icon" onClick={handleCancel}>
                    <X />
                </Button>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon"><Keyboard/></Button>
                    <Button variant="ghost" size="icon"><Palette /></Button>
                    <Button variant="ghost" size="icon"><Type /></Button>
                    <Button variant="ghost" size="icon"><AlignLeft /></Button>
                </div>
                <Button variant="ghost" size="icon" onClick={handleSave}>
                    <Check />
                </Button>
            </header>
            
            <div className="flex-1 overflow-y-auto">
                <Tabs defaultValue="text" className="w-full">
                    <TabsList className="w-full justify-start rounded-none bg-black px-4 border-b border-gray-800">
                        <TabsTrigger value="text" className="text-xs px-2">TEXT</TabsTrigger>
                        <TabsTrigger value="border" className="text-xs px-2">BORDER</TabsTrigger>
                        <TabsTrigger value="shadow" className="text-xs px-2">SHADOW</TabsTrigger>
                        <TabsTrigger value="glow" className="text-xs px-2">GLOW</TabsTrigger>
                        <TabsTrigger value="label" className="text-xs px-2">LABEL</TabsTrigger>
                        <TabsTrigger value="opacity" className="text-xs px-2">OPACITY</TabsTrigger>
                    </TabsList>
                    <TabsContent value="text">
                        {renderTextTab()}
                    </TabsContent>
                    <TabsContent value="font">
                        {renderFontTab()}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
