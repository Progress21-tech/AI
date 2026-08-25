'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useInterview } from '@/lib/hooks/useInterview';
import { Sparkles } from 'lucide-react';

export default function DiscoveryStartPage() {
  const router = useRouter();
  const { startNewInterview } = useInterview();

  useEffect(() => {
    let mounted = true;
    async function init() {
      const newId = await startNewInterview();
      if (mounted && newId) {
        router.push(`/discovery/${newId}`);
      }
    }
    init();
    return () => { mounted = false; };
  }, [startNewInterview, router]);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-6 text-center">
      <div className="flex flex-col items-center gap-4 max-w-sm">
        <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-black">
          Initializing AI Business Discovery Agent...
        </h2>
        <p className="text-xs font-mono text-subtle">
          Connecting agent runtime and generating dynamic first question...
        </p>
      </div>
    </div>
  );
}
