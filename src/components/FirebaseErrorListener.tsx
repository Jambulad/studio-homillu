'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { sendErrorReport } from '@/ai/flows/send-error-report';

export function FirebaseErrorListener() {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handlePermissionError = async (error: FirestorePermissionError) => {
      // Report to Owner via AI
      sendErrorReport({
        message: error.message,
        type: 'db',
        context: error.request,
        stack: error.stack
      });
      setError(error);
    };

    const handleSystemError = async (data: { message: string; stack?: string; context?: any; type?: any }) => {
      // Report to Owner via AI
      sendErrorReport({
        message: data.message,
        type: data.type || 'code',
        context: data.context,
        stack: data.stack
      });
      setError(new Error(data.message));
    };

    errorEmitter.on('permission-error', handlePermissionError);
    errorEmitter.on('system-error', handleSystemError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
      errorEmitter.off('system-error', handleSystemError);
    };
  }, []);

  if (error) {
    throw error;
  }

  return null;
}
