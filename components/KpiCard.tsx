interface KpiCardProps {
  label: string;
  value: number | string;
  hint?: string;
}

export default function KpiCard({ label, value, hint }: KpiCardProps) {
  return (
    <div className="card p-4 sm:p-5">
      <p className="text-[12.5px] font-medium uppercase tracking-wider text-fg-subtle">{label}</p>
      <p className="mt-2 text-[26px] font-semibold tracking-tight text-fg tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-[12.5px] text-fg-muted">{hint}</p>}
    </div>
  );
}
