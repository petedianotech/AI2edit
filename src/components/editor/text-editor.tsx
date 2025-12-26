'use client';
import { useState, useEffect } from 'react';
import type { Clip } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Check, Type, Palette, CaseSensitive, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ColorPicker from './color-picker';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';

const fontFamilies = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Lobster', value: 'Lobster, cursive' },
    { name: 'Courier Prime', value: '"Courier Prime", monospace' },
];

interface TextEditorProps {
    clip: Clip;
    onUpdateClip: (clip: Clip) => void;
    onClose: (save: boolean, originalClip?: Clip) => void;
}

export default function TextEditor({ clip, onUpdateClip, onClose }: TextEditorProps) {
    const [originalClip, setOriginalClip] = useState(clip);
    const [activeTab, setActiveTab] = useState('text');

    useEffect(() => {
        // Store the initial state of the clip when the editor opens
        setOriginalClip(clip);
    }, []); // Empty dependency array ensures this runs only once on mount


    const handleUpdate = (props: Partial<Clip>) => {
        onUpdateClip({ ...clip, ...props });
    };

    const handleSave = () => {
        onClose(true);
    };

    const handleCancel = () => {
        // Revert changes by passing the original clip back
        onClose(false, originalClip);
    };

    const renderTextTab = () => (
        <div className="p-4 space-y-4">
            <Textarea 
                value={clip.text}
                onChange={(e) => handleUpdate({ text: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white text-lg focus:ring-primary"
                rows={3}
            />
             <div className="text-sm text-gray-400">Color</div>
             <ColorPicker
                selectedColor={clip.color || '#FFFFFF'}
                onColorChange={(color) => handleUpdate({ color })}
            />
        </div>
    );

    const renderFontTab = () => (
        <div className="p-4 space-y-6">
            <div className="space-y-2">
                <div className="text-sm text-gray-400 mb-2">Select Font</div>
                <div className="grid grid-cols-2 gap-2">
                    {fontFamilies.map(font => (
                        <Button 
                            key={font.value}
                            variant={clip.fontFamily === font.value ? 'secondary' : 'ghost'}
                            onClick={() => handleUpdate({ fontFamily: font.value })}
                            style={{fontFamily: font.value}}
                            className="flex-grow"
                        >
                            {font.name}
                        </Button>
                    ))}
                </div>
            </div>
            <div className="space-y-4">
                <Label className="text-sm text-gray-400">Font Size</Label>
                <div className="flex items-center gap-4">
                    <CaseSensitive className="w-5 h-5" />
                    <Slider
                        min={12}
                        max={128}
                        step={2}
                        value={[clip.fontSize ?? 48]}
                        onValueChange={(value) => handleUpdate({ fontSize: value[0] })}
                    />
                    <span className="text-sm w-8">{clip.fontSize}</span>
                </div>
            </div>
        </div>
    );
    
    const renderAlignmentTab = () => (
        <div className="p-4 space-y-4">
             <div className="text-sm text-gray-400">Alignment</div>
             <div className="flex justify-around">
                <Button variant={clip.textAlign === 'left' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleUpdate({ textAlign: 'left' })}>
                    <AlignLeft />
                </Button>
                <Button variant={clip.textAlign === 'center' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleUpdate({ textAlign: 'center' })}>
                    <AlignCenter />
                </Button>
                <Button variant={clip.textAlign === 'right' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleUpdate({ textAlign: 'right' })}>
                    <AlignRight />
                </Button>
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
                    <Button variant={activeTab === 'text' ? 'secondary' : 'ghost'} size="icon" onClick={() => setActiveTab('text')}><Palette/></Button>
                    <Button variant={activeTab === 'font' ? 'secondary' : 'ghost'} size="icon" onClick={() => setActiveTab('font')}><Type /></Button>
                    <Button variant={activeTab === 'align' ? 'secondary' : 'ghost'} size="icon" onClick={() => setActiveTab('align')}><AlignLeft /></Button>
                </div>
                <Button variant="ghost" size="icon" onClick={handleSave}>
                    <Check />
                </Button>
            </header>
            
            <div className="flex-1 overflow-y-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="hidden">
                        <TabsTrigger value="text">Text</TabsTrigger>
                        <TabsTrigger value="font">Font</TabsTrigger>
                        <TabsTrigger value="align">Alignment</TabsTrigger>
                    </TabsList>
                    <TabsContent value="text" forceMount>
                        {renderTextTab()}
                    </TabsContent>
                    <TabsContent value="font" forceMount>
                        {renderFontTab()}
                    </TabsContent>
                    <TabsContent value="align" forceMount>
                        {renderAlignmentTab()}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
