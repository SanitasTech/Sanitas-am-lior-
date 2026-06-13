'use client';

import { useEffect } from 'react';
import { trackAnalyticsEvent } from '@/lib/analytics';

const DEFAULT_EVENT_NAME = 'ads_conversion_Envoi_de_formulaire_pou_1';
const SANITAS_GOOGLE_ADS_ID = 'AW-16550539966';
const SANITAS_CONVERSION_LABEL = 'gsbxCNi-wLgaEL7l9NM9';
const DEFAULT_CONVERSION_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || SANITAS_GOOGLE_ADS_ID;
const DEFAULT_CONVERSION_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL || SANITAS_CONVERSION_LABEL;

function normalizeSanitasConversionLabel(label: string) {
  return label.toLowerCase() === SANITAS_CONVERSION_LABEL.toLowerCase()
    ? SANITAS_CONVERSION_LABEL
    : label;
}

export default function GoogleAdsConversionEvent({
  eventName = DEFAULT_EVENT_NAME,
  conversionId = DEFAULT_CONVERSION_ID,
  conversionLabel = DEFAULT_CONVERSION_LABEL,
  transactionId,
}: {
  eventName?: string;
  conversionId?: string;
  conversionLabel?: string;
  transactionId?: string | null;
}) {
  useEffect(() => {
    const dedupeKey = `sanitas-conversion:${eventName}:${transactionId || window.location.href}`;
    if (window.sessionStorage.getItem(dedupeKey)) {
      return;
    }
    window.sessionStorage.setItem(dedupeKey, '1');

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

    const eventParams = {
      ...(transactionId ? { transaction_id: transactionId } : {}),
    };

    const cleanedConversionId = conversionId?.trim();
    const cleanedConversionLabel = conversionLabel
      ? normalizeSanitasConversionLabel(conversionLabel.trim())
      : undefined;

    if (cleanedConversionId && cleanedConversionLabel) {
      const normalizedConversionId = cleanedConversionId.startsWith('AW-')
        ? cleanedConversionId
        : `AW-${cleanedConversionId}`;

      win.gtag('event', 'conversion', {
        send_to: `${normalizedConversionId}/${cleanedConversionLabel}`,
        ...eventParams,
      });
    }

    win.gtag('event', eventName, eventParams);
    trackAnalyticsEvent('candidate_application_thank_you', {
      application_id: transactionId || undefined,
      source_event: eventName,
    });
  }, [conversionId, conversionLabel, eventName, transactionId]);

  return null;
}
