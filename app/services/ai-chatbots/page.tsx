import type { Metadata } from 'next';
import { ServicePage, type ServicePageContent } from '@/components/site/ServicePage';

export const metadata: Metadata = {
  title: 'AI Chatbots & Assistants | ProbeTech',
  description: 'Add AI assistants to your website, WhatsApp, or internal tools using your own approved business information.',
  openGraph: { title: 'AI Chatbots & Assistants | ProbeTech', description: 'An assistant that answers customers while you sleep.', type: 'website' },
};

const content: ServicePageContent = {
  title: 'An assistant that answers customers while you sleep.',
  intro: 'We add AI assistants to your website, WhatsApp, or internal tools, trained on your own business information.',
  problemTitle: 'The problem',
  problem: 'Customers ask the same questions all day, and the ones who message after hours often go elsewhere. A good assistant answers instantly, qualifies leads, and hands off to a human when it should.',
  sections: [
    { title: 'What it can do', items: [
      { title: 'Answer common questions', description: 'Answer product, pricing, and policy questions from your own content.' },
      { title: 'Qualify leads', description: 'Qualify leads and collect their details.' },
      { title: 'Book appointments', description: 'Book appointments and consultations.' },
      { title: 'Hand off conversations', description: 'Hand complex conversations to a human with full context.' },
      { title: 'Support your team', description: 'Support your internal team by searching your own documents.' },
    ] },
    { title: 'Where it lives', description: 'Your website, WhatsApp, or inside your existing platform.' },
    { title: 'How we keep it trustworthy', description: 'An assistant that makes things up is worse than none. We ground answers in your approved content, set clear boundaries on what it will and won’t answer, and route anything uncertain to a person.' },
    { title: 'How it works', items: [
      { title: 'Gather your content', description: 'We gather your FAQs, documents, and common conversations.' },
      { title: 'Build and test', description: 'We build and test the assistant against real customer questions.' },
      { title: 'Launch', description: 'We launch on your chosen channel.' },
      { title: 'Review and improve', description: 'We review conversations and improve it over time.' },
    ] },
  ],
  timeline: '[1 to 3 weeks, ADJUST]',
  fit: 'You answer the same questions repeatedly, lose enquiries outside working hours, or want to qualify leads before a human gets involved.',
  cta: 'Want to see what an assistant would look like for your business?',
};

export default function AIChatbotsPage() { return <ServicePage content={content} />; }
