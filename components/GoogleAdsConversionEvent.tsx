'use client';

import { useEffect } from 'react';

const DEFAULT_EVENT_NAME = 'ads_conversion_Envoi_de_formulaire_pou_1';
const DEFAULT_CONVERSION_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const DEFAULT_CONVERSION_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;

export default function GoogleAdsConversionEvent({
  eventName = DEFAULT_EVENT_NAME,
  conversionId = DEFAULT_CONVERSION_ID,
  conversionLabel = DEFAULT_CONVERSION_LABEL,
}: {
  eventName?: string;
  conversionId?: string;
  conversionLabel?: string;
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

    if (conversionId && conversionLabel) {
      const normalizedConversionId = conversionId.startsWith('AW-')
        ? conversionId
        : `AW-${conversionId}`;

      win.gtag('event', 'conversion', {
        send_to: `${normalizedConversionId}/${conversionLabel}`,
      });
      return;
    }

    win.gtag('event', eventName, {});
  }, [conversionId, conversionLabel, eventName]);

  return null;
}
