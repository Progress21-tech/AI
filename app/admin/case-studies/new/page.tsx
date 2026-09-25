import { AdminShell } from '@/components/admin/AdminShell';
import { CaseStudyEditor } from '@/components/admin/CaseStudyEditor';
import { requireAdmin } from '@/lib/auth/server';

export default async function NewCaseStudyPage({ searchParams }: { searchParams: { error?: string } }) {
  await requireAdmin();
  return <AdminShell title="New case study" description="Create a draft or a client-approved public case study."><CaseStudyEditor error={searchParams.error ?? ''} /></AdminShell>;
}
