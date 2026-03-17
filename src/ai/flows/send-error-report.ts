
'use server';
/**
 * @fileOverview An AI flow that formats and reports technical errors to the owner via Resend.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const hasAiKey = !!(process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY);
    
    if (!hasAiKey) {
      console.log(`[SYSTEM ERROR LOGGED]: ${input.message} (Type: ${input.type})`);
      return { success: true, reportPreview: "Error logged to console." };
    }

    const result = await sendErrorReportFlow(input);

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'HomIllu Monitor <onboarding@resend.dev>',
        to: 'dhileepudu@gmail.com',
        subject: `[HomIllu ALERT] Technical Error: ${input.type || 'Unknown'}`,
        text: `Error Message: ${input.message}\n\nAI Diagnostic: ${result.reportPreview}\n\nStack Trace: ${input.stack || 'N/A'}\n\nContext: ${JSON.stringify(input.context || {})}`,
      });
    }

    return result;
  } catch (e) {
    console.error("Critical: Error Reporting Flow Failed:", e);
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
    
    console.log(`[SYSTEM ALERT]: Routing error report to dhileepudu@gmail.com`);

    return {
      success: true,
      reportPreview,
    };
  }
);
