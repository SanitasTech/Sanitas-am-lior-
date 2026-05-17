'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QUEBEC_REGIONS, PROFESSIONS, ALL_DEPARTMENTS, SHIFTS, URGENCY_LEVELS, URGENCY_LABELS } from '@/lib/constants';

export default function EstablishmentRequestForm() {
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

  function update<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.establishment.trim() || !form.contact_name.trim() || !form.profession_requested) {
      setError('Établissement, personne contact et profession sont requis.');
      return;
    }
    if (!form.phone.trim() && !form.email.trim()) {
      setError('Téléphone ou courriel requis.');
      return;
    }
    if (!form.consent_contact) {
      setError('Le consentement est obligatoire.');
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
      if (!res.ok || !json.ok) throw new Error(json.error || 'Échec de l\'envoi.');
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="card p-8 text-center">
        <h3 className="text-display-md text-fg">Votre demande a bien été reçue.</h3>
        <p className="mt-3 text-fg-muted max-w-prose mx-auto leading-relaxed">
          Un membre de l'équipe Sanitas vous contactera rapidement pour analyser votre besoin et
          proposer des profils adaptés.
        </p>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="btn-primary mt-6"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-6 sm:p-8 space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom de l'établissement" required>
          <input
            className="input"
            value={form.establishment}
            onChange={(e) => update('establishment', e.target.value)}
            required
          />
        </Field>
        <Field label="Personne contact" required>
          <input
            className="input"
            value={form.contact_name}
            onChange={(e) => update('contact_name', e.target.value)}
            required
          />
        </Field>
        <Field label="Fonction">
          <input
            className="input"
            value={form.function_title}
            onChange={(e) => update('function_title', e.target.value)}
          />
        </Field>
        <Field label="Téléphone">
          <input
            className="input"
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
          />
        </Field>
        <Field label="Courriel">
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </Field>
        <Field label="Région">
          <select
            className="input"
            value={form.region}
            onChange={(e) => update('region', e.target.value)}
          >
            <option value="">Choisir</option>
            {QUEBEC_REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </Field>
        <Field label="Ville">
          <input
            className="input"
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
          />
        </Field>
        <Field label="Département">
          <select
            className="input"
            value={form.department}
            onChange={(e) => update('department', e.target.value)}
          >
            <option value="">Choisir</option>
            {ALL_DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </Field>
        <Field label="Profession recherchée" required>
          <select
            className="input"
            value={form.profession_requested}
            onChange={(e) => update('profession_requested', e.target.value)}
            required
          >
            <option value="">Choisir une profession</option>
            {PROFESSIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>
        <Field label="Nombre de ressources">
          <input
            className="input"
            type="number"
            min={1}
            value={form.number_of_resources}
            onChange={(e) => update('number_of_resources', e.target.value)}
          />
        </Field>
        <Field label="Quart">
          <select
            className="input"
            value={form.shift}
            onChange={(e) => update('shift', e.target.value)}
          >
            <option value="">Choisir</option>
            {SHIFTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Date de début">
          <input
            className="input"
            type="date"
            value={form.start_date}
            onChange={(e) => update('start_date', e.target.value)}
          />
        </Field>
        <Field label="Durée estimée">
          <input
            className="input"
            placeholder="Ex. 3 mois"
            value={form.duration}
            onChange={(e) => update('duration', e.target.value)}
          />
        </Field>
        <Field label="Niveau d'urgence">
          <select
            className="input"
            value={form.urgency}
            onChange={(e) => update('urgency', e.target.value)}
          >
            {URGENCY_LEVELS.map((u) => (
              <option key={u} value={u}>{URGENCY_LABELS[u]}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Détails du besoin">
        <textarea
          className="textarea"
          rows={4}
          value={form.details}
          onChange={(e) => update('details', e.target.value)}
          placeholder="Particularités, contexte, exigences..."
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
          J'accepte que Sanitas utilise mes informations pour traiter cette demande et nous
          contacter. <span className="text-danger">*</span>
        </span>
      </label>

      {error && (
        <div className="rounded-xl border border-danger/40 bg-danger-soft px-4 py-3 text-[14px] text-danger">
          {error}
        </div>
      )}

      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? 'Envoi…' : 'Envoyer ma demande'}
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
