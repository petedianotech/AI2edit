export type Tool = 'select' | 'split' | 'text' | 'effects' | 'ai' | 'upload';

export interface Clip {
  id: string;
  type: 'video' | 'audio' | 'text';
  name: string;
  start: number;
  duration: number;
  track: 'video' | 'audio1';
  src?: string; // Path to the media file for video/audio
  // Video/Audio specific
  volume?: number;
  // Text specific
  text?: string;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  position?: { x: number; y: number };
}
