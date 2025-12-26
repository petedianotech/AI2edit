'use server';
/**
 * @fileOverview Generates captions from a video's audio.
 *
 * - generateCaptionsFromVideo - A function that handles the caption generation process.
 * - GenerateCaptionsFromVideoInput - The input type for the generateCaptionsFromVideo function.
 * - GenerateCaptionsFromVideoOutput - The return type for the generateCaptionsFromVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCaptionsFromVideoInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateCaptionsFromVideoInput = z.infer<typeof GenerateCaptionsFromVideoInputSchema>;

const GenerateCaptionsFromVideoOutputSchema = z.object({
  captions: z.string().describe('The generated captions for the video.'),
});
export type GenerateCaptionsFromVideoOutput = z.infer<typeof GenerateCaptionsFromVideoOutputSchema>;

export async function generateCaptionsFromVideo(input: GenerateCaptionsFromVideoInput): Promise<GenerateCaptionsFromVideoOutput> {
  return generateCaptionsFromVideoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCaptionsFromVideoPrompt',
  input: {schema: GenerateCaptionsFromVideoInputSchema},
  output: {schema: GenerateCaptionsFromVideoOutputSchema},
  prompt: `You are an expert caption generator. You will generate captions from the video.

Use the following as the primary source of information about the video.

Video: {{media url=videoDataUri}}

Captions:`, // The model will generate the captions here.
});

const generateCaptionsFromVideoFlow = ai.defineFlow(
  {
    name: 'generateCaptionsFromVideoFlow',
    inputSchema: GenerateCaptionsFromVideoInputSchema,
    outputSchema: GenerateCaptionsFromVideoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
