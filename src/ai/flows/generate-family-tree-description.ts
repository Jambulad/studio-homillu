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
  prompt: `You are an AI assistant specialized in generating engaging and informative descriptive texts for family tree profiles.\nGenerate a concise and heartwarming description based on the provided details.\n\n{{#if (eq type 'person')}}\n  Generate a profile description for a person.\n\n  Name: {{{personName}}}\n  {{#if birthDate}}Birth Date: {{{birthDate}}}{{/if}}\n  {{#if deathDate}}Death Date: {{{deathDate}}}{{/if}}\n  {{#if photoDataUri}}Photo: {{media url=photoDataUri}}{{/if}}\n  {{#if keyEvents}}Key Life Events:\n  {{#each keyEvents}}- {{{this}}}\n  {{/each}}{{/if}}\n  {{#if additionalDetails}}Additional Details: {{{additionalDetails}}}{{/if}}\n\n{{else if (eq type 'relationship')}}\n  Generate a description for a relationship between two people.\n\n  People: {{{person1Name}}} and {{{person2Name}}}\n  Relationship Type: {{{relationshipType}}}\n  {{#if relationshipStartDate}}Start Date: {{{relationshipStartDate}}}{{/if}}\n  {{#if relationshipEndDate}}End Date: {{{relationshipEndDate}}}{{/if}}\n  {{#if keyEvents}}Key Relationship Milestones:\n  {{#each keyEvents}}- {{{this}}}\n  {{/each}}{{/if}}\n  {{#if additionalDetails}}Additional Details: {{{additionalDetails}}}{{/if}}\n{{/if}}\n\nEnsure the description is warm, respectful, and highlights significant aspects, suitable for a family tree.\n`
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
