'use client';

import { useState } from 'react';

const options = {
  industry: ['Professional services', 'Retail or e-commerce', 'Healthcare', 'Education', 'Manufacturing', 'Construction', 'Hospitality', 'Logistics', 'Technology', 'Financial services', 'Other'],
  company_size: ['1–5 employees', '6–10 employees', '11–50 employees', '51–200 employees', '201+ employees'],
  online_presence: ['Company website', 'Social media', 'Online marketplace', 'Messaging apps such as WhatsApp', 'We have little or no online presence', 'Other'],
  problem_impact: ['Revenue or sales', 'Profitability or costs', 'Employee productivity', 'Customer experience', 'Decision-making', 'Speed of delivery', 'Compliance or risk', 'Business growth', 'Other'],
  current_solution: ['A manual process', 'Spreadsheets', 'Messaging apps or email', 'A dedicated software tool', 'A mix of tools and manual work', 'We do not have a consistent process', 'Other'],
  tools: ['Microsoft Excel or Google Sheets', 'WhatsApp or other messaging apps', 'Email', 'Accounting software', 'CRM or sales software', 'Project or task-management software', 'ERP or business-management software', 'Industry-specific software', 'Paper-based records', 'Other'],
  manual_work: ['Entering or moving data', 'Preparing reports', 'Following up with customers', 'Assigning or checking tasks', 'Managing invoices or payments', 'Finding documents or information', 'Communicating updates', 'Approvals', 'Other'],
  team_coordination: ['In-person conversations or meetings', 'WhatsApp or messaging apps', 'Email', 'Spreadsheets', 'Task-management software', 'A mix of several methods', 'There is no consistent approach', 'Other'],
  business_goal: ['Increase revenue', 'Reduce costs', 'Acquire more customers', 'Improve customer retention', 'Improve operational efficiency', 'Improve employee productivity', 'Expand into new markets or locations', 'Introduce new products or services', 'Other'],
  desired_improvement: ['Automate repetitive work', 'Improve visibility through reports or dashboards', 'Improve communication between teams', 'Keep customer information in one place', 'Improve financial tracking', 'Standardize important processes', 'Connect existing tools or systems', 'Reduce errors and duplicate work', 'Other'],
} as const;

type Answers = Record<string, string | string[]>;
type FormState = 'idle' | 'sending' | 'success' | 'error';

const inputClass = 'mt-2 w-full rounded-xl border border-borderDark bg-white px-4 py-3 text-sm text-black placeholder:text-subtle focus:border-black focus:outline-none';

export function BookCallForm() {
  const [state, setState] = useState<FormState>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [answers, setAnswers] = useState<Answers>({});
  const [problem, setProblem] = useState('');
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [error, setError] = useState('');

  const setAnswer = (key: string, value: string | string[]) => setAnswers((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState('sending');
    setError('');
    try {
      const form = new FormData(event.currentTarget);
      const preferredTime = String(form.get('preferred_call_datetime') ?? '');
      const response = await fetch('/api/discovery-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email,
          business_name: form.get('business_name'),
          whatsapp: form.get('whatsapp'),
          business_description: form.get('business_description'),
          biggest_problem: problem,
          preferred_call_datetime: new Date(preferredTime).toISOString(),
          interested_service: form.get('interested_service'),
          discovery_answers: answers,
          source: 'website',
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'We could not send your request. Please try again.');
      setConfirmationSent(result.confirmationSent === true);
      setState('success');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'We could not send your request. Please try again.');
      setState('error');
    }
  };

  if (state === 'success') {
    return <div role="status" className="rounded-2xl border border-black/10 bg-surface p-6 text-base leading-7">{confirmationSent ? <>Thanks, {name}. We&apos;ve sent a confirmation to {email} and will confirm your call time within 24 hours.</> : <>Thanks, {name}. Your request is saved. We’re retrying the confirmation email and will confirm your call time within 24 hours.</>}</div>;
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold tracking-tight">Your details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">Name<input required autoComplete="name" maxLength={150} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} /></label>
          <label className="block text-sm font-medium">Business name<input required name="business_name" autoComplete="organization" maxLength={200} className={inputClass} /></label>
          <label className="block text-sm font-medium">Email<input required type="email" autoComplete="email" maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} /></label>
          <label className="block text-sm font-medium">WhatsApp number <span className="font-normal text-subtle">(optional)</span><input type="tel" name="whatsapp" autoComplete="tel" maxLength={40} className={inputClass} /></label>
        </div>
        <label className="block text-sm font-medium">What does your business do?<textarea required name="business_description" rows={3} maxLength={3000} className={inputClass} /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">Preferred call date and time<input required type="datetime-local" name="preferred_call_datetime" className={inputClass} /></label>
          <label className="block text-sm font-medium">Which service sounds closest?<select name="interested_service" defaultValue="unsure" className={inputClass}><option value="automation">AI automation</option><option value="chatbot">AI chatbot or assistant</option><option value="custom_software">Custom software</option><option value="unsure">I’m not sure yet</option></select></label>
        </div>
      </fieldset>

      <fieldset className="space-y-5 border-t border-black/10 pt-7">
        <legend className="text-lg font-semibold tracking-tight">A little about the business</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <SingleChoice id="industry" label="Which industry best describes your company?" values={options.industry} value={answers.industry as string} onChange={(value) => setAnswer('industry', value)} />
          <SingleChoice id="company_size" label="How many people currently work in your company?" values={options.company_size} value={answers.company_size as string} onChange={(value) => setAnswer('company_size', value)} />
          <SingleChoice id="online_presence" label="How do customers primarily find or interact with your company online?" values={options.online_presence} value={answers.online_presence as string} onChange={(value) => setAnswer('online_presence', value)} />
          <SingleChoice id="business_goal" label="What is the most important goal for your business over the next 12 months?" values={options.business_goal} value={answers.business_goal as string} onChange={(value) => setAnswer('business_goal', value)} />
        </div>
      </fieldset>

      <fieldset className="space-y-5 border-t border-black/10 pt-7">
        <legend className="text-lg font-semibold tracking-tight">Where work gets stuck</legend>
        <label className="block text-sm font-medium">What operational problem is slowing your business down the most?<textarea required rows={4} maxLength={5000} value={problem} onChange={(e) => setProblem(e.target.value)} className={inputClass} /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <MultiChoice id="problem_impact" label="What areas are most affected by this challenge? Select all that apply." values={options.problem_impact} value={(answers.problem_impact as string[]) ?? []} onChange={(value) => setAnswer('problem_impact', value)} />
          <SingleChoice id="current_solution" label="How is your company currently managing this challenge?" values={options.current_solution} value={answers.current_solution as string} onChange={(value) => setAnswer('current_solution', value)} />
          <MultiChoice id="manual_work" label="Which activities currently require the most manual effort? Select all that apply." values={options.manual_work} value={(answers.manual_work as string[]) ?? []} onChange={(value) => setAnswer('manual_work', value)} />
          <SingleChoice id="team_coordination" label="How does your team usually coordinate its work?" values={options.team_coordination} value={answers.team_coordination as string} onChange={(value) => setAnswer('team_coordination', value)} />
          <MultiChoice id="tools" label="Which tools does your company rely on most often? Select all that apply." values={options.tools} value={(answers.tools as string[]) ?? []} onChange={(value) => setAnswer('tools', value)} />
          <MultiChoice id="desired_improvement" label="Which improvements would make the biggest difference to your business? Select all that apply." values={options.desired_improvement} value={(answers.desired_improvement as string[]) ?? []} onChange={(value) => setAnswer('desired_improvement', value)} />
        </div>
      </fieldset>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={state === 'sending'} className="rounded-xl bg-black px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-black/80 disabled:cursor-wait disabled:opacity-60">{state === 'sending' ? 'Sending your request…' : 'Request my free discovery call'}</button>
      <p className="text-xs leading-5 text-subtle">Free 30-minute call. No commitment. We’ll confirm your preferred time within 24 hours.</p>
    </form>
  );
}

function SingleChoice({ id, label, values, value, onChange }: { id: string; label: string; values: readonly string[]; value?: string; onChange: (value: string) => void }) {
  return <label htmlFor={id} className="block text-sm font-medium">{label}<select id={id} required value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputClass}><option value="" disabled>Select an answer</option>{values.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function MultiChoice({ id, label, values, value, onChange }: { id: string; label: string; values: readonly string[]; value: string[]; onChange: (value: string[]) => void }) {
  return <fieldset className="space-y-2"><legend className="text-sm font-medium">{label}</legend><div className="grid gap-2">{values.map((option, index) => {
    const checked = value.includes(option);
    return <label key={option} className="flex items-start gap-2 text-sm font-normal text-subtle"><input type="checkbox" name={`${id}-${index}`} checked={checked} onChange={() => onChange(checked ? value.filter((item) => item !== option) : [...value, option])} className="mt-0.5 accent-black" />{option}</label>;
  })}</div></fieldset>;
}
