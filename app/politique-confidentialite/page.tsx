import PublicLayout from '@/components/PublicLayout';
import { DecorativeBlob } from '@/components/Icons';
import { COMPANY } from '@/lib/constants';
import { publicPageMetadata } from '@/lib/seo';

export const metadata = publicPageMetadata({
  title: 'Politique de confidentialité',
  description: "Comment Agence Sanitas recueille, utilise et protège les informations des candidats et établissements.",
  path: '/politique-confidentialite',
  frPath: '/politique-confidentialite',
  enPath: '/en/privacy-policy',
});

export default function PolicyPage() {
  return (
    <PublicLayout>
      <section className="relative section pt-16 overflow-hidden">
        <DecorativeBlob className="absolute -top-32 -right-40 h-[450px] w-[450px] text-accent pointer-events-none" />
        <div className="container-page max-w-3xl relative">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
            Politique de confidentialité
          </p>
          <h1 className="mt-2 text-display-lg text-fg">Vos informations, en toute clarté.</h1>
          <p className="mt-5 text-[16px] leading-relaxed text-fg-muted max-w-prose">
            Cette page explique de façon simple comment Agence Sanitas recueille, utilise et protège
            vos informations. Une version juridique détaillée peut être fournie sur demande.
          </p>
        </div>
      </section>

      <section className="section pt-8 pb-24">
        <div className="container-page max-w-3xl prose-policy space-y-10">
          <Block title="Informations recueillies">
            Nous recueillons les informations que vous nous fournissez volontairement lorsque vous
            créez un profil candidat, postulez à un mandat, soumettez une demande d'établissement
            ou nous écrivez : nom, coordonnées, profession, disponibilités, préférences de mandat,
            documents pertinents et toute information complémentaire que vous souhaitez partager.
          </Block>

          <Block title="Pourquoi nous les recueillons">
            Vos informations servent uniquement à analyser votre candidature ou votre demande, à
            vous contacter, à vous proposer des mandats pertinents, et à effectuer le suivi du
            processus de placement avec les établissements concernés.
          </Block>

          <Block title="Inscription à nos communications">
            L'inscription à la liste des nouveaux besoins est optionnelle et nécessite votre
            consentement explicite. Vous pouvez vous désabonner à tout moment en nous écrivant.
          </Block>

          <Block title="Conservation et sécurité">
            Vos informations sont conservées de façon sécurisée. L'accès est limité aux membres
            autorisés de l'équipe Sanitas. Vos documents sont stockés dans un espace privé. Aucune
            donnée n'est partagée à des fins commerciales.
          </Block>

          <Block title="Vos droits">
            Vous pouvez en tout temps demander à consulter, corriger ou supprimer vos informations
            en nous écrivant à{' '}
            <a className="underline" href={COMPANY.emailHref}>
              {COMPANY.email}
            </a>
            . Nous répondons à toute demande dans un délai raisonnable.
          </Block>

          <Block title="Contact">
            Pour toute question concernant cette politique, écrivez-nous à{' '}
            <a className="underline" href={COMPANY.emailHref}>
              {COMPANY.email}
            </a>{' '}
            ou appelez le {COMPANY.phone}.
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
