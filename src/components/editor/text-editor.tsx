'use client';
import { useState, useEffect } from 'react';
import type { Clip } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Check, Type, Palette, CaseSensitive, AlignLeft, AlignCenter, AlignRight, Pipette } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ColorPicker from './color-picker';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

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
        
        // Initialize shadow if it doesn't exist
        if (clip.type === 'text' && !clip.textShadow) {
            handleUpdate({
                textShadow: {
                    color: '#000000',
                    blur: 4,
                    offsetX: 2,
                    offsetY: 2,
                }
            })
        }
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

    const renderStyleTab = () => {
        const shadowEnabled = !!clip.textShadow;
        const outlineEnabled = !!clip.textOutline;
        
        const handleShadowPropertyChange = (prop: string, value: any) => {
            handleUpdate({ textShadow: { ...clip.textShadow!, [prop]: value } });
        };

        const handleOutlinePropertyChange = (prop: string, value: any) => {
            handleUpdate({ textOutline: { ...clip.textOutline!, [prop]: value } });
        };
        
        return (
            <div className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                    <Label htmlFor="shadow-switch" className="text-sm text-gray-400">Text Shadow</Label>
                    <Switch
                        id="shadow-switch"
                        checked={shadowEnabled}
                        onCheckedChange={(checked) => handleUpdate({
                            textShadow: checked ? { color: '#000000', blur: 4, offsetX: 2, offsetY: 2 } : undefined
                        })}
                    />
                </div>
                {shadowEnabled && clip.textShadow && (
                    <div className="space-y-4 pl-4 border-l-2 border-gray-800">
                        <div>
                            <Label className="text-sm text-gray-400">Shadow Color</Label>
                             <ColorPicker
                                selectedColor={clip.textShadow.color}
                                onColorChange={(color) => handleShadowPropertyChange('color', color)}
                            />
                        </div>
                        <div className="space-y-4">
                             <Label className="text-sm text-gray-400">Blur</Label>
                             <div className="flex items-center gap-4">
                                <Slider
                                    min={0} max={20} step={1}
                                    value={[clip.textShadow.blur]}
                                    onValueChange={(v) => handleShadowPropertyChange('blur', v[0])}
                                />
                                <span className="text-sm w-8">{clip.textShadow.blur}</span>
                             </div>
                        </div>
                        <div className="space-y-4">
                             <Label className="text-sm text-gray-400">Offset X</Label>
                             <div className="flex items-center gap-4">
                                <Slider
                                    min={-20} max={20} step={1}
                                    value={[clip.textShadow.offsetX]}
                                    onValueChange={(v) => handleShadowPropertyChange('offsetX', v[0])}
                                />
                                <span className="text-sm w-8">{clip.textShadow.offsetX}</span>
                             </div>
                        </div>
                        <div className="space-y-4">
                             <Label className="text-sm text-gray-400">Offset Y</Label>
                             <div className="flex items-center gap-4">
                                <Slider
                                    min={-20} max={20} step={1}
                                    value={[clip.textShadow.offsetY]}
                                    onValueChange={(v) => handleShadowPropertyChange('offsetY', v[0])}
                                />
                                <span className="text-sm w-8">{clip.textShadow.offsetY}</span>
                             </div>
                        </div>
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <Label htmlFor="outline-switch" className="text-sm text-gray-400">Text Outline</Label>
                    <Switch
                        id="outline-switch"
                        checked={outlineEnabled}
                        onCheckedChange={(checked) => handleUpdate({
                            textOutline: checked ? { color: '#000000', width: 2 } : undefined
                        })}
                    />
                </div>
                 {outlineEnabled && clip.textOutline && (
                    <div className="space-y-4 pl-4 border-l-2 border-gray-800">
                        <div>
                            <Label className="text-sm text-gray-400">Outline Color</Label>
                             <ColorPicker
                                selectedColor={clip.textOutline.color}
                                onColorChange={(color) => handleOutlinePropertyChange('color', color)}
                            />
                        </div>
                        <div className="space-y-4">
                             <Label className="text-sm text-gray-400">Width</Label>
                             <div className="flex items-center gap-4">
                                <Slider
                                    min={0} max={10} step={1}
                                    value={[clip.textOutline.width]}
                                    onValueChange={(v) => handleOutlinePropertyChange('width', v[0])}
                                />
                                <span className="text-sm w-8">{clip.textOutline.width}</span>
                             </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

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
                    <Button variant={activeTab === 'style' ? 'secondary' : 'ghost'} size="icon" onClick={() => setActiveTab('style')}><Pipette /></Button>
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
                        <TabsTrigger value="style">Style</TabsTrigger>
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
                    <TabsContent value="style" forceMount>
                        {renderStyleTab()}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
