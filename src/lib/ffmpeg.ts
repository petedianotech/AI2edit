'use client';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import type { Clip } from './types';

let ffmpeg: FFmpeg | null;

const FONT_MAP: Record<string, string> = {
    'Inter, sans-serif': '/Inter-Regular.ttf',
    'Roboto, sans-serif': '/Roboto-Regular.ttf',
    'Lobster, cursive': '/Lobster-Regular.ttf',
    '"Courier Prime", monospace': '/CourierPrime-Regular.ttf',
};

async function getFFmpeg(): Promise<FFmpeg> {
    if (ffmpeg) {
        return ffmpeg;
    }

    ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

    ffmpeg.on('log', ({ message }) => {
        console.log(message);
    });

    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    // Load fonts
    for (const font of Object.values(FONT_MAP)) {
        await ffmpeg.writeFile(font, await fetchFile(`https://fonts.gstatic.com/s/${font.split('/')[1].split('.')[0].toLowerCase().replace('-', '')}/v13/${font.split('/')[1]}`));
    }

    return ffmpeg;
}

function getSafeFilename(text: string): string {
    return text.replace(/[^a-zA-Z0-9-_\.]/g, '_').substring(0, 50);
}


export async function exportVideo(clips: Clip[], onProgress: (progress: number) => void): Promise<Blob> {
    const ffmpeg = await getFFmpeg();
    onProgress(0.05);

    const videoClips = clips.filter(c => c.type === 'video');
    const audioClips = clips.filter(c => c.type === 'audio');
    const textClips = clips.filter(c => c.type === 'text');
    const totalDuration = Math.max(...clips.map(c => c.start + c.duration), 0);

    const inputFiles: string[] = [];
    const videoInputs: string[] = [];
    const audioInputs: string[] = [];
    const filterComplex: string[] = [];

    // Write all media files to ffmpeg's virtual file system
    for (const clip of [...videoClips, ...audioClips]) {
        if (clip.src) {
            const safeName = getSafeFilename(`${clip.id}-${clip.name}`);
            await ffmpeg.writeFile(safeName, await fetchFile(clip.src));
            inputFiles.push('-i', safeName);
            if (clip.type === 'video') videoInputs.push(`[${videoInputs.length}:v]`);
            if (clip.type === 'audio') audioInputs.push(`[${audioInputs.length + videoInputs.length}:a]`);
        }
    }

    // Prepare video filters
    let lastVideoOutput = 'base';
    filterComplex.push(`color=s=1080x1920:c=black:d=${totalDuration}[base]`);

    videoClips.forEach((clip, index) => {
        const nextOutput = `v${index}`;
        filterComplex.push(`[${lastVideoOutput}][${index}:v]overlay=enable='between(t,${clip.start},${clip.start + clip.duration})'[${nextOutput}]`);
        lastVideoOutput = nextOutput;
    });

    // Prepare text filters
    textClips.forEach((clip, index) => {
        if (clip.text && clip.fontFamily && clip.fontSize && clip.color) {
            const nextOutput = `vt${index}`;
            const fontfile = FONT_MAP[clip.fontFamily];
            // Escape special characters for ffmpeg
            const escapedText = clip.text.replace(/'/g, "'\\\\\\''").replace(/:/g, '\\\\:');

            filterComplex.push(`${lastVideoOutput}drawtext=text='${escapedText}':fontfile=${fontfile}:fontsize=${clip.fontSize}:fontcolor=${clip.color}:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,${clip.start},${clip.start + clip.duration})'[${nextOutput}]`);
            lastVideoOutput = nextOutput;
        }
    });


    // Prepare audio filters
    if (audioClips.length > 0) {
        const audioStreams = audioClips.map((clip, index) => {
            const streamId = `a${index}`;
            // Delay audio to match its start time in the timeline
            filterComplex.push(`[${videoClips.length + index}:a]adelay=${clip.start * 1000}|${clip.start * 1000}[${streamId}]`);
            return `[${streamId}]`;
        }).join('');
        
        filterComplex.push(`${audioStreams}amix=inputs=${audioClips.length}[aout]`);
    }

    const command = [
        ...inputFiles,
        '-filter_complex', filterComplex.join(';'),
        '-map', `[${lastVideoOutput}]`,
    ];

    if (audioClips.length > 0) {
        command.push('-map', '[aout]');
        command.push('-c:a', 'aac');
    }
    
    command.push('-c:v', 'libx264', '-preset', 'ultrafast', '-t', String(totalDuration), 'output.mp4');

    console.log('Running ffmpeg with command:', command.join(' '));

    ffmpeg.on('progress', ({ progress }) => {
        onProgress(progress);
    });

    await ffmpeg.exec(command);

    onProgress(1);

    const data = await ffmpeg.readFile('output.mp4');
    return new Blob([data], { type: 'video/mp4' });
}
