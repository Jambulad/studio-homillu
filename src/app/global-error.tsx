'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Emit a system error so our reporter catches it
    errorEmitter.emit('system-error', {
      message: error.message,
      stack: error.stack,
      type: 'code',
      context: { digest: error.digest }
    });
  }, [error]);

  return (
    <html>
      <body className="flex items-center justify-center min-h-screen bg-background p-6">
        <Card className="max-w-md w-full shadow-2xl border-destructive/20 bg-destructive/5 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tight">System Failure</CardTitle>
            <CardDescription className="font-medium">
              A critical error occurred. The incident has been reported to Dhileepudu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-background/80 p-4 rounded-xl border border-destructive/10">
              <p className="text-xs font-mono text-destructive break-all overflow-auto max-h-32">
                {error.message || "An unexpected error disrupted the hub."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => reset()} 
                variant="outline" 
                className="gap-2 font-bold uppercase text-[10px] tracking-widest border-destructive/20"
              >
                <RefreshCcw className="h-3 w-3" />
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.href = '/'} 
                className="gap-2 font-bold uppercase text-[10px] tracking-widest bg-destructive hover:bg-destructive/90"
              >
                <Home className="h-3 w-3" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </body>
    </html>
  );
}
