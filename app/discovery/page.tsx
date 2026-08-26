'use client';

import { useRouter } from 'next/navigation';
import { useInterview } from '@/lib/hooks/useInterview';
import { CompanyIdentityStep } from '@/components/interview/CompanyIdentityStep';

export default function DiscoveryStartPage() {
  const router = useRouter();
  const { startNewInterview, isLoading } = useInterview();

  const handleSubmit = async (companyInfo: {
    companyName: string;
    respondentName?: string;
    respondentRole?: string;
    respondentEmail?: string;
    respondentPhone?: string;
  }) => {
    const newId = await startNewInterview(companyInfo);
    if (newId) {
      router.push(`/discovery/${newId}`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-center p-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-subtle">Business discovery</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">A few quick questions about your business.</h1>
          <p className="mt-3 text-sm leading-6 text-subtle">This short interview takes about 10 minutes. No account or sign-in is required.</p>
        </div>
        <CompanyIdentityStep onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
