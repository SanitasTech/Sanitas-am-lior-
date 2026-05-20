'use client';

import { useEffect } from 'react';

const DEFAULT_EVENT_NAME = 'ads_conversion_Envoi_de_formulaire_pou_1';

export default function GoogleAdsConversionEvent({
  eventName = DEFAULT_EVENT_NAME,
}: {
  eventName?: string;
}) {
  useEffect(() => {
    const win = window as typeof window & {
      dataLayer?: unknown[][];
      gtag?: (...args: unknown[]) => void;
    };

    win.dataLayer = win.dataLayer || [];
    win.gtag =
      win.gtag ||
      ((...args: unknown[]) => {
        win.dataLayer?.push(args);
      });

    win.gtag('event', eventName, {});
  }, [eventName]);

  return null;
}
