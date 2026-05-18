'use client';

import { useState } from 'react';
import { CONTACT_TYPES } from '@/lib/constants';
import { displayValue, type Locale } from '@/lib/i18n';
import { useLocale } from './I18nProvider';

export default function ContactForm({ locale: localeProp }: { locale?: Locale }) {
  const contextLocale = useLocale();
  const locale = localeProp || contextLocale;
  const [form, setForm] = useState({
    request_type: '',
    name: '',
    phone: '',
    email: '',
    message: '',
    consent_contact: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.message.trim()) {
      setError(locale === 'en' ? 'Name and message are required.' : 'Nom et message requis.');
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
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || (locale === 'en' ? 'Message failed to send.' : "Echec de l'envoi."));
      }
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : locale === 'en' ? 'Error.' : 'Erreur.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="card p-8 text-center">
        <h3 className="text-display-md text-fg">
          {locale === 'en' ? 'Thank you, your message has been sent.' : 'Merci, votre message a ete envoye.'}
        </h3>
        <p className="mt-3 text-fg-muted">
          {locale === 'en' ? 'We will get back to you quickly.' : 'Nous reviendrons vers vous rapidement.'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-6 sm:p-8 space-y-5">
      <div>
        <label className="label" htmlFor="c-type">
          {locale === 'en' ? 'Request type' : 'Type de demande'}
        </label>
        <select
          id="c-type"
          className="input"
          value={form.request_type}
          onChange={(e) => update('request_type', e.target.value)}
        >
          <option value="">{locale === 'en' ? 'Select' : 'Choisir'}</option>
          {CONTACT_TYPES.map((t) => (
            <option key={t} value={t}>
              {displayValue(locale, t)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="c-name">
            {locale === 'en' ? 'Name' : 'Nom'} *
          </label>
          <input
            id="c-name"
            className="input"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="c-phone">
            {locale === 'en' ? 'Phone' : 'Telephone'}
          </label>
          <input
            id="c-phone"
            className="input"
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="c-email">
            {locale === 'en' ? 'Email' : 'Courriel'}
          </label>
          <input
            id="c-email"
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="c-msg">
          {locale === 'en' ? 'Message' : 'Message'} *
        </label>
        <textarea
          id="c-msg"
          className="textarea"
          rows={5}
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
          required
        />
      </div>

      <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-border">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-border accent-fg"
          checked={form.consent_contact}
          onChange={(e) => update('consent_contact', e.target.checked)}
        />
        <span className="text-[14px] text-fg leading-relaxed">
          {locale === 'en'
            ? 'I agree to be contacted by Sanitas about this request.'
            : "J'accepte d'etre contacte par Sanitas concernant cette demande."}{' '}
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
            ? 'Send message'
            : 'Envoyer le message'}
      </button>
    </form>
  );
}
