export type FixedQuestion = {
  key: string;
  text: string;
  type: 'short_text' | 'long_text' | 'single_choice';
  options?: string[];
};

// The public interview is intentionally small and deterministic. These snapshots
// are also written to `interview_questions` so historic responses remain readable.
export const fixedQuestions: FixedQuestion[] = [
  { key: 'industry', text: 'What industry does your company operate in?', type: 'short_text' },
  { key: 'company_size', text: 'How many people work at your company?', type: 'single_choice', options: ['1–5', '6–10', '11–50', '51–200', '201+'] },
  { key: 'website', text: 'What is your company website? (optional)', type: 'short_text' },
  { key: 'main_problem', text: 'What is the biggest operational challenge your company faces?', type: 'long_text' },
  { key: 'problem_impact', text: 'How does this challenge affect the business?', type: 'long_text' },
  { key: 'current_solution', text: 'How are you currently handling this challenge?', type: 'long_text' },
  { key: 'tools', text: 'What tools or software do you currently use?', type: 'long_text' },
  { key: 'manual_work', text: 'Which tasks take the most manual effort?', type: 'long_text' },
  { key: 'team_coordination', text: 'How does your team usually communicate and coordinate work?', type: 'long_text' },
  { key: 'business_goal', text: 'What is the most important goal for your business in the next 12 months?', type: 'long_text' },
  { key: 'desired_improvement', text: 'If you could improve one part of the business, what would it be?', type: 'long_text' },
];

export const fixedQuestionByKey = new Map(fixedQuestions.map((question) => [question.key, question]));
