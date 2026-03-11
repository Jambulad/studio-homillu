
'use server';
/**
 * @fileOverview An AI agent that generates descriptive texts for family member profiles or relationship summaries.
 *
 * - generateFamilyTreeDescription - A function that handles the description generation process.
 * - FamilyTreeDescriptionInput - The input type for the generateFamilyTreeDescription function.
 * - FamilyTreeDescriptionOutput - The return type for the generateFamilyTreeDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FamilyTreeDescriptionInputSchema = z.object({
  type: z.enum(['person', 'relationship']).describe('The type of entity to describe: "person" or "relationship".'),
  // Fields for a person
  personName: z.string().optional().describe('The name of the person, if type is "person".'),
  birthDate: z.string().optional().describe('The birth date of the person (e.g., "January 1, 1950"), if type is "person".'),
  deathDate: z.string().optional().describe('The death date of the person (e.g., "December 31, 2020"), if type is "person".'),
  photoDataUri: z.string().optional().describe("A photo of the person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  // Fields for a relationship
  person1Name: z.string().optional().describe('The name of the first person in the relationship, if type is "relationship".'),
  person2Name: z.string().optional().describe('The name of the second person in the relationship, if type is "relationship".'),
  relationshipType: z.string().optional().describe('The type of relationship (e.g., "parent-child", "spouse", "sibling"), if type is "relationship".'),
  relationshipStartDate: z.string().optional().describe('The start date of the relationship (e.g., "June 15, 1970"), if type is "relationship".'),
  relationshipEndDate: z.string().optional().describe('The end date of the relationship (e.g., "November 10, 2010"), if type is "relationship".'),
  // Common fields
  keyEvents: z.array(z.string()).optional().describe('A list of significant life events or relationship milestones.'),
  additionalDetails: z.string().optional().describe('Any additional descriptive details or context that should be included.')
});
export type FamilyTreeDescriptionInput = z.infer<typeof FamilyTreeDescriptionInputSchema>;

const FamilyTreeDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated descriptive text for the family member or relationship.'),
});
export type FamilyTreeDescriptionOutput = z.infer<typeof FamilyTreeDescriptionOutputSchema>;

export async function generateFamilyTreeDescription(input: FamilyTreeDescriptionInput): Promise<FamilyTreeDescriptionOutput> {
  return generateFamilyTreeDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFamilyTreeDescriptionPrompt',
  input: {schema: FamilyTreeDescriptionInputSchema},
  output: {schema: FamilyTreeDescriptionOutputSchema},
  prompt: `You are an AI assistant specialized in generating engaging and informative descriptive texts for family tree profiles.
Generate a concise and heartwarming description based on the provided details.

Entity Type: {{{type}}}

Details Provided:
- Name/Names: {{{personName}}} {{{person1Name}}} {{{person2Name}}}
- Event Dates: {{{birthDate}}} {{{deathDate}}} {{{relationshipStartDate}}} {{{relationshipEndDate}}}
- Type/Relationship: {{{relationshipType}}}
- Milestones: 
{{#each keyEvents}}- {{{this}}}
{{/each}}
- Additional Context: {{{additionalDetails}}}

Instructions:
1. If the entity is a "person", write a warm personal biography.
2. If the entity is a "relationship", write a summary of their shared journey.
3. Keep it respectful and suitable for a family heritage record.`
});

const generateFamilyTreeDescriptionFlow = ai.defineFlow(
  {
    name: 'generateFamilyTreeDescriptionFlow',
    inputSchema: FamilyTreeDescriptionInputSchema,
    outputSchema: FamilyTreeDescriptionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
