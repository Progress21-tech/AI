import type { Metadata } from 'next';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';

export const metadata: Metadata = {
  title: 'Privacy Policy | ProbeTech',
  description: 'Privacy policy template for ProbeTech. Final legal wording is pending review.',
  alternates: { canonical: '/privacy-policy' },
  openGraph: { title: 'Privacy Policy | ProbeTech', description: 'Privacy policy template for ProbeTech.', type: 'website' },
};

const sections = [
  { title: 'What data we collect', body: 'Discovery-call requests may include your name, email address, WhatsApp number, business name and details, and information about the business problem you describe.' },
  { title: 'Why we collect it', body: 'We use the information to respond to discovery-call requests and, where you choose to work with us, to provide services.' },
  { title: 'How it is stored', body: 'Discovery-call submissions are stored in a Supabase database. The website is hosted on Vercel. Final wording about retention, security controls, and storage locations requires legal review.' },
  { title: 'When information is shared', body: 'ProbeTech does not sell this information. It is shared only with service providers required to run the business, including Supabase for database storage and Resend for confirmation and notification emails.' },
  { title: 'Access or deletion requests', body: 'To ask for access to or deletion of your information, contact us using this method: [CONTACT METHOD: add an email address or other contact method].' },
];

export default function PrivacyPolicyPage() {
  return <>
    <SiteHeader />
    <main className="public-site mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-subtle">Privacy Policy</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Privacy Policy</h1>
        <p className="mt-5 rounded-xl border border-black/15 bg-surface p-4 text-sm leading-6"><strong>PLACEHOLDER — final legal review needed before this page goes live.</strong> The information below describes the current website setup and is not final legal wording.</p>
      </div>
      <div className="mt-12 divide-y divide-black/10 border-y border-black/10">
        {sections.map((section) => <section key={section.title} className="grid gap-4 py-7 sm:grid-cols-[12rem_1fr] sm:gap-8"><h2 className="font-semibold tracking-tight">{section.title}</h2><p className="max-w-3xl text-sm leading-7 text-subtle">{section.body}</p></section>)}
      </div>
      <p className="mt-8 text-sm text-subtle">[PLACEHOLDER: final legal review needed before this page goes live]</p>
    </main>
    <SiteFooter />
  </>;
}
