export type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[][];
  }
}

export function trackAnalyticsEvent(eventName: string, params: AnalyticsParams = {}) {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    ((...args: unknown[]) => {
      window.dataLayer?.push(args);
    });

  const defaultParams: AnalyticsParams = {
    page_path: window.location.pathname,
    page_location: window.location.href,
    page_title: document.title,
  };

  const cleanedParams = Object.fromEntries(
    Object.entries({ ...defaultParams, ...params }).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  );

  window.gtag('event', eventName, cleanedParams);
}
