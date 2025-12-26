import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-broll-from-video-transcription.ts';
import '@/ai/flows/convert-text-to-speech.ts';
import '@/ai/flows/generate-captions-from-video.ts';