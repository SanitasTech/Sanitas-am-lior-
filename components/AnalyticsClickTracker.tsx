'use client';

import { useEffect } from 'react';
import { trackAnalyticsEvent } from '@/lib/analytics';

export default function AnalyticsClickTracker() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const element = target?.closest<HTMLElement>('[data-analytics-event]');
      if (!element) return;

      const eventName = element.dataset.analyticsEvent;
      if (!eventName) return;

      trackAnalyticsEvent(eventName, {
        label: element.dataset.analyticsLabel,
        job_id: element.dataset.analyticsJobId,
        job_title: element.dataset.analyticsJobTitle,
        location: element.dataset.analyticsLocation,
        href: element instanceof HTMLAnchorElement ? element.href : undefined,
      });
    }

    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}
