'use client';

export function Header({ questionNumber, totalQuestions }: { questionNumber: number; totalQuestions: number }) {
  const progress = Math.min(100, Math.round(((questionNumber - 1) / totalQuestions) * 100));
  return <header className="mx-auto w-full max-w-2xl px-5 py-6 sm:px-6"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold">Business discovery</p><p className="mt-1 text-sm text-subtle">A short set of questions about your business.</p></div><p className="shrink-0 text-sm font-medium">Question {Math.min(questionNumber, totalQuestions)} of {totalQuestions}</p></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-[#eceef1]"><div className="h-full rounded-full bg-black transition-all" style={{ width: `${progress}%` }} /></div></header>;
}
