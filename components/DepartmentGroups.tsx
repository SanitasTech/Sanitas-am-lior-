'use client';

import { useState } from 'react';
import { DEPARTMENT_GROUPS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface DepartmentGroupsProps {
  value: string[];
  onChange: (next: string[]) => void;
  label?: string;
}

export default function DepartmentGroups({ value, onChange, label }: DepartmentGroupsProps) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    // Ouvrir le premier groupe par défaut, plus tout groupe ayant des items sélectionnés.
    const initial = new Set<string>([DEPARTMENT_GROUPS[0].label]);
    for (const g of DEPARTMENT_GROUPS) {
      if (g.items.some((i) => value.includes(i))) initial.add(g.label);
    }
    return initial;
  });

  function toggleItem(item: string) {
    const next = new Set(value);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    onChange(Array.from(next));
  }

  function toggleGroup(label: string) {
    const next = new Set(openGroups);
    if (next.has(label)) next.delete(label);
    else next.add(label);
    setOpenGroups(next);
  }

  return (
    <div className="space-y-2.5">
      {label && <p className="label">{label}</p>}
      <div className="space-y-2">
        {DEPARTMENT_GROUPS.map((group) => {
          const isOpen = openGroups.has(group.label);
          const groupCount = group.items.filter((i) => value.includes(i)).length;
          return (
            <div key={group.label} className="rounded-xl border border-border bg-surface">
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-[14.5px] font-medium text-fg">{group.label}</span>
                  {groupCount > 0 && (
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[12px] font-medium text-accent">
                      {groupCount}
                    </span>
                  )}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={cn('text-fg-muted transition-transform', isOpen && 'rotate-180')}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {isOpen && (
                <div className="border-t border-border px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => {
                      const active = value.includes(item);
                      return (
                        <button
                          type="button"
                          key={item}
                          onClick={() => toggleItem(item)}
                          aria-pressed={active}
                          className={cn('chip', active && 'chip-active')}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
