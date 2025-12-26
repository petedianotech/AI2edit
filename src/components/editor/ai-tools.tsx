'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Mic, Captions, Film, Loader2 } from 'lucide-react';

import { convertTextToSpeech } from '@/ai/flows/convert-text-to-speech';
import { generateCaptionsFromVideo } from '@/ai/flows/generate-captions-from-video';
import { suggestBroll } from '@/ai/flows/suggest-broll-from-video-transcription';
import type { Clip } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface AiToolsProps {
  onAddClip: (clip: Clip) => void;
}

export default function AiTools({ onAddClip }: AiToolsProps) {
  const { toast } = useToast();
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsText, setTtsText] = useState('Create professional videos in minutes with MotionSpeak. Our AI tools make editing simple and fun.');
  const [ttsAudio, setTtsAudio] = useState<string | null>(null);

  const [captionLoading, setCaptionLoading] = useState(false);
  const [captionFile, setCaptionFile] = useState<File | null>(null);
  const [captions, setCaptions] = useState('');

  const [brollLoading, setBrollLoading] = useState(false);
  const [brollPrompt, setBrollPrompt] = useState('A developer is building a new AI application on their laptop in a modern office.');
  const [brollSuggestions, setBrollSuggestions] = useState<string[]>([]);
  
  const handleTts = async () => {
    if (!ttsText) {
      toast({ title: 'Error', description: 'Please enter some text.', variant: 'destructive' });
      return;
    }
    setTtsLoading(true);
    setTtsAudio(null);
    try {
      const result = await convertTextToSpeech(ttsText);
      setTtsAudio(result.media);
      onAddClip({
        id: `tts-${Date.now()}`,
        type: 'audio',
        name: `TTS: ${ttsText.substring(0, 15)}...`,
        start: 0,
        duration: 5, // Placeholder duration
        track: 'audio1'
      });
      toast({ title: 'Success', description: 'Audio generated and added to timeline.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to generate audio.', variant: 'destructive' });
    } finally {
      setTtsLoading(false);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleCaptions = async () => {
    if (!captionFile) {
      toast({ title: 'Error', description: 'Please select a video file.', variant: 'destructive' });
      return;
    }
    setCaptionLoading(true);
    setCaptions('');
    try {
      const videoDataUri = await fileToDataUri(captionFile);
      const result = await generateCaptionsFromVideo({ videoDataUri });
      setCaptions(result.captions);
      toast({ title: 'Success', description: 'Captions generated.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to generate captions.', variant: 'destructive' });
    } finally {
      setCaptionLoading(false);
    }
  };
  
  const handleBroll = async () => {
    if (!brollPrompt) {
      toast({ title: 'Error', description: 'Please enter a prompt or transcription.', variant: 'destructive' });
      return;
    }
    setBrollLoading(true);
    setBrollSuggestions([]);
    try {
      const result = await suggestBroll({ videoTranscription: brollPrompt });
      setBrollSuggestions(result.suggestedBroll);
      toast({ title: 'Success', description: 'B-roll suggestions generated.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to generate B-roll suggestions.', variant: 'destructive' });
    } finally {
      setBrollLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-primary" />
                AI Tools
            </CardTitle>
            <CardDescription>Enhance your videos with generative AI.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="tts" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tts"><Mic className="w-4 h-4 mr-2" />TTS</TabsTrigger>
                <TabsTrigger value="caption"><Captions className="w-4 h-4 mr-2" />Captions</TabsTrigger>
                <TabsTrigger value="broll"><Film className="w-4 h-4 mr-2" />B-roll</TabsTrigger>
            </TabsList>

            <TabsContent value="tts" className="space-y-4 pt-4">
                <h4 className="font-semibold">Text-to-Speech</h4>
                <Textarea placeholder="Enter text for narration..." value={ttsText} onChange={(e) => setTtsText(e.target.value)} rows={5} />
                <Button onClick={handleTts} disabled={ttsLoading} className="w-full">
                {ttsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Audio
                </Button>
                {ttsAudio && <audio controls src={ttsAudio} className="w-full mt-4" />}
            </TabsContent>

            <TabsContent value="caption" className="space-y-4 pt-4">
                <h4 className="font-semibold">Auto Captions</h4>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="video-file">Video File</Label>
                    <Input id="video-file" type="file" accept="video/*" onChange={(e) => setCaptionFile(e.target.files?.[0] || null)} />
                </div>
                <Button onClick={handleCaptions} disabled={captionLoading} className="w-full">
                {captionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Captions
                </Button>
                {captions && <Textarea value={captions} readOnly rows={8} className="mt-4 bg-background" />}
            </TabsContent>

            <TabsContent value="broll" className="space-y-4 pt-4">
                <h4 className="font-semibold">Suggest B-roll</h4>
                <Textarea placeholder="Enter a script, transcription, or scene description..." value={brollPrompt} onChange={(e) => setBrollPrompt(e.target.value)} rows={5} />
                <Button onClick={handleBroll} disabled={brollLoading} className="w-full">
                {brollLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Suggestions
                </Button>
                {brollSuggestions.length > 0 && (
                <div className="mt-4 space-y-2">
                    <h5 className="font-semibold">Suggestions:</h5>
                    <ul className="list-disc list-inside bg-background rounded-md p-4 text-sm space-y-1">
                    {brollSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
                )}
            </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
