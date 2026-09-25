import type { Metadata } from 'next';
import { ServicePage, type ServicePageContent } from '@/components/site/ServicePage';

export const metadata: Metadata = {
  title: 'Custom Software | ProbeTech',
  description: 'Platforms, dashboards, and portals designed around how your business actually works.',
  openGraph: { title: 'Custom Software | ProbeTech', description: 'Software built around how your business actually works.', type: 'website' },
};

const content: ServicePageContent = {
  title: 'Software built around how your business actually works.',
  intro: 'When off-the-shelf tools don’t fit, we build platforms, dashboards, and portals designed for your process.',
  problemTitle: 'The problem',
  problem: 'Spreadsheets stop scaling. Generic tools force you to bend your process around them. Custom software fits the way you work instead.',
  sections: [
    { title: 'What we build', items: [
      { title: 'Web platforms and client portals' },
      { title: 'Internal dashboards and admin tools' },
      { title: 'Content management systems' },
      { title: 'Booking, ordering, and workflow systems' },
      { title: 'System integrations', description: 'Integrations between systems that don’t talk to each other.' },
    ] },
    { title: 'Our approach', description: 'We build in short cycles and show you working software early, so you steer the product while it’s being made, not after it’s finished.' },
  ],
  timeline: '[scope-dependent; provided in the proposal]',
  fit: 'You’ve outgrown spreadsheets, your process is unique, or no existing tool does what you need.',
  cta: 'Let’s understand the process your software needs to support.',
};

export default function CustomSoftwarePage() { return <ServicePage content={content} />; }
