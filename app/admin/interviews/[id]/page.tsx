import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function AdminInterviewDetail({ params }: { params: { id: string } }) {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { data: interview } = supabase
        ? await supabase
            .from('interviews')
            .select(
                'id,status,started_at,completed_at,companies(name),interview_questions(question_key,question_text,sequence_number,answers(answer_text,answer_json,created_at)),reports(executive_summary,raw_ai_output,created_at)'
            )
            .eq('id', params.id)
            .maybeSingle()
        : { data: null };

    if (!interview) notFound();

    const questions = [...(interview.interview_questions ?? [])].sort(
        (a: { sequence_number: number }, b: { sequence_number: number }) =>
            a.sequence_number - b.sequence_number
    );

    return (
        <main className="min-h-screen bg-white p-6 text-black">
            <div className="mx-auto max-w-4xl space-y-8">
                <header>
                    <p className="text-sm text-subtle">
                        {interview.companies?.[0]?.name ?? 'Unknown company'} · {interview.status}
                    </p>
                    <h1 className="text-3xl font-bold">Interview detail</h1>
                </header>

                <section>
                    <h2 className="mb-3 text-xl font-semibold">Questions and answers</h2>
                    <div className="space-y-3">
                        {questions.map(
                            (question: {
                                question_key: string;
                                question_text: string;
                                answers: Array<{ answer_text: string | null; answer_json: unknown }>;
                            }) => (
                                <article
                                    key={question.question_key}
                                    className="rounded-xl border border-borderDark p-4"
                                >
                                    <p className="font-medium">{question.question_text}</p>
                                    <p className="mt-2 text-sm text-subtle">
                                        {question.answers?.[0]?.answer_text ||
                                            JSON.stringify(question.answers?.[0]?.answer_json ?? 'Not answered')}
                                    </p>
                                </article>
                            )
                        )}
                    </div>
                </section>

                <section>
                    <h2 className="mb-3 text-xl font-semibold">Diagnosis and recommendation</h2>
                    {interview.reports?.length ? (
                        interview.reports.map(
                            (report: {
                                executive_summary: string | null;
                                raw_ai_output: unknown;
                                created_at: string;
                            }) => (
                                <article key={report.created_at} className="rounded-xl border border-borderDark p-4">
                                    <p>{report.executive_summary}</p>
                                    <pre className="mt-3 overflow-auto text-xs text-subtle">
                                        {JSON.stringify(report.raw_ai_output, null, 2)}
                                    </pre>
                                </article>
                            )
                        )
                    ) : (
                        <p className="rounded-xl border border-borderDark p-4 text-subtle">
                            No report generated yet.
                        </p>
                    )}
                </section>
            </div>
        </main>
    );
}
