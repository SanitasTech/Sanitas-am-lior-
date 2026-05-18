import type { Metadata } from 'next';
import PublicLayout from '@/components/PublicLayout';
import { DecorativeBlob } from '@/components/Icons';
import { COMPANY } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'How Agence Sanitas collects, uses and protects your information.',
  alternates: { canonical: '/en/privacy-policy', languages: { fr: '/politique-confidentialite', en: '/en/privacy-policy' } },
};

export default function EnglishPrivacyPolicyPage() {
  return (
    <PublicLayout locale="en">
      <section className="relative section pt-16 overflow-hidden">
        <DecorativeBlob className="absolute -top-32 -right-40 h-[450px] w-[450px] text-accent pointer-events-none" />
        <div className="container-page max-w-3xl relative">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Privacy policy</p>
          <h1 className="mt-2 text-display-lg text-fg">Your information, clearly explained.</h1>
          <p className="mt-5 text-[16px] leading-relaxed text-fg-muted max-w-prose">
            This page explains simply how Agence Sanitas collects, uses and protects your information. A detailed legal version can be provided on request.
          </p>
        </div>
      </section>

      <section className="section pt-8 pb-24">
        <div className="container-page max-w-3xl prose-policy space-y-10">
          <Block title="Information collected">
            We collect information you voluntarily provide when you create a candidate profile, apply to an assignment, submit a facility request or contact us: name, contact details, profession, availability, assignment preferences, relevant documents and any additional information you choose to share.
          </Block>
          <Block title="Why we collect it">
            Your information is used only to review your application or request, contact you, suggest relevant assignments and follow the placement process with the facilities involved.
          </Block>
          <Block title="Communications">
            Opting in to receive new needs and assignments is optional and requires your explicit consent. You may unsubscribe at any time by writing to us.
          </Block>
          <Block title="Retention and security">
            Your information is stored securely. Access is limited to authorized Sanitas team members. Your documents are stored in a private area. No data is shared for commercial purposes.
          </Block>
          <Block title="Your rights">
            You may ask to view, correct or delete your information at any time by writing to{' '}
            <a className="underline" href={COMPANY.emailHref}>{COMPANY.email}</a>. We respond to requests within a reasonable time.
          </Block>
          <Block title="Contact">
            For any question about this policy, write to{' '}
            <a className="underline" href={COMPANY.emailHref}>{COMPANY.email}</a> or call {COMPANY.phone}.
          </Block>
        </div>
      </section>
    </PublicLayout>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[20px] font-semibold text-fg">{title}</h2>
      <p className="mt-3 max-w-prose text-[15.5px] leading-relaxed text-fg-muted">{children}</p>
    </section>
  );
}
