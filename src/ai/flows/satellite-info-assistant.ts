'use server';

/**
 * @fileOverview Provides an AI assistant to summarize satellite information.
 *
 * - getSatelliteInfo - A function that retrieves satellite information.
 * - SatelliteInfoInput - The input type for the getSatelliteInfo function.
 * - SatelliteInfoOutput - The return type for the getSatelliteInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SatelliteInfoInputSchema = z.object({
  satelliteName: z.string().describe('The name of the satellite to get information about.'),
});
export type SatelliteInfoInput = z.infer<typeof SatelliteInfoInputSchema>;

const SatelliteInfoOutputSchema = z.object({
  summary: z.string().describe('A summary of the satellite, including its purposes, owner, and other relevant information.'),
});
export type SatelliteInfoOutput = z.infer<typeof SatelliteInfoOutputSchema>;

export async function getSatelliteInfo(input: SatelliteInfoInput): Promise<SatelliteInfoOutput> {
  return satelliteInfoFlow(input);
}

const satelliteInfoPrompt = ai.definePrompt({
  name: 'satelliteInfoPrompt',
  input: {schema: SatelliteInfoInputSchema},
  output: {schema: SatelliteInfoOutputSchema},
  prompt: `You are a satellite expert.  Summarize the following satellite, including its purposes, owner, and other relevant information:\n\nSatellite Name: {{{satelliteName}}}`,
});

const satelliteInfoFlow = ai.defineFlow(
  {
    name: 'satelliteInfoFlow',
    inputSchema: SatelliteInfoInputSchema,
    outputSchema: SatelliteInfoOutputSchema,
  },
  async input => {
    const {output} = await satelliteInfoPrompt(input);
    return output!;
  }
);
