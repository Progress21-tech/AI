import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminShell, EmptyState, Info, SectionHeading, StatusBadge, formatDate } from '@/components/admin/AdminShell';
import { requireAdmin } from '@/lib/auth/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function AdminCompanyDetail({ params }: { params: { id: string } }) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  if (!supabase) notFound();
  const { data: company } = await supabase.from('companies').select('id,name,industry,website,size,created_at').eq('id', params.id).maybeSingle();
  if (!company) notFound();
  const { data: interviews } = await supabase.from('interviews').select('id,status,started_at,completed_at,respondent_name,respondent_role,respondent_email').eq('company_id', company.id).order('started_at', { ascending: false });
  const sessions = interviews ?? [];
  const ids = sessions.map((session: any) => session.id);
  const [{ data: questions }, { data: answers }] = await Promise.all([
    ids.length ? supabase.from('interview_questions').select('id,interview_id,question_text,question_type,sequence_number').in('interview_id', ids).order('sequence_number') : Promise.resolve({ data: [] }),
    ids.length ? supabase.from('answers').select('id,interview_id,question_id,answer_text,created_at').in('interview_id', ids) : Promise.resolve({ data: [] }),
  ]);
  const answerByQuestion = new Map((answers ?? []).map((answer: any) => [answer.question_id, answer]));
  const questionsByInterview = new Map<string, any[]>();
  (questions ?? []).forEach((question: any) => questionsByInterview.set(question.interview_id, [...(questionsByInterview.get(question.interview_id) ?? []), question]));
  return <AdminShell title={company.name} description="Complete company profile and every submitted response."><div className="space-y-8"><Link href="/admin/companies" className="text-sm underline underline-offset-4">← Back to companies</Link><section className="rounded-2xl border border-black/10 bg-white p-6"><p className="font-mono text-[10px] font-semibold uppercase tracking-[.16em] text-subtle">Company information</p><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><Info label="Industry" value={company.industry} /><Info label="Size" value={company.size} /><Info label="Website" value={company.website} /><Info label="Created" value={formatDate(company.created_at)} /></div></section><section><SectionHeading eyebrow="Raw interview data" title={`Full responses · ${sessions.length} ${sessions.length === 1 ? 'interview' : 'interviews'}`} />{sessions.length ? <div className="space-y-6">{sessions.map((session: any) => <article key={session.id} className="overflow-hidden rounded-2xl border border-black/10 bg-white"><header className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 bg-[#fafafa] p-5"><div><p className="font-semibold">{session.respondent_name || 'Unnamed respondent'}</p><p className="mt-1 text-sm text-subtle">{session.respondent_role || 'Role not provided'}{session.respondent_email ? ` · ${session.respondent_email}` : ''}</p><p className="mt-1 text-xs text-subtle">Submitted {formatDate(session.completed_at || session.started_at)}</p></div><div className="flex items-center gap-4"><StatusBadge status={session.status} /><Link href={`/admin/interviews/${session.id}`} className="text-sm underline underline-offset-4">Interview detail</Link></div></header><div className="divide-y divide-black/10">{(questionsByInterview.get(session.id) ?? []).map((question: any, index: number) => { const answer = answerByQuestion.get(question.id); return <div key={question.id} className="p-5 sm:p-6"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-subtle">Question {index + 1}</p><h3 className="mt-2 text-base font-medium leading-6">{question.question_text}</h3><div className="mt-4 rounded-xl bg-[#f7f8fa] p-4"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-subtle">Answer</p><div className="mt-2 text-sm leading-6">{answer?.answer_text ? <p className="whitespace-pre-wrap break-words">{answer.answer_text}</p> : <p className="italic text-subtle">Not answered</p>}</div></div></div>; })}</div></article>)}</div> : <EmptyState>No interviews have been recorded for this company.</EmptyState>}</section></div></AdminShell>;
}
