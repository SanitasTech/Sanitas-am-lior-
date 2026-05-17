'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SectionCard from '@/components/SectionCard';
import SegmentedChoices from '@/components/SegmentedChoices';
import DepartmentGroups from '@/components/DepartmentGroups';
import {
  CONTACT_PREFS,
  CONTACT_TIMES,
  LANGUAGES,
  WORK_AUTH,
  PERMIT_STATUSES,
  YEARS_EXPERIENCE,
  MOBILITY,
  SHIFTS,
  START_AVAILABILITY,
  HOUSING_CHOICES,
  TRANSPORT_CHOICES,
  MANDATE_TYPES,
  PROFESSIONS,
  QUEBEC_REGIONS,
  professionRequiresPermit,
} from '@/lib/constants';
import type { Candidate, RegionChoice } from '@/types';

interface Props {
  initial: Candidate;
}

function emptyRegionChoice(region = ''): RegionChoice {
  return { region, all_region: true, cities: [] };
}

export default function ProfileForm({ initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: initial.first_name || '',
    last_name: initial.last_name || '',
    phone: initial.phone || '',
    email: initial.email || '',
    preferred_contact: initial.preferred_contact || '',
    best_contact_time: initial.best_contact_time || '',
    languages: initial.languages || [],
    work_authorization: initial.work_authorization || '',
    city_residence: initial.city_residence || '',
    region_residence: initial.region_residence || '',
    postal_code: initial.postal_code || '',
    profession: initial.profession || '',
    qualified_professions: initial.qualified_professions && initial.qualified_professions.length > 0
      ? initial.qualified_professions
      : initial.profession
        ? [initial.profession]
        : [],
    years_experience: initial.years_experience || '',
    permit_status: initial.permit_status || '',
    permit_number: initial.permit_number || '',
    mobility: initial.mobility || '',
    start_availability: initial.start_availability || '',
    preferred_hours: initial.preferred_hours || '',
    preferred_shifts: initial.preferred_shifts || [],
    preferred_mandate_types: initial.preferred_mandate_types || [],
    preferred_regions: (initial.preferred_regions && initial.preferred_regions.length > 0
      ? initial.preferred_regions
      : [emptyRegionChoice()]) as RegionChoice[],
    preferred_departments: initial.preferred_departments || [],
    preferred_establishments: initial.preferred_establishments || '',
    avoided_establishments: initial.avoided_establishments || '',
    housing_required: initial.housing_required || '',
    transport_available: initial.transport_available || '',
    mailing_list_opt_in: initial.mailing_list_opt_in ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [showSuccessPanel, setShowSuccessPanel] = useState(false);
  const [completionAfterSave, setCompletionAfterSave] = useState<number | null>(null);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 5000);
    return () => clearTimeout(t);
  }, [msg]);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function updateRegionChoice(idx: number, patch: Partial<RegionChoice>) {
    setForm((f) => ({
      ...f,
      preferred_regions: f.preferred_regions.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    }));
  }
  function addRegionChoice() {
    setForm((f) => ({ ...f, preferred_regions: [...f.preferred_regions, emptyRegionChoice()] }));
  }
  function removeRegionChoice(idx: number) {
    setForm((f) => ({
      ...f,
      preferred_regions: f.preferred_regions.filter((_, i) => i !== idx),
    }));
  }

  const needsPermit =
    professionRequiresPermit(form.profession) ||
    form.qualified_professions.some((profession) => professionRequiresPermit(profession));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setShowSuccessPanel(false);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Échec de la sauvegarde.');
      setMsg({ kind: 'success', text: 'Profil enregistré.' });
      setCompletionAfterSave(typeof json.completion === 'number' ? json.completion : null);
      setShowSuccessPanel(true);
      router.refresh();
      // Remonter vers le panneau de succès qui apparaît au-dessus du formulaire
      requestAnimationFrame(() => {
        document.getElementById('save-success-panel')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      });
    } catch (e: unknown) {
      setMsg({ kind: 'error', text: e instanceof Error ? e.message : 'Erreur.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {showSuccessPanel && (
        <div
          id="save-success-panel"
          className="rounded-2xl border border-success/30 bg-success-soft p-5 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success text-bg text-[20px]">
              ✓
            </span>
            <div className="flex-1">
              <h3 className="text-[17px] font-semibold text-fg">Profil enregistré.</h3>
              <p className="mt-1 text-[14.5px] text-fg-muted leading-relaxed">
                {completionAfterSave !== null
                  ? `Votre profil est complété à ${completionAfterSave}%. Vous pouvez maintenant postuler aux mandats — vos informations seront pré-remplies automatiquement.`
                  : 'Vous pouvez maintenant postuler aux mandats — vos informations seront pré-remplies automatiquement.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link href="/postes" className="btn-primary btn-sm">
                  Voir les postes ouverts
                </Link>
                <Link href="/postuler" className="btn-secondary btn-sm">
                  Envoyer une candidature spontanée
                </Link>
                <Link href="/mes-candidatures" className="btn-ghost btn-sm">
                  Mes candidatures
                </Link>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSuccessPanel(false)}
              aria-label="Fermer"
              className="text-fg-subtle hover:text-fg"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <SectionCard title="Coordonnées">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prénom" required>
            <input className="input" value={form.first_name} onChange={(e) => set('first_name', e.target.value)} />
          </Field>
          <Field label="Nom" required>
            <input className="input" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} />
          </Field>
          <Field label="Téléphone">
            <input className="input" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </Field>
          <Field label="Courriel">
            <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </Field>
        </div>
        <Field label="Meilleur moyen de contact">
          <SegmentedChoices options={CONTACT_PREFS} value={form.preferred_contact} onChange={(v) => set('preferred_contact', v as string)} />
        </Field>
        <Field label="Meilleur moment pour joindre">
          <SegmentedChoices options={CONTACT_TIMES} value={form.best_contact_time} onChange={(v) => set('best_contact_time', v as string)} />
        </Field>
        <Field label="Langues de travail">
          <SegmentedChoices options={LANGUAGES} value={form.languages} onChange={(v) => set('languages', v as string[])} multi />
        </Field>
        <Field label="Autorisation de travailler au Canada">
          <SegmentedChoices options={WORK_AUTH} value={form.work_authorization} onChange={(v) => set('work_authorization', v as string)} />
        </Field>
      </SectionCard>

      <SectionCard title="Lieu de résidence">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ville">
            <input className="input" value={form.city_residence} onChange={(e) => set('city_residence', e.target.value)} />
          </Field>
          <Field label="Région">
            <select className="input" value={form.region_residence} onChange={(e) => set('region_residence', e.target.value)}>
              <option value="">Choisir</option>
              {QUEBEC_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Code postal">
            <input className="input" value={form.postal_code} onChange={(e) => set('postal_code', e.target.value)} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Profession et expérience">
        <Field label="Profession">
          <select className="input" value={form.profession} onChange={(e) => {
            const next = e.target.value;
            setForm((current) => ({
              ...current,
              profession: next,
              qualified_professions: next && !current.qualified_professions.includes(next)
                ? [next, ...current.qualified_professions]
                : current.qualified_professions,
            }));
          }}>
            <option value="">Choisir</option>
            {PROFESSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Métiers admissibles" helper="Sélectionnez tous les titres pour lesquels votre dossier peut être présenté.">
          <SegmentedChoices
            options={PROFESSIONS}
            value={form.qualified_professions}
            onChange={(v) => {
              const next = v as string[];
              setForm((current) => ({
                ...current,
                qualified_professions: next,
                profession: current.profession && next.includes(current.profession)
                  ? current.profession
                  : next[0] || current.profession,
              }));
            }}
            multi
          />
        </Field>
        <Field label="Années d'expérience">
          <SegmentedChoices options={YEARS_EXPERIENCE} value={form.years_experience} onChange={(v) => set('years_experience', v as string)} />
        </Field>
        <Field label="Mobilité">
          <SegmentedChoices options={MOBILITY} value={form.mobility} onChange={(v) => set('mobility', v as string)} />
        </Field>
        {needsPermit && (
          <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
            <Field label="Permis d'exercice">
              <SegmentedChoices options={PERMIT_STATUSES} value={form.permit_status} onChange={(v) => set('permit_status', v as string)} />
            </Field>
            <Field label="Numéro de permis">
              <input className="input" value={form.permit_number} onChange={(e) => set('permit_number', e.target.value)} />
            </Field>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Disponibilités">
        <Field label="Quand pouvez-vous commencer ?">
          <SegmentedChoices options={START_AVAILABILITY} value={form.start_availability} onChange={(v) => set('start_availability', v as string)} />
        </Field>
        <Field label="Heures souhaitées">
          <input className="input" value={form.preferred_hours} onChange={(e) => set('preferred_hours', e.target.value)} placeholder="Ex. temps plein, 24 à 32 h" />
        </Field>
        <Field label="Quarts acceptés">
          <SegmentedChoices options={SHIFTS} value={form.preferred_shifts} onChange={(v) => set('preferred_shifts', v as string[])} multi />
        </Field>
        <Field label="Types de mandat recherchés">
          <SegmentedChoices options={MANDATE_TYPES} value={form.preferred_mandate_types} onChange={(v) => set('preferred_mandate_types', v as string[])} multi />
        </Field>
      </SectionCard>

      <SectionCard title="Géographie préférée" helper="Régions, villes, établissements qui vous intéressent.">
        <div className="space-y-3">
          {form.preferred_regions.map((rc, idx) => (
            <div key={idx} className="rounded-xl border border-border bg-surface p-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Field label={`Région ${idx + 1}`}>
                  <select className="input" value={rc.region} onChange={(e) => updateRegionChoice(idx, { region: e.target.value })}>
                    <option value="">Choisir</option>
                    {QUEBEC_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </Field>
                {form.preferred_regions.length > 1 && (
                  <button type="button" onClick={() => removeRegionChoice(idx)} className="btn-ghost btn-sm self-end">Retirer</button>
                )}
              </div>
              <label className="mt-3 inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="h-4 w-4 rounded border-border accent-fg" checked={rc.all_region} onChange={(e) => updateRegionChoice(idx, { all_region: e.target.checked, cities: e.target.checked ? [] : rc.cities })} />
                <span className="text-[14px] text-fg">Toute la région</span>
              </label>
              {!rc.all_region && (
                <div className="mt-3">
                  <Field label="Villes acceptées" helper="Séparées par des virgules.">
                    <input className="input" value={rc.cities.join(', ')} onChange={(e) => updateRegionChoice(idx, { cities: e.target.value.split(',').map((c) => c.trim()).filter(Boolean) })} />
                  </Field>
                </div>
              )}
            </div>
          ))}
          <button type="button" onClick={addRegionChoice} className="btn-secondary btn-sm">Ajouter une région</button>
        </div>

        <DepartmentGroups value={form.preferred_departments} onChange={(v) => set('preferred_departments', v)} label="Départements souhaités" />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Établissements souhaités">
            <textarea className="textarea" value={form.preferred_establishments} onChange={(e) => set('preferred_establishments', e.target.value)} />
          </Field>
          <Field label="Établissements à éviter">
            <textarea className="textarea" value={form.avoided_establishments} onChange={(e) => set('avoided_establishments', e.target.value)} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Logistique">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Hébergement requis">
            <SegmentedChoices options={HOUSING_CHOICES} value={form.housing_required} onChange={(v) => set('housing_required', v as string)} />
          </Field>
          <Field label="Transport disponible">
            <SegmentedChoices options={TRANSPORT_CHOICES} value={form.transport_available} onChange={(v) => set('transport_available', v as string)} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Communications">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="mt-1 h-4 w-4 rounded border-border accent-fg" checked={form.mailing_list_opt_in} onChange={(e) => set('mailing_list_opt_in', e.target.checked)} />
          <span className="text-[15px] text-fg leading-relaxed">
            Je souhaite recevoir les nouveaux besoins et mandats compatibles avec mon profil.
          </span>
        </label>
      </SectionCard>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Enregistrement…' : 'Enregistrer mon profil'}
        </button>
        {msg && (
          <span
            className={
              msg.kind === 'success'
                ? 'inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-[13.5px] font-medium text-success'
                : 'inline-flex items-center gap-1.5 rounded-full bg-danger-soft px-3 py-1 text-[13.5px] font-medium text-danger'
            }
            role="status"
          >
            {msg.kind === 'success' ? '✓' : '⚠'} {msg.text}
          </span>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  helper,
  children,
}: {
  label: string;
  required?: boolean;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
      {helper && <p className="helper mt-1.5">{helper}</p>}
    </div>
  );
}
