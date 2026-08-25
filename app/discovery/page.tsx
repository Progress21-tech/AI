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
        <CompanyIdentityStep onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
