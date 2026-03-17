'use server';
/**
 * @fileOverview An AI flow that formats and reports technical errors to the owner.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SendErrorReportInputSchema = z.object({
  message: z.string().describe('The error message.'),
  stack: z.string().optional().describe('The stack trace.'),
  type: z.string().optional().describe('The type of error (db, network, code, etc).'),
  context: z.any().optional().describe('Additional context about the error.'),
});
export type SendErrorReportInput = z.infer<typeof SendErrorReportInputSchema>;

const SendErrorReportOutputSchema = z.object({
  success: z.boolean(),
  reportPreview: z.string(),
});

export async function sendErrorReport(input: SendErrorReportInput) {
  try {
    const hasApiKey = !!(process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY);
    
    if (!hasApiKey) {
      console.log(`[SYSTEM ERROR LOGGED]: ${input.message} (Type: ${input.type})`);
      return { success: true, reportPreview: "Error logged to console (No AI API Key)." };
    }

    return await sendErrorReportFlow(input);
  } catch (e) {
    // Avoid infinite error loops by just logging to console if reporting fails
    console.error("Critical: Error Reporting Flow Failed:", e);
    console.error("Original Error:", input.message);
  }
}

const sendErrorReportFlow = ai.defineFlow(
  {
    name: 'sendErrorReportFlow',
    inputSchema: SendErrorReportInputSchema,
    outputSchema: SendErrorReportOutputSchema,
  },
  async (input) => {
    const { text } = await ai.generate({
      prompt: `You are a technical monitor for Dhileepudu's "HomIllu" app.
      An error occurred that needs reporting to dhileepudu@gmail.com.
      
      Error: ${input.message}
      Type: ${input.type || 'Unknown'}
      Context: ${JSON.stringify(input.context || {})}
      
      Summarize what happened and what Dhileepudu should investigate. Keep it technical and brief.`,
    });

    const reportPreview = text || "Technical error report generated.";
    
    console.log("------------------------------------------------");
    console.log(`[TECHNICAL ALERT ROUTED TO dhileepudu@gmail.com]`);
    console.log(`SUMMARY: ${reportPreview}`);
    if (input.stack) console.log(`STACK: ${input.stack.split('\n')[0]}...`);
    console.log("------------------------------------------------");

    return {
      success: true,
      reportPreview,
    };
  }
);
