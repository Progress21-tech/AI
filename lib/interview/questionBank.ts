import { Condition, Question, QuestionOption } from '@/lib/ai/types';

const options = (values: string[], tagged: Record<string, string[]> = {}): QuestionOption[] =>
  values.map((label) => ({ value: label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, ''), label, tags: tagged[label] }));

const q = (id: string, category: string, text: string, values: string[] | undefined, order: number, extras: Partial<Question> = {}): Question => ({
  id, category, text, type: values ? 'single_choice' : 'short_text', options: values ? options(values) : undefined,
  order, priority: 50, ...extras,
});
const multi = (id: string, category: string, text: string, values: string[], order: number, extras: Partial<Question> = {}): Question =>
  q(id, category, text, values, order, { ...extras, type: 'multi_choice' });
const conditional = (questionId: string, value: unknown, operator: Condition['operator'] = 'contains'): Condition[] => [{ questionId, operator, value }];

const frequency = ['Multiple times per day', 'Daily', 'Several times per week', 'Weekly', 'Monthly', 'Occasionally'];
const difficulty = ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often'];

export const coreQuestions: Question[] = [
  q('company_name', 'business_identity', 'What is the name of your company?', undefined, 1, { required: true, priority: 100 }),
  q('industry', 'business_identity', 'What industry best describes your business?', ['Accounting / Finance', 'Professional Services', 'Retail', 'Manufacturing', 'Healthcare', 'Education', 'Construction', 'Agriculture', 'Technology', 'Hospitality', 'Logistics', 'Real Estate', 'Other'], 2, { required: true, priority: 100 }),
  q('years_operating', 'business_identity', 'How long has the business been operating?', ['Less than 1 year', '1–3 years', '4–10 years', '11–20 years', 'More than 20 years'], 3, { required: true, priority: 90 }),
  q('employee_count', 'team', 'How many people currently work in the business?', ['1–5', '6–10', '11–25', '26–50', '51–100', '100+'], 4, { required: true, priority: 100 }),
  q('locations', 'business_identity', 'Where does the business currently operate?', ['One location', 'Multiple locations', 'Remote / distributed', 'Multiple cities', 'Multiple countries'], 5),
  multi('revenue_model', 'business_model', 'What are the main ways the business makes money?', ['Selling products', 'Professional services', 'Subscriptions', 'Contracts', 'Commissions', 'Consulting', 'Projects', 'Other'], 10, { required: true, priority: 90 }),
  q('revenue_driver', 'business_model', 'Which part of the business is currently the biggest driver of revenue?', undefined, 11),
  q('business_goal', 'future', 'What is the biggest business goal for the next 12 months?', ['Increase revenue', 'Reduce costs', 'Acquire more customers', 'Improve customer experience', 'Improve employee productivity', 'Expand locations', 'Launch new services', 'Improve operational efficiency', 'Digitalize the business', 'Other'], 12, { required: true, priority: 100 }),
  q('management_visibility', 'management', 'How do you currently keep track of what is happening across the business?', ['Regular meetings', 'WhatsApp', 'Email', 'Spreadsheets', 'Reports', 'Business software', 'Dashboards', 'Mostly through direct communication', 'Combination of several methods'], 20, { tags: ['visibility'] }),
  q('decision_speed', 'management', 'How quickly can you find information needed for an important decision?', ['Immediately', 'Within a few minutes', 'Within an hour', 'Several hours', 'A day or more', 'It is often difficult to get'], 21, { tags: ['information_friction'] }),
  q('decision_making', 'management', 'How are important decisions usually made?', ['Based on reports/data', 'Based on experience', 'Based on meetings', 'Based on customer feedback', 'Combination', 'Mostly intuition'], 22),
  q('report_frequency', 'reporting', 'How often do you receive reports about business performance?', ['Real-time', 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Only when needed', 'Rarely'], 23),
  q('task_assignment', 'team', 'How are tasks normally assigned to employees?', ['Verbally', 'WhatsApp', 'Email', 'Spreadsheets', 'Paper', 'Task-management software', 'ERP/business software', 'Other'], 30, { required: true, priority: 90 }),
  q('task_completion', 'team', 'How do you know whether an employee has completed a task?', ['They tell me', 'Manager checks', 'WhatsApp update', 'Email', 'Spreadsheet', 'Task-management software', 'System automatically records it', 'There is no consistent process'], 31),
  q('team_departments', 'team', 'Which departments or teams make up the business?', undefined, 31),
  q('performance_tracking', 'team', 'How is employee performance currently tracked?', ['Regular reviews', 'Manager observation', 'Targets/KPIs', 'Software', 'There is no consistent process', 'Other'], 31),
  q('employee_training', 'team', 'How are employees trained when a process changes?', ['Informally by colleagues', 'Manager-led training', 'Written instructions', 'Online training', 'There is no consistent process', 'Other'], 31),
  q('attendance_tracking', 'team', 'How is employee attendance or time worked tracked?', ['Attendance system', 'Timesheets', 'Spreadsheet', 'Paper', 'Manager observation', 'Not tracked', 'Other'], 31),
  q('task_delays', 'team', 'How often do tasks get forgotten, delayed, or lost?', difficulty, 32, { required: true, priority: 90 }),
  multi('delay_causes', 'team', 'What usually causes those delays?', ['Poor communication', 'Too many tasks', 'No clear ownership', 'Employees forget', 'Waiting for approval', 'Missing information', 'Manual processes', 'System problems', 'Other'], 33, { conditions: conditional('task_delays', ['sometimes', 'often', 'very_often']) }),
  multi('core_processes', 'operations', 'What are the most important recurring processes in the business?', ['Sales', 'Customer onboarding', 'Service delivery', 'Purchasing', 'Inventory', 'Accounting', 'Payroll', 'Reporting', 'Customer support', 'Project management', 'Other'], 40, { required: true, priority: 100 }),
  q('financial_recording', 'finance', 'How are financial transactions currently recorded?', ['Accounting software', 'ERP', 'Spreadsheet', 'Paper', 'Combination', 'External accountant', 'Other'], 60, { conditions: conditional('core_processes', 'accounting') }),
  q('invoicing', 'finance', 'How are invoices currently created and tracked?', ['Accounting software', 'ERP', 'Spreadsheet', 'Word processor', 'Manual documents', 'Other'], 61, { conditions: conditional('core_processes', 'accounting') }),
  q('payments_tracking', 'finance', 'How do you track outstanding customer payments?', ['Accounting software', 'Spreadsheet', 'Bank statements', 'Manual follow-up', 'CRM', 'ERP', 'Other'], 62, { conditions: conditional('core_processes', 'accounting') }),
  q('cash_flow_difficulty', 'finance', 'How difficult is it to get an accurate picture of cash flow?', ['1 - Very easy', '2', '3', '4', '5 - Very difficult'], 63, { type: 'scale', conditions: conditional('core_processes', 'accounting') }),
  q('payroll_process', 'payroll', 'How is payroll currently prepared?', ['Payroll software', 'Accounting software', 'Spreadsheet', 'Manual calculation', 'External payroll provider', 'ERP', 'Other'], 70, { conditions: conditional('core_processes', 'payroll') }),
  multi('payroll_inputs', 'payroll', 'Where does payroll information come from?', ['Attendance system', 'Timesheets', 'Manager submissions', 'Spreadsheet', 'HR system', 'WhatsApp', 'Paper', 'Other'], 71, { conditions: conditional('core_processes', 'payroll') }),
  q('payroll_corrections', 'payroll', 'How often does payroll require manual corrections?', difficulty, 72, { conditions: conditional('core_processes', 'payroll') }),
  multi('payroll_correction_causes', 'payroll', 'What usually causes payroll corrections?', ['Incorrect attendance', 'Overtime', 'Leave', 'Deductions', 'Salary changes', 'Data-entry errors', 'Missing information', 'Late submissions', 'Other'], 73, { conditions: conditional('payroll_corrections', ['sometimes', 'often', 'very_often']) }),
  q('customer_records', 'customers', 'How do you currently keep track of customer information?', ['CRM', 'Spreadsheet', 'Accounting software', 'ERP', 'WhatsApp', 'Email', 'Paper', 'Individual employee records', 'Combination'], 80),
  multi('customer_channels', 'customers', 'How do customers usually contact the business?', ['Phone', 'WhatsApp', 'Email', 'Website', 'Social media', 'In person', 'Other'], 81),
  q('customer_duplication', 'customers', 'How often does customer information have to be entered more than once?', difficulty, 82),
  multi('document_storage', 'documents', 'Where is important business information usually stored?', ['Google Drive', 'OneDrive', 'Dropbox', 'Local computers', 'Paper files', 'WhatsApp', 'Email', 'Spreadsheets', 'Business software', 'Other'], 90),
  q('document_search', 'documents', 'How easy is it to find an old document or piece of information?', ['1 - Very easy', '2', '3', '4', '5 - Very difficult'], 91, { type: 'scale' }),
  q('duplicate_documents', 'documents', 'How often do employees create duplicate versions of the same information?', difficulty, 92),
  multi('software', 'technology', 'What software does the business currently rely on?', ['Microsoft Excel', 'Google Sheets', 'QuickBooks', 'Sage', 'Xero', 'Zoho', 'Microsoft 365', 'Google Workspace', 'Slack', 'Microsoft Teams', 'WhatsApp', 'CRM', 'ERP', 'HR software', 'Payroll software', 'Industry-specific software', 'Other'], 100, { required: true, priority: 90 }),
  q('system_integration', 'technology', 'How well do the systems you currently use work together?', ['They are fully integrated', 'Mostly integrated', 'Some are integrated', 'Mostly separate', 'Completely separate', "I don't know"], 101),
  q('manual_transfer', 'technology', 'How often do employees move information manually from one system to another?', difficulty, 102),
  multi('communication_channels', 'communication', 'Which channels does the team use for internal communication?', ['WhatsApp', 'Email', 'Phone', 'Meetings', 'Slack', 'Teams', 'Project-management software', 'Other'], 110),
  q('message_findability', 'communication', 'How often is important information difficult to find because it is buried in messages?', difficulty, 111),
  multi('needed_reports', 'reporting', 'What reports do you regularly need to run the business?', ['Sales', 'Revenue', 'Expenses', 'Profit', 'Cash flow', 'Customers', 'Employee performance', 'Payroll', 'Inventory', 'Projects', 'Operations', 'Other'], 120),
  q('report_production', 'reporting', 'How are these reports currently produced?', ['Automatically', 'Accounting software', 'ERP', 'Spreadsheet', 'Manual compilation', 'Someone prepares them', 'Combination'], 121),
  q('report_manual_work', 'reporting', 'How much manual work goes into preparing reports?', ['Almost none', 'A little', 'Moderate', 'A lot', 'Extensive'], 122),
  q('report_accuracy', 'reporting', 'How confident are you in the accuracy of the reports you use?', ['Very confident', 'Mostly confident', 'Somewhat confident', 'Not very confident', 'Not confident'], 123),
  q('approval_process', 'operations', 'How are important approvals handled?', ['Verbally', 'WhatsApp or email', 'Paper forms', 'Workflow software', 'ERP/business software', 'Other'], 124),
  q('process_errors', 'operations', 'How often do errors occur in important processes?', difficulty, 125),
  q('data_access', 'documents', 'Who can access important business information?', ['Anyone who needs it', 'Managers only', 'Specific teams', 'Owner only', "I don't know"], 126),
  q('data_backup', 'compliance', 'How is important business data backed up?', ['Cloud backup', 'External drive', 'Business software backup', 'Manual copies', 'We do not have a reliable backup', "I don't know"], 127),
  q('biggest_problem', 'problems', 'What is the single biggest operational problem you currently face?', undefined, 130, { required: true, priority: 100 }),
  q('problem_frequency', 'problems', 'How often does this problem occur?', frequency, 131, { required: true, priority: 100 }),
  q('problem_severity', 'problems', 'How serious is this problem for the business?', ['1 - Minor inconvenience', '2', '3', '4', '5 - Extremely serious'], 132, { type: 'scale', required: true, priority: 100 }),
  multi('problem_affected', 'problems', 'Who is most affected by this problem?', ['Owner', 'Managers', 'Accountants', 'Sales team', 'Operations team', 'HR', 'Customers', 'Entire company', 'Other'], 133, { required: true, priority: 90 }),
  q('problem_time_impact', 'problems', 'Approximately how much employee time does this problem consume?', ['Less than 1 hour/week', '1–5 hours/week', '5–10 hours/week', '10–20 hours/week', '20+ hours/week', 'Unknown'], 134, { required: true, priority: 100 }),
  q('problem_financial_impact', 'problems', 'What financial impact does this problem have, if any?', undefined, 135, { type: 'currency' }),
  q('problem_workaround', 'problems', 'What do you currently do to work around the problem?', undefined, 136, { required: true, priority: 90 }),
  q('problem_root_cause', 'problems', 'What usually causes this problem?', ['Manual work', 'Poor communication', 'Missing information', 'Lack of visibility', 'Too many approvals', 'System limitations', 'Human error', 'No standardized process', 'Insufficient staff', 'Training', 'Other'], 137, { required: true, priority: 100 }),
  q('previous_solution', 'problems', 'Has the business tried to solve this before?', ['Yes', 'No'], 138, { type: 'yes_no' }),
  q('previous_solution_detail', 'problems', 'What did you try, and why did it not fully solve the problem?', undefined, 139, { conditions: conditional('previous_solution', 'yes', 'equals') }),
  q('technology_readiness', 'future', 'Do you think this problem could be reduced through better technology or automation?', ['Yes', 'Maybe', 'No', 'Not sure'], 150, { required: true, priority: 90 }),
  q('desired_outcome', 'future', 'If we could improve one part of the business over the next 6–12 months, what would you want that improvement to be?', undefined, 160, { required: true, priority: 100, terminal: true }),
];

const processNames = ['sales', 'customer_onboarding', 'service_delivery', 'purchasing', 'inventory', 'reporting', 'customer_support', 'project_management'];
export const processQuestions: Question[] = processNames.flatMap((process, index) => {
  const label = process.replace(/_/g, ' ');
  const base = 200 + index * 10;
  return [
    q(`${process}_owner`, 'operations', `Who performs the ${label} process?`, ['Owner', 'Manager', 'Accountant', 'Admin', 'Sales team', 'Operations team', 'Multiple departments', 'External provider', 'Other'], base, { conditions: conditional('core_processes', process), deepDive: true }),
    q(`${process}_method`, 'operations', `How is ${label} currently performed?`, ['Manually', 'Spreadsheet', 'Email', 'WhatsApp', 'Paper', 'Existing software', 'ERP', 'Combination'], base + 1, { conditions: conditional('core_processes', process), deepDive: true }),
    q(`${process}_frequency`, 'operations', `How frequently does ${label} occur?`, frequency, base + 2, { conditions: conditional('core_processes', process), deepDive: true }),
    q(`${process}_difficulty`, 'operations', `What is the biggest difficulty with ${label}?`, ['Too slow', 'Too much manual work', 'Errors', 'Poor visibility', 'Poor communication', 'Approvals', 'Data entry', 'Searching for information', 'Duplicate work', 'Other'], base + 3, { conditions: conditional('core_processes', process), deepDive: true }),
  ];
});

export const deepDiveQuestions: Question[] = [
  q('problem_trigger', 'problem_deep_dive', 'What usually triggers the problem?', undefined, 400, { deepDive: true, priority: 85 }),
  q('problem_first_notice', 'problem_deep_dive', 'Who notices it first?', ['Owner', 'Manager', 'Employee', 'Customer', 'System alert', 'Other'], 401, { deepDive: true }),
  q('problem_fix_owner', 'problem_deep_dive', 'Who has to fix it?', ['Owner', 'Manager', 'Admin', 'Operations team', 'External provider', 'Multiple people', 'Other'], 402, { deepDive: true }),
  q('problem_fix_time', 'problem_deep_dive', 'How long does fixing it usually take?', ['Less than 15 minutes', '15–30 minutes', '30–60 minutes', '1–2 hours', '2–4 hours', 'More than 4 hours'], 403, { deepDive: true }),
  q('problem_information_source', 'problem_deep_dive', 'Where does the information needed to fix it come from?', ['People', 'Spreadsheets', 'Messages', 'Email', 'Business software', 'Paper files', 'Other'], 404, { deepDive: true }),
  q('problem_consequence', 'problem_deep_dive', 'What happens if nobody notices the problem?', undefined, 405, { type: 'long_text', deepDive: true }),
];

export const accountingQuestions: Question[] = [
  q('accounting_document_submission', 'accounting', 'How do clients submit documents to your firm?', ['WhatsApp', 'Email', 'Portal', 'Physical documents', 'Google Drive', 'Combination', 'Other'], 500, { conditions: conditional('industry', 'accounting_finance', 'equals') }),
  q('accounting_submission_tracking', 'accounting', 'How do you track which clients have submitted everything required?', ['Spreadsheet', 'Practice-management software', 'Email', 'WhatsApp', 'Manual checklist', 'Other'], 501, { conditions: conditional('industry', 'accounting_finance', 'equals') }),
  q('accounting_missing_documents', 'accounting', 'How often do staff chase clients for missing documents?', difficulty, 502, { conditions: conditional('industry', 'accounting_finance', 'equals') }),
  q('accounting_deadline_tracking', 'accounting', 'How are client and filing deadlines tracked?', ['Practice-management software', 'Calendar', 'Spreadsheet', 'Paper', 'Individual memory', 'Other'], 503, { conditions: conditional('industry', 'accounting_finance', 'equals') }),
  q('accounting_reconciliation', 'accounting', 'How is bank reconciliation handled?', ['Accounting software', 'Spreadsheet', 'Manually', 'External provider', 'Other'], 504, { conditions: conditional('industry', 'accounting_finance', 'equals') }),
  q('accounting_practice_management', 'accounting', 'How do you monitor work in progress across clients?', ['Practice-management software', 'Spreadsheet', 'Meetings', 'Email/WhatsApp', 'We do not track it consistently', 'Other'], 505, { conditions: conditional('industry', 'accounting_finance', 'equals') }),
];

export const questionRegistry: Question[] = [...coreQuestions, ...processQuestions, ...deepDiveQuestions, ...accountingQuestions];
export const questionsById = new Map(questionRegistry.map((question) => [question.id, question]));
