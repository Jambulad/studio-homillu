'use server';
/**
 * @fileOverview An AI flow that formats and "sends" technical error reports to the owner.
 *
 * - sendErrorReport - A function that processes an error report.
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
  return sendErrorReportFlow(input);
}

const sendErrorReportFlow = ai.defineFlow(
  {
    name: 'sendErrorReportFlow',
    inputSchema: SendErrorReportInputSchema,
    outputSchema: SendErrorReportOutputSchema,
  },
  async (input) => {
    const { text } = await ai.generate({
      prompt: `You are a specialized system monitor for Dhileepudu's "HomIllu" application.
      An error has occurred in the application and we need to report it to him at dhileepudu@gmail.com.
      
      Error Details:
      - Type: ${input.type || 'Unknown'}
      - Message: ${input.message}
      - Context: ${JSON.stringify(input.context || {})}
      
      Write a clear, structured technical alert email. 
      The tone should be professional and urgent. 
      Summarize what happened, why it might have happened, and what Dhileepudu should check.
      Keep it concise.`,
    });

    const reportPreview = text || "Error report generated.";
    
    // Log for the "Owner" (Simulated email delivery)
    console.log(`[ERROR REPORT ROUTED TO dhileepudu@gmail.com]:\n${reportPreview}`);
    if (input.stack) {
      console.log(`[STACK TRACE]:\n${input.stack}`);
    }

    return {
      success: true,
      reportPreview,
    };
  }
);
