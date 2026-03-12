import { config } from 'dotenv';
config();

import '@/ai/flows/generate-family-tree-description.ts';
import '@/ai/flows/send-task-notification.ts';
import '@/ai/flows/send-family-invitation.ts';
import '@/ai/flows/send-contact-email.ts';
import '@/ai/flows/send-error-report.ts';
