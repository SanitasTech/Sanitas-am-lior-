import Script from 'next/script';

interface GoogleAdsTagProps {
  tagId?: string;
  analyticsId?: string;
}

function normalizeAdsId(tagId?: string) {
  const cleanedTagId = tagId?.trim();
  if (!cleanedTagId) return null;
  return cleanedTagId.startsWith('AW-') ? cleanedTagId : `AW-${cleanedTagId}`;
}

function normalizeAnalyticsId(analyticsId?: string) {
  return analyticsId?.trim() || null;
}

export default function GoogleAdsTag({ tagId, analyticsId }: GoogleAdsTagProps) {
  const normalizedAdsId = normalizeAdsId(tagId);
  const normalizedAnalyticsId = normalizeAnalyticsId(analyticsId);
  const configIds = Array.from(new Set([normalizedAdsId, normalizedAnalyticsId].filter(Boolean)));
  const primaryTagId = configIds[0];

  if (!primaryTagId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryTagId}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-tag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${configIds.map((id) => `gtag('config', '${id}');`).join('\n          ')}
        `}
      </Script>
    </>
  );
}
