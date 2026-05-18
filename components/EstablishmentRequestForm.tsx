'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QUEBEC_REGIONS, PROFESSIONS, ALL_DEPARTMENTS, SHIFTS, URGENCY_LEVELS, URGENCY_LABELS } from '@/lib/constants';
import { displayValue, localizedPath, optionLabel, type Locale } from '@/lib/i18n';
import { useLocale } from './I18nProvider';

export default function EstablishmentRequestForm({ locale: localeProp }: { locale?: Locale }) {
  const contextLocale = useLocale();
  const locale = localeProp || contextLocale;
  const router = useRouter();
  const [form, setForm] = useState({
    establishment: '',
    contact_name: '',
    function_title: '',
    phone: '',
    email: '',
    region: '',
    city: '',
    department: '',
    profession_requested: '',
    number_of_resources: '',
    shift: '',
    start_date: '',
    duration: '',
    urgency: 'normal',
    details: '',
    consent_contact: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.establishment.trim() || !form.contact_name.trim() || !form.profession_requested) {
      setError(
        locale === 'en'
          ? 'Facility, contact person and profession are required.'
          : 'Etablissement, personne contact et profession sont requis.'
      );
      return;
    }
    if (!form.phone.trim() && !form.email.trim()) {
      setError(locale === 'en' ? 'Phone or email is required.' : 'Telephone ou courriel requis.');
      return;
    }
    if (!form.consent_contact) {
      setError(locale === 'en' ? 'Consent is required.' : 'Le consentement est obligatoire.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        number_of_resources: form.number_of_resources ? Number(form.number_of_resources) : null,
      };
      const res = await fetch('/api/establishment-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || (locale === 'en' ? 'Request failed to send.' : "Echec de l'envoi."));
      }
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : locale === 'en' ? 'Unknown error.' : 'Erreur inconnue.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="card p-8 text-center">
        <h3 className="text-display-md text-fg">
          {locale === 'en' ? 'Your request has been received.' : 'Votre demande a bien ete recue.'}
        </h3>
        <p className="mt-3 text-fg-muted max-w-prose mx-auto leading-relaxed">
          {locale === 'en'
            ? 'A Sanitas team member will contact you quickly to review your need and suggest suitable profiles.'
            : "Un membre de l'equipe Sanitas vous contactera rapidement pour analyser votre besoin et proposer des profils adaptes."}
        </p>
        <button type="button" onClick={() => router.push(localizedPath(locale, 'home'))} className="btn-primary mt-6">
          {locale === 'en' ? 'Back to home' : "Retour a l'accueil"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-6 sm:p-8 space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={locale === 'en' ? 'Facility name' : "Nom de l'etablissement"} required>
          <input className="input" value={form.establishment} onChange={(e) => update('establishment', e.target.value)} required />
        </Field>
        <Field label={locale === 'en' ? 'Contact person' : 'Personne contact'} required>
          <input className="input" value={form.contact_name} onChange={(e) => update('contact_name', e.target.value)} required />
        </Field>
        <Field label={locale === 'en' ? 'Role' : 'Fonction'}>
          <input className="input" value={form.function_title} onChange={(e) => update('function_title', e.target.value)} />
        </Field>
        <Field label={locale === 'en' ? 'Phone' : 'Telephone'}>
          <input className="input" type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        </Field>
        <Field label={locale === 'en' ? 'Email' : 'Courriel'}>
          <input className="input" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
        </Field>
        <Field label={locale === 'en' ? 'Region' : 'Region'}>
          <select className="input" value={form.region} onChange={(e) => update('region', e.target.value)}>
            <option value="">{locale === 'en' ? 'Select' : 'Choisir'}</option>
            {QUEBEC_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
        <Field label={locale === 'en' ? 'City' : 'Ville'}>
          <input className="input" value={form.city} onChange={(e) => update('city', e.target.value)} />
        </Field>
        <Field label={locale === 'en' ? 'Department' : 'Departement'}>
          <select className="input" value={form.department} onChange={(e) => update('department', e.target.value)}>
            <option value="">{locale === 'en' ? 'Select' : 'Choisir'}</option>
            {ALL_DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {displayValue(locale, d)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={locale === 'en' ? 'Profession requested' : 'Profession recherchee'} required>
          <select
            className="input"
            value={form.profession_requested}
            onChange={(e) => update('profession_requested', e.target.value)}
            required
          >
            <option value="">{locale === 'en' ? 'Select a profession' : 'Choisir une profession'}</option>
            {PROFESSIONS.map((p) => (
              <option key={p} value={p}>
                {optionLabel(locale, p)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={locale === 'en' ? 'Number of resources' : 'Nombre de ressources'}>
          <input
            className="input"
            type="number"
            min={1}
            value={form.number_of_resources}
            onChange={(e) => update('number_of_resources', e.target.value)}
          />
        </Field>
        <Field label={locale === 'en' ? 'Shift' : 'Quart'}>
          <select className="input" value={form.shift} onChange={(e) => update('shift', e.target.value)}>
            <option value="">{locale === 'en' ? 'Select' : 'Choisir'}</option>
            {SHIFTS.map((s) => (
              <option key={s} value={s}>
                {displayValue(locale, s)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={locale === 'en' ? 'Start date' : 'Date de debut'}>
          <input className="input" type="date" value={form.start_date} onChange={(e) => update('start_date', e.target.value)} />
        </Field>
        <Field label={locale === 'en' ? 'Estimated duration' : 'Duree estimee'}>
          <input
            className="input"
            placeholder={locale === 'en' ? 'Ex. 3 months' : 'Ex. 3 mois'}
            value={form.duration}
            onChange={(e) => update('duration', e.target.value)}
          />
        </Field>
        <Field label={locale === 'en' ? 'Urgency level' : "Niveau d'urgence"}>
          <select className="input" value={form.urgency} onChange={(e) => update('urgency', e.target.value)}>
            {URGENCY_LEVELS.map((u) => (
              <option key={u} value={u}>
                {locale === 'en' ? (u === 'high' ? 'Priority' : u === 'normal' ? 'Regular' : 'Urgent') : URGENCY_LABELS[u]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={locale === 'en' ? 'Need details' : 'Details du besoin'}>
        <textarea
          className="textarea"
          rows={4}
          value={form.details}
          onChange={(e) => update('details', e.target.value)}
          placeholder={locale === 'en' ? 'Notes, context, requirements...' : 'Particularites, contexte, exigences...'}
        />
      </Field>

      <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-border">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-border accent-fg"
          checked={form.consent_contact}
          onChange={(e) => update('consent_contact', e.target.checked)}
        />
        <span className="text-[14px] text-fg leading-relaxed">
          {locale === 'en'
            ? 'I agree that Sanitas may use this information to process the request and contact us.'
            : "J'accepte que Sanitas utilise mes informations pour traiter cette demande et nous contacter."}{' '}
          <span className="text-danger">*</span>
        </span>
      </label>

      {error && (
        <div className="rounded-xl border border-danger/40 bg-danger-soft px-4 py-3 text-[14px] text-danger">
          {error}
        </div>
      )}

      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting
          ? locale === 'en'
            ? 'Sending...'
            : 'Envoi...'
          : locale === 'en'
            ? 'Send request'
            : 'Envoyer ma demande'}
      </button>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
    </div>
  );
}
