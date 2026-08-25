import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type Props = {
    params: {
        id: string;
    };
};

export default async function AdminInterviewDetail({ params }: Props) {
    await requireAdmin();

    const supabase = await createServerSupabaseClient();

    if (!supabase) {
        notFound();
    }

    /*
     * Load the interview itself.
     */
    const { data: interview, error: interviewError } = await supabase
        .from('interviews')
        .select(`
            id,
            status,
            phase,
            started_at,
            completed_at,
            last_activity_at,
            estimated_duration,
            actual_duration,
            respondent_name,
            respondent_role,
            respondent_email,
            respondent_phone,
            company_id,
            created_by,
            created_at,
            companies (
                id,
                name,
                industry,
                website,
                size,
                owner_id
            )
        `)
        .eq('id', params.id)
        .maybeSingle();

    if (interviewError) {
        console.error('Failed to load interview:', interviewError);
    }

    if (!interview) {
        notFound();
    }

    /*
     * Load all questions.
     */
    const { data: questions, error: questionsError } = await supabase
        .from('interview_questions')
        .select(`
            id,
            question_key,
            question_text,
            question_type,
            sequence_number,
            displayed_at,
            answered_at
        `)
        .eq('interview_id', params.id)
        .order('sequence_number', { ascending: true });

    if (questionsError) {
        console.error('Failed to load questions:', questionsError);
    }

    /*
     * Load every answer belonging to this interview.
     */
    const { data: answers, error: answersError } = await supabase
        .from('answers')
        .select(`
            id,
            question_id,
            answer_text,
            answer_json,
            created_at
        `)
        .eq('interview_id', params.id)
        .order('created_at', { ascending: true });

    if (answersError) {
        console.error('Failed to load answers:', answersError);
    }

    /*
     * Load extracted business facts.
     */
    const { data: businessFacts, error: factsError } = await supabase
        .from('business_facts')
        .select(`
            id,
            category,
            key,
            value,
            source_answer_id,
            created_at
        `)
        .eq('interview_id', params.id)
        .order('created_at', { ascending: true });

    if (factsError) {
        console.error('Failed to load business facts:', factsError);
    }

    /*
     * Load detected problems.
     */
    const { data: problems, error: problemsError } = await supabase
        .from('problems')
        .select(`
            id,
            title,
            description,
            frequency,
            severity,
            people_affected,
            time_impact_hours_per_week,
            financial_impact,
            current_solution,
            created_at
        `)
        .eq('interview_id', params.id)
        .order('created_at', { ascending: true });

    if (problemsError) {
        console.error('Failed to load problems:', problemsError);
    }

    /*
     * Load recommendations.
     *
     * This will become especially useful once Gemini is connected
     * to the final recommendation stage.
     */
    const { data: recommendations, error: recommendationsError } =
        await supabase
            .from('recommendations')
            .select(`
                id,
                title,
                type,
                problem_solved,
                evidence,
                why_it_matters,
                expected_impact,
                implementation_difficulty,
                priority,
                suggested_approach,
                risks,
                next_step,
                created_at
            `)
            .eq('interview_id', params.id)
            .order('created_at', { ascending: true });

    if (recommendationsError) {
        console.error(
            'Failed to load recommendations:',
            recommendationsError
        );
    }

    /*
     * Load reports.
     */
    const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select(`
            id,
            executive_summary,
            business_snapshot,
            major_problems,
            opportunities,
            roadmap,
            raw_ai_output,
            created_at,
            updated_at
        `)
        .eq('interview_id', params.id)
        .order('created_at', { ascending: false });

    if (reportsError) {
        console.error('Failed to load reports:', reportsError);
    }

    /*
     * Load decision logs.
     */
    const { data: decisionLogs, error: logsError } = await supabase
        .from('decision_logs')
        .select(`
            id,
            phase,
            objective,
            reason_code,
            state_change,
            confidence,
            model_latency_ms,
            token_usage,
            created_at
        `)
        .eq('interview_id', params.id)
        .order('created_at', { ascending: true });

    if (logsError) {
        console.error('Failed to load decision logs:', logsError);
    }

    /*
     * Create a quick answer lookup by question ID.
     */
    const answerMap = new Map(
        (answers ?? []).map((answer) => [
            answer.question_id,
            answer,
        ])
    );

    const company = Array.isArray(interview.companies)
        ? interview.companies[0]
        : interview.companies;

    return (
        <main className="min-h-screen bg-white px-4 py-6 text-black sm:px-6 sm:py-8">
            <div className="mx-auto w-full max-w-5xl space-y-8">

                {/* Back navigation */}
                <div>
                    <Link
                        href="/admin/interviews"
                        className="text-sm underline underline-offset-4"
                    >
                        ← Back to interviews
                    </Link>
                </div>

                {/* Interview header */}
                <header className="space-y-3">
                    <div>
                        <p className="text-sm text-subtle">
                            {company?.name ?? 'Unknown company'}
                        </p>

                        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                            Discovery interview
                        </h1>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full border border-borderDark px-3 py-1">
                            {interview.status}
                        </span>

                        {interview.phase && (
                            <span className="rounded-full border border-borderDark px-3 py-1">
                                Phase: {interview.phase}
                            </span>
                        )}
                    </div>
                </header>

                {/* Interview metadata */}
                <section className="rounded-2xl border border-borderDark p-5 sm:p-6">
                    <h2 className="text-lg font-semibold">
                        Interview information
                    </h2>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <Info
                            label="Respondent"
                            value={interview.respondent_name}
                        />

                        <Info
                            label="Role"
                            value={interview.respondent_role}
                        />

                        <Info
                            label="Email"
                            value={interview.respondent_email}
                        />

                        <Info
                            label="Phone"
                            value={interview.respondent_phone}
                        />

                        <Info
                            label="Started"
                            value={formatDate(interview.started_at)}
                        />

                        <Info
                            label="Completed"
                            value={formatDate(interview.completed_at)}
                        />

                        <Info
                            label="Estimated duration"
                            value={
                                interview.estimated_duration
                                    ? `${interview.estimated_duration} minutes`
                                    : null
                            }
                        />

                        <Info
                            label="Actual duration"
                            value={
                                interview.actual_duration
                                    ? `${interview.actual_duration} seconds`
                                    : null
                            }
                        />
                    </div>
                </section>

                {/* Company */}
                <section className="rounded-2xl border border-borderDark p-5 sm:p-6">
                    <h2 className="text-lg font-semibold">
                        Business profile
                    </h2>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <Info
                            label="Company"
                            value={company?.name}
                        />

                        <Info
                            label="Industry"
                            value={company?.industry}
                        />

                        <Info
                            label="Company size"
                            value={company?.size}
                        />

                        <Info
                            label="Website"
                            value={company?.website}
                        />
                    </div>
                </section>

                {/* FULL QUESTIONS + ANSWERS */}
                <section>
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">
                            Complete interview responses
                        </h2>

                        <p className="mt-1 text-sm text-subtle">
                            Every question and the exact response provided by
                            the respondent.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {(questions ?? []).map((question, index) => {
                            const answer = answerMap.get(question.id);

                            return (
                                <article
                                    key={question.id}
                                    className="rounded-2xl border border-borderDark p-5 sm:p-6"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="shrink-0 text-xs font-mono text-subtle">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium leading-6">
                                                {question.question_text}
                                            </p>

                                            <div className="mt-4 rounded-xl bg-black/[0.03] p-4">
                                                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">
                                                    Response
                                                </p>

                                                {answer ? (
                                                    <>
                                                        {answer.answer_text && (
                                                            <p className="whitespace-pre-wrap text-sm leading-6">
                                                                {
                                                                    answer.answer_text
                                                                }
                                                            </p>
                                                        )}

                                                        {!answer.answer_text &&
                                                            answer.answer_json && (
                                                                <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-6">
                                                                    {JSON.stringify(
                                                                        answer.answer_json,
                                                                        null,
                                                                        2
                                                                    )}
                                                                </pre>
                                                            )}
                                                    </>
                                                ) : (
                                                    <p className="text-sm italic text-subtle">
                                                        Not answered
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

                {/* BUSINESS FACTS */}
                <section>
                    <h2 className="mb-4 text-xl font-semibold">
                        Extracted business facts
                    </h2>

                    {businessFacts?.length ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {businessFacts.map((fact) => (
                                <article
                                    key={fact.id}
                                    className="rounded-2xl border border-borderDark p-5"
                                >
                                    <p className="text-xs uppercase tracking-wide text-subtle">
                                        {fact.category}
                                    </p>

                                    <h3 className="mt-1 font-semibold">
                                        {fact.key}
                                    </h3>

                                    <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm text-subtle">
                                        {JSON.stringify(
                                            fact.value,
                                            null,
                                            2
                                        )}
                                    </pre>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <EmptyState text="No business facts extracted yet." />
                    )}
                </section>

                {/* PROBLEMS */}
                <section>
                    <h2 className="mb-4 text-xl font-semibold">
                        Identified problems
                    </h2>

                    {problems?.length ? (
                        <div className="space-y-3">
                            {problems.map((problem) => (
                                <article
                                    key={problem.id}
                                    className="rounded-2xl border border-borderDark p-5"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold">
                                                {problem.title}
                                            </h3>

                                            {problem.description && (
                                                <p className="mt-2 text-sm leading-6 text-subtle">
                                                    {problem.description}
                                                </p>
                                            )}
                                        </div>

                                        {problem.severity != null && (
                                            <span className="rounded-full border border-borderDark px-3 py-1 text-xs">
                                                Severity {problem.severity}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                                        <Info
                                            label="Frequency"
                                            value={problem.frequency}
                                        />

                                        <Info
                                            label="People affected"
                                            value={
                                                problem.people_affected?.toString()
                                            }
                                        />

                                        <Info
                                            label="Hours/week"
                                            value={
                                                problem.time_impact_hours_per_week?.toString()
                                            }
                                        />

                                        <Info
                                            label="Financial impact"
                                            value={
                                                problem.financial_impact?.toString()
                                            }
                                        />

                                        <Info
                                            label="Current solution"
                                            value={problem.current_solution}
                                        />
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <EmptyState text="No problems recorded yet." />
                    )}
                </section>

                {/* RECOMMENDATIONS */}
                <section>
                    <h2 className="mb-4 text-xl font-semibold">
                        Recommendations
                    </h2>

                    {recommendations?.length ? (
                        <div className="space-y-3">
                            {recommendations.map((recommendation) => (
                                <article
                                    key={recommendation.id}
                                    className="rounded-2xl border border-borderDark p-5"
                                >
                                    <div className="flex flex-wrap justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold">
                                                {recommendation.title}
                                            </h3>

                                            <p className="mt-1 text-xs text-subtle">
                                                {recommendation.type}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            {recommendation.priority && (
                                                <span className="rounded-full border border-borderDark px-3 py-1 text-xs">
                                                    {
                                                        recommendation.priority
                                                    }
                                                </span>
                                            )}

                                            {recommendation.implementation_difficulty && (
                                                <span className="rounded-full border border-borderDark px-3 py-1 text-xs">
                                                    {
                                                        recommendation.implementation_difficulty
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {recommendation.problem_solved && (
                                        <p className="mt-4 text-sm">
                                            <strong>
                                                Problem solved:
                                            </strong>{' '}
                                            {recommendation.problem_solved}
                                        </p>
                                    )}

                                    {recommendation.why_it_matters && (
                                        <p className="mt-3 text-sm leading-6 text-subtle">
                                            {recommendation.why_it_matters}
                                        </p>
                                    )}

                                    {recommendation.suggested_approach && (
                                        <div className="mt-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
                                                Suggested approach
                                            </p>

                                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6">
                                                {
                                                    recommendation.suggested_approach
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {recommendation.next_step && (
                                        <p className="mt-4 text-sm">
                                            <strong>Next step:</strong>{' '}
                                            {recommendation.next_step}
                                        </p>
                                    )}
                                </article>
                            ))}
                        </div>
                    ) : (
                        <EmptyState text="No recommendations generated yet." />
                    )}
                </section>

                {/* REPORT */}
                <section>
                    <h2 className="mb-4 text-xl font-semibold">
                        Reports / AI analysis
                    </h2>

                    {reports?.length ? (
                        <div className="space-y-4">
                            {reports.map((report) => (
                                <article
                                    key={report.id}
                                    className="rounded-2xl border border-borderDark p-5 sm:p-6"
                                >
                                    {report.executive_summary && (
                                        <>
                                            <p className="text-xs uppercase tracking-wide text-subtle">
                                                Executive summary
                                            </p>

                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                                                {
                                                    report.executive_summary
                                                }
                                            </p>
                                        </>
                                    )}

                                    <details className="mt-5">
                                        <summary className="cursor-pointer text-sm font-medium">
                                            View raw AI output
                                        </summary>

                                        <pre className="mt-3 max-h-[500px] overflow-auto rounded-xl bg-black/[0.03] p-4 text-xs">
                                            {JSON.stringify(
                                                report.raw_ai_output,
                                                null,
                                                2
                                            )}
                                        </pre>
                                    </details>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <EmptyState text="No report generated yet." />
                    )}
                </section>

                {/* DECISION LOG */}
                <section>
                    <h2 className="mb-4 text-xl font-semibold">
                        System decision log
                    </h2>

                    {decisionLogs?.length ? (
                        <div className="space-y-3">
                            {decisionLogs.map((log) => (
                                <article
                                    key={log.id}
                                    className="rounded-2xl border border-borderDark p-4"
                                >
                                    <div className="flex flex-wrap justify-between gap-2">
                                        <p className="font-medium">
                                            {log.phase}
                                        </p>

                                        <p className="text-xs text-subtle">
                                            {formatDate(log.created_at)}
                                        </p>
                                    </div>

                                    <p className="mt-2 text-sm">
                                        {log.objective}
                                    </p>

                                    <p className="mt-1 text-xs text-subtle">
                                        {log.reason_code}
                                    </p>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <EmptyState text="No decision logs recorded." />
                    )}
                </section>
            </div>
        </main>
    );
}

/*
 * Small reusable information component.
 */
function Info({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    return (
        <div>
            <p className="text-xs text-subtle">{label}</p>
            <p className="mt-1 break-words text-sm">
                {value || 'Not provided'}
            </p>
        </div>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="rounded-2xl border border-borderDark p-5 text-sm text-subtle">
            {text}
        </div>
    );
}

function formatDate(value: string | null | undefined) {
    if (!value) return 'Not available';

    return new Date(value).toLocaleString();
}