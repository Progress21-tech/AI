import Link from 'next/link';
import { ArrowRight, ShieldCheck, Clock, BrainCircuit, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between selection:bg-black selection:text-white">
      {/* Header Bar */}
      <header className="w-full max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-extrabold text-sm tracking-tighter shadow-sm">
            AGY
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">AI Business Discovery</h1>
            <p className="text-xs text-subtle font-mono">Probetech Operations Agent</p>
          </div>
        </div>

        <Link
          href="/sign-in"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-xs font-medium hover:opacity-90 transition-opacity"
        >
          <span>Sign in</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Hero Content (PRD Section 4 Migration) */}
      <main className="w-full max-w-4xl mx-auto px-6 py-12 flex flex-col items-center text-center gap-8 my-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-borderDark text-xs font-mono text-subtle">
          <Sparkles className="w-3.5 h-3.5 text-black" />
          <span>Realtime Adaptive Agent Runtime — v1.0</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-black max-w-3xl leading-[1.15]">
          Understand your business operations before building software.
        </h1>

        <p className="text-base sm:text-lg text-subtle max-w-2xl font-normal leading-relaxed">
          &ldquo;Let&apos;s understand how your business actually works. I&apos;ll ask one question at a time and adapt the interview based on your answers.&rdquo;
        </p>

        {/* Start CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm mt-2">
          <Link
            href="/sign-up"
            className="w-full py-4 rounded-2xl bg-black text-white text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/5"
          >
            <span>Create your account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Key Details Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mt-8 text-left">
          <div className="p-5 rounded-2xl bg-surface border border-borderDark flex flex-col gap-2">
            <div className="flex items-center gap-2 text-black font-bold text-xs uppercase tracking-wider font-mono">
              <Clock className="w-4 h-4 text-black" />
              <span>10–15 Minutes</span>
            </div>
            <p className="text-xs text-subtle leading-relaxed">
              One-question-at-a-time conversation with adaptive time budget.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-borderDark flex flex-col gap-2">
            <div className="flex items-center gap-2 text-black font-bold text-xs uppercase tracking-wider font-mono">
              <BrainCircuit className="w-4 h-4 text-black" />
              <span>AI Agent Runtime</span>
            </div>
            <p className="text-xs text-subtle leading-relaxed">
              AI reasoning engine dictating phase, objective & time mode.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-borderDark flex flex-col gap-2">
            <div className="flex items-center gap-2 text-black font-bold text-xs uppercase tracking-wider font-mono">
              <ShieldCheck className="w-4 h-4 text-black" />
              <span>Strict Privacy</span>
            </div>
            <p className="text-xs text-subtle leading-relaxed">
              No passwords, tax IDs, or sensitive client data requested.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-8 text-center text-xs text-subtle font-mono border-t border-borderDark">
        AI Business Discovery Agent &bull; Powered by Probetech AI Engine
      </footer>
    </div>
  );
}
