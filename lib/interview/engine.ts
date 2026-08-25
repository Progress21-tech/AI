import { AnswerRecord, InterviewPhase, InterviewState, Question, QuestionObject } from '@/lib/ai/types';
import { deepDiveQuestions, questionRegistry } from './questionBank';

type AnswerMap = Record<string, string[]>;
const values = (answer?: AnswerRecord) => answer?.selectedOptions?.map(normalize) ?? (answer?.answerText ? [normalize(answer.answerText)] : []);
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
const answerMap = (answers: AnswerRecord[] = []): AnswerMap => Object.fromEntries(answers.map((answer) => [answer.questionId, values(answer)]));

export function matchesCondition(actual: string[], operator: string, expected: unknown) {
  const targets = (Array.isArray(expected) ? expected : [expected]).map((item) => normalize(String(item)));
  const has = targets.some((target) => actual.some((value) => value === target || value.includes(target)));
  if (operator === 'equals') return has;
  if (operator === 'not_equals') return !has;
  if (operator === 'contains') return has;
  if (operator === 'not_contains') return !has;
  const numeric = Number(actual[0]?.match(/\d+/)?.[0] ?? actual[0]);
  const target = Number(targets[0]);
  return operator === 'greater_than' ? numeric > target : operator === 'less_than' ? numeric < target : false;
}

export function shouldAskQuestion(question: Question, answers: AnswerMap) {
  return !question.conditions?.length || question.conditions.every((condition) => matchesCondition(answers[condition.questionId] ?? [], condition.operator, condition.value));
}

export function shouldDeepDive(answers: AnswerMap) {
  const severity = Number(answers.problem_severity?.[0]?.match(/\d/)?.[0] ?? 0);
  const frequency = answers.problem_frequency?.[0] ?? '';
  const time = answers.problem_time_impact?.[0] ?? '';
  return severity >= 4 || ['multiple_times_per_day', 'daily', 'several_times_per_week'].includes(frequency) || /10_20|20/.test(time);
}

export function diagnosticSignals(answers: AnswerMap) {
  const signals = new Set<string>();
  const includes = (key: string, choices: string[]) => choices.some((choice) => (answers[key] ?? []).includes(choice));
  if (includes('task_assignment', ['verbally', 'whatsapp', 'email', 'spreadsheets', 'paper'])) signals.add('manual_task_management');
  if (includes('task_delays', ['often', 'very_often']) || includes('problem_frequency', ['multiple_times_per_day', 'daily'])) signals.add('high_frequency_problem');
  if (includes('problem_time_impact', ['10_20_hours_week', '20_hours_week'])) signals.add('high_time_cost');
  if (includes('customer_duplication', ['often', 'very_often']) || includes('duplicate_documents', ['often', 'very_often'])) signals.add('data_duplication');
  if (includes('system_integration', ['mostly_separate', 'completely_separate']) || includes('manual_transfer', ['often', 'very_often'])) signals.add('poor_system_integration');
  if (includes('decision_speed', ['several_hours', 'a_day_or_more', 'it_is_often_difficult_to_get']) || includes('management_visibility', ['whatsapp', 'mostly_through_direct_communication'])) signals.add('low_visibility');
  if (includes('technology_readiness', ['yes', 'maybe'])) signals.add('high_technology_readiness');
  return [...signals];
}

export function calculateProgress(state: InterviewState) {
  const answered = state.answers?.length ?? 0;
  const required = questionRegistry.filter((question) => question.required).length;
  return { answered, percent: Math.min(95, Math.max(5, Math.round((answered / Math.max(required + 7, 20)) * 100))) };
}

export function isComplete(state: InterviewState) {
  const answers = answerMap(state.answers);
  const requiredComplete = questionRegistry.filter((question) => question.required && shouldAskQuestion(question, answers)).every((question) => answers[question.id]?.length);
  const depth = state.answers?.length ?? 0;
  return requiredComplete && !!answers.desired_outcome?.length && depth >= 18;
}

function phaseFor(question: Question): InterviewPhase {
  if (question.category === 'problems') return 'problem_discovery';
  if (question.category === 'problem_deep_dive') return 'problem_deep_dive';
  if (['operations', 'technology', 'finance', 'payroll', 'customers', 'documents', 'reporting'].includes(question.category)) return 'operations';
  return question.category === 'business_identity' || question.category === 'business_model' ? 'orientation' : 'business_mapping';
}

export function getInitialQuestion() { return toObject(questionRegistry[0], 1); }
export function getNextQuestion(state: InterviewState): QuestionObject | null {
  const answers = answerMap(state.answers);
  const asked = new Set(state.askedQuestionIds ?? []);
  const nearingLimit = state.elapsedSeconds >= state.targetDurationSeconds;
  const candidates = questionRegistry.filter((question) => !asked.has(question.id) && shouldAskQuestion(question, answers));
  const deepDives = shouldDeepDive(answers) ? deepDiveQuestions.filter((question) => !asked.has(question.id)) : [];
  const pool = [...candidates, ...deepDives].filter((question, index, all) => all.findIndex((item) => item.id === question.id) === index);
  // A deliberately short diagnostic spine keeps the interview useful without turning
  // the registry into a fixed questionnaire. Branch questions are inserted only when
  // their triggering answer makes them relevant.
  const process = answers.core_processes?.[0];
  const spine = [
    'industry', 'years_operating', 'employee_count', 'revenue_model', 'business_goal',
    'task_assignment', 'task_delays', 'core_processes',
    process ? `${process}_owner` : '', process ? `${process}_method` : '',
    'software', 'system_integration', 'manual_transfer', 'report_manual_work',
    'biggest_problem', 'problem_frequency', 'problem_severity', 'problem_affected',
    'problem_time_impact', 'problem_workaround', 'problem_root_cause',
    ...(shouldDeepDive(answers) ? ['problem_trigger', 'problem_first_notice', 'problem_fix_owner', 'problem_fix_time'] : []),
    'technology_readiness', 'desired_outcome',
  ];
  const specialized = pool.find((question) => ['finance', 'payroll', 'accounting'].includes(question.category));
  if (specialized && (state.answers?.length ?? 0) < 28) return toObject(specialized, (state.answers?.length ?? 0) + 1);
  const spineQuestion = spine.map((id) => pool.find((question) => question.id === id)).find((question): question is Question => Boolean(question));
  if (spineQuestion) return toObject(spineQuestion, (state.answers?.length ?? 0) + 1);
  const firstDeepDive = deepDives.find((question) => pool.some((item) => item.id === question.id));
  if (firstDeepDive && (state.answers?.length ?? 0) < 30) return toObject(firstDeepDive, (state.answers?.length ?? 0) + 1);
  const filtered = nearingLimit ? pool.filter((question) => question.required || question.priority! >= 85 || question.terminal) : pool;
  const next = (filtered.length ? filtered : pool).sort((a, b) => (b.required ? 1000 : b.priority ?? 0) - (a.required ? 1000 : a.priority ?? 0) || a.order - b.order)[0];
  return next ? toObject(next, (state.answers?.length ?? 0) + 1) : null;
}
export function toObject(question: Question, sequence: number): QuestionObject {
  return { id: question.id, text: question.text, type: question.type, options: question.options?.map((option) => option.label), required: !!question.required, objective: question.purpose ?? question.category, category: question.category, phase: phaseFor(question), sequence, placeholder: question.placeholder, helpText: question.helpText };
}

export function buildAnalysisPayload(state: InterviewState) {
  const answers = answerMap(state.answers);
  return { interviewId: state.interviewId, companyId: state.companyId, durationSeconds: state.elapsedSeconds, questionsAsked: state.askedQuestionIds?.length ?? 0, questionsAnswered: state.answers?.length ?? 0, selectedProcesses: answers.core_processes ?? [], businessFacts: Object.fromEntries(Object.entries(answers).filter(([key]) => !key.startsWith('problem_'))), diagnosticSignals: diagnosticSignals(answers), problems: answers.biggest_problem ? [{ title: answers.biggest_problem[0], frequency: answers.problem_frequency?.[0], severity: Number(answers.problem_severity?.[0]?.match(/\d/)?.[0] ?? 0), affected: answers.problem_affected ?? [], timeImpact: answers.problem_time_impact?.[0], workaround: answers.problem_workaround?.[0], rootCause: answers.problem_root_cause?.[0] }] : [], goals: answers.business_goal ?? [], technologyEnvironment: { software: answers.software ?? [], integration: answers.system_integration?.[0] }, technologyReadiness: answers.technology_readiness?.[0] ?? null, answers: state.answers ?? [] };
}
