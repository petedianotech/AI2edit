'use server';
/**
 * @fileOverview Suggests suitable videos and B-roll based on the transcription of the user's main videos, or from their text prompt.
 *
 * - suggestBroll - A function that handles the B-roll suggestion process.
 * - SuggestBrollInput - The input type for the suggestBroll function.
 * - SuggestBrollOutput - The return type for the suggestBroll function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBrollInputSchema = z.object({
  videoTranscription: z.string().describe('The transcription of the main video.'),
  userPrompt: z.string().optional().describe('Optional user prompt to guide the B-roll suggestion.'),
});
export type SuggestBrollInput = z.infer<typeof SuggestBrollInputSchema>;

const SuggestBrollOutputSchema = z.object({
  suggestedBroll: z.array(z.string()).describe('A list of suggested video clips or B-roll descriptions.'),
});
export type SuggestBrollOutput = z.infer<typeof SuggestBrollOutputSchema>;

export async function suggestBroll(input: SuggestBrollInput): Promise<SuggestBrollOutput> {
  return suggestBrollFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBrollPrompt',
  input: {schema: SuggestBrollInputSchema},
  output: {schema: SuggestBrollOutputSchema},
  prompt: `You are an expert video editor. Given the following video transcription, suggest suitable B-roll footage to enhance the video.

Video Transcription: {{{videoTranscription}}}

{{#if userPrompt}}
User Prompt: {{{userPrompt}}}
{{/if}}

Please provide a list of suggested video clip descriptions or B-roll ideas that would complement the main video. Each suggestion should be concise and relevant to the content of the transcription and user prompt, and ideal for stock footage search.
`,
});

const suggestBrollFlow = ai.defineFlow(
  {
    name: 'suggestBrollFlow',
    inputSchema: SuggestBrollInputSchema,
    outputSchema: SuggestBrollOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
