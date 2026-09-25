import type { Metadata } from 'next';
import { ServicePage, type ServicePageContent } from '@/components/site/ServicePage';

export const metadata: Metadata = {
  title: 'AI Automation | ProbeTech',
  description: 'Automate repetitive business work with reliable workflows that connect the tools your team already uses.',
  openGraph: { title: 'AI Automation | ProbeTech', description: 'Automate the work that eats your team’s week.', type: 'website' },
};

const content: ServicePageContent = {
  title: 'Automate the work that eats your team’s week.',
  intro: 'We connect the tools you already use and build workflows that run reliably without supervision.',
  problemTitle: 'The problem',
  problem: "If your team does the same manual task several times a week, you're paying skilled people to act like machines. That's slow, it's error-prone, and it doesn't scale. Automation gives that time back and makes the process consistent every time.",
  sections: [
    { title: 'What we automate', items: [
      { title: 'Lead capture and follow-up', description: 'Capture enquiries and keep follow-up moving on time.' },
      { title: 'Data entry and syncing', description: 'Move information between the tools your team already uses.' },
      { title: 'Reporting', description: 'Gather information and prepare recurring reports.' },
      { title: 'Client onboarding', description: 'Coordinate the steps and information needed to get started.' },
      { title: 'Invoicing and payment reminders', description: 'Prepare invoices and send timely reminders.' },
      { title: 'Internal notifications', description: 'Keep the right people informed when work needs attention.' },
      { title: 'Document processing', description: 'Extract and route information from business documents.' },
    ] },
    { title: 'How it works', items: [
      { title: 'Map the process', description: 'We map your current process and find where time is lost.' },
      { title: 'Design the workflow', description: 'We design the workflow and confirm it with you before building.' },
      { title: 'Build and launch', description: 'We build, test against real and messy inputs, and launch.' },
      { title: 'Monitor and support', description: 'We monitor it and fix issues so it keeps working.' },
    ] },
    { title: 'Built to run unattended', description: 'Most automations fail quietly. Ours include error handling, retries, and alerts, so when something goes wrong, you hear about it immediately instead of discovering it a month later.' },
  ],
  timeline: '[1 to 4 weeks, ADJUST]',
  fit: "Your team repeats the same task weekly, you use several tools that don't talk to each other, or you're losing leads to slow follow-up.",
  cta: 'Not sure what to automate? That’s what the discovery call is for.',
  faqs: [
    { question: 'Do we have to change our tools?', answer: 'No. We connect what you already use.' },
    { question: 'What happens if it breaks?', answer: 'Every project includes a support period, and you’re alerted to failures.' },
    { question: 'Can it handle exceptions?', answer: 'Yes. Anything unusual gets routed to a person rather than guessed at.' },
  ],
};

export default function AIAutomationPage() { return <ServicePage content={content} />; }
