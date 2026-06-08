import Script from 'next/script';

export default function GoogleAdsTag({ tagId }: { tagId?: string }) {
  const cleanedTagId = tagId?.trim();
  if (!cleanedTagId) {
    return null;
  }
  const normalizedTagId = cleanedTagId.startsWith('AW-') ? cleanedTagId : `AW-${cleanedTagId}`;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${normalizedTagId}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-tag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${normalizedTagId}');
        `}
      </Script>
    </>
  );
}
