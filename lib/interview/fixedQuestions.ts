export type FixedQuestion = {
  key: string;
  text: string;
  type: 'single_choice' | 'multi_choice';
  options: string[];
};

// A short, deterministic, selection-first interview. Question snapshots are
// written to `interview_questions` so each response remains readable over time.
export const fixedQuestions: FixedQuestion[] = [
  { key: 'industry', text: 'Which industry best describes your company?', type: 'single_choice', options: ['Professional services', 'Retail or e-commerce', 'Healthcare', 'Education', 'Manufacturing', 'Construction', 'Hospitality', 'Logistics', 'Technology', 'Financial services', 'Other'] },
  { key: 'company_size', text: 'How many people currently work in your company?', type: 'single_choice', options: ['1–5 employees', '6–10 employees', '11–50 employees', '51–200 employees', '201+ employees'] },
  { key: 'online_presence', text: 'How do customers primarily find or interact with your company online?', type: 'single_choice', options: ['Company website', 'Social media', 'Online marketplace', 'Messaging apps such as WhatsApp', 'We have little or no online presence', 'Other'] },
  { key: 'main_problem', text: 'What is the biggest challenge your business is currently facing?', type: 'single_choice', options: ['Getting new customers', 'Retaining existing customers', 'Managing day-to-day operations', 'Managing employees', 'Financial management', 'Customer support', 'Sales and marketing', 'Technology or software', 'Data and reporting', 'Other'] },
  { key: 'problem_impact', text: 'What areas are most affected by this challenge? Select all that apply.', type: 'multi_choice', options: ['Revenue or sales', 'Profitability or costs', 'Employee productivity', 'Customer experience', 'Decision-making', 'Speed of delivery', 'Compliance or risk', 'Business growth', 'Other'] },
  { key: 'current_solution', text: 'How is your company currently managing this challenge?', type: 'single_choice', options: ['A manual process', 'Spreadsheets', 'Messaging apps or email', 'A dedicated software tool', 'A mix of tools and manual work', 'We do not have a consistent process', 'Other'] },
  { key: 'tools', text: 'Which tools does your company rely on most often? Select all that apply.', type: 'multi_choice', options: ['Microsoft Excel or Google Sheets', 'WhatsApp or other messaging apps', 'Email', 'Accounting software', 'CRM or sales software', 'Project or task-management software', 'ERP or business-management software', 'Industry-specific software', 'Paper-based records', 'Other'] },
  { key: 'manual_work', text: 'Which activities currently require the most manual effort? Select all that apply.', type: 'multi_choice', options: ['Entering or moving data', 'Preparing reports', 'Following up with customers', 'Assigning or checking tasks', 'Managing invoices or payments', 'Finding documents or information', 'Communicating updates', 'Approvals', 'Other'] },
  { key: 'team_coordination', text: 'How does your team usually coordinate its work?', type: 'single_choice', options: ['In-person conversations or meetings', 'WhatsApp or messaging apps', 'Email', 'Spreadsheets', 'Task-management software', 'A mix of several methods', 'There is no consistent approach', 'Other'] },
  { key: 'business_goal', text: 'What is the most important goal for your business over the next 12 months?', type: 'single_choice', options: ['Increase revenue', 'Reduce costs', 'Acquire more customers', 'Improve customer retention', 'Improve operational efficiency', 'Improve employee productivity', 'Expand into new markets or locations', 'Introduce new products or services', 'Other'] },
  { key: 'desired_improvement', text: 'Which improvements would make the biggest difference to your business? Select all that apply.', type: 'multi_choice', options: ['Automate repetitive work', 'Improve visibility through reports or dashboards', 'Improve communication between teams', 'Keep customer information in one place', 'Improve financial tracking', 'Standardize important processes', 'Connect existing tools or systems', 'Reduce errors and duplicate work', 'Other'] },
];

export const fixedQuestionByKey = new Map(fixedQuestions.map((question) => [question.key, question]));
