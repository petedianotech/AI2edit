export type Tool = 'select' | 'trim' | 'text' | 'effects' | 'ai';

export interface Clip {
  id: string;
  type: 'video' | 'audio' | 'text';
  name: string;
  start: number;
  duration: number;
  track: 'video' | 'audio1';
}
