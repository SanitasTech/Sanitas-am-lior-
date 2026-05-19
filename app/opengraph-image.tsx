import { ImageResponse } from 'next/og';

const copy = {
  alt: 'Agence Sanitas - Mandats en sant\u00e9 au Qu\u00e9bec',
  title: 'Mandats en sant\u00e9 au Qu\u00e9bec',
  subtitle: 'Choisis tes r\u00e9gions, tes quarts et le type de mandat qui te convient.',
  chips: ['Infirmi\u00e8res', 'PAB', 'ASSS'],
  priority: 'Mandats prioritaires',
  bullets: ['R\u00e9gions au choix', 'Quarts flexibles', '\u00c9quipe locale'],
};

export const runtime = 'edge';
export const alt = copy.alt;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#f7fbfc',
          color: '#14252d',
          fontFamily: 'Arial, Helvetica, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: 430,
            height: '100%',
            background: '#dceff2',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 362,
            top: 0,
            width: 116,
            height: '100%',
            background: '#edf7f8',
            transform: 'skewX(-11deg)',
            transformOrigin: 'top',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 70,
            top: 62,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            color: '#2b8499',
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: 0,
            textTransform: 'uppercase',
          }}
        >
          <div
            style={{
              width: 48,
              height: 5,
              borderRadius: 5,
              background: '#2b8499',
            }}
          />
          Agence Sanitas
        </div>

        <div
          style={{
            position: 'relative',
            display: 'flex',
            width: '100%',
            height: '100%',
            padding: '112px 70px 54px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', width: 700 }}>
            <div
              style={{
                display: 'flex',
                fontSize: 67,
                lineHeight: 1.04,
                fontWeight: 850,
                letterSpacing: 0,
              }}
            >
              {copy.title}
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: 24,
                width: 630,
                fontSize: 31,
                lineHeight: 1.25,
                color: '#354f5a',
              }}
            >
              {copy.subtitle}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 34 }}>
              {copy.chips.map((item) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    borderRadius: 999,
                    border: '2px solid #bdd8de',
                    background: '#fbfefe',
                    padding: '11px 18px',
                    color: '#1f3c46',
                    fontSize: 23,
                    fontWeight: 800,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                marginTop: 'auto',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 242,
                  height: 72,
                  borderRadius: 999,
                  background: '#14252d',
                  color: '#f7fbfc',
                  padding: '0 30px',
                  fontSize: 26,
                  fontWeight: 850,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                }}
              >
                Voir les postes
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: '#667a83', fontSize: 21 }}>Postule en ligne</div>
                <div style={{ marginTop: 5, color: '#174b57', fontSize: 28, fontWeight: 850 }}>
                  agencesanitas.com
                </div>
              </div>
              <div
                style={{
                  width: 2,
                  height: 48,
                  borderRadius: 2,
                  background: '#c8dde2',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: '#667a83', fontSize: 21 }}>Appelle-nous</div>
                <div style={{ marginTop: 5, color: '#14252d', fontSize: 28, fontWeight: 850 }}>
                  450 973-9696
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginLeft: 'auto',
              width: 336,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 28,
                background: '#174b57',
                color: '#f7fbfc',
                padding: '32px 28px',
                boxShadow: '0 24px 60px rgba(20, 37, 45, 0.16)',
              }}
            >
              <div style={{ fontSize: 25, color: '#bde0e6', fontWeight: 800 }}>
                {copy.priority}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 26 }}>
                {copy.bullets.map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                    <div
                      style={{
                        display: 'flex',
                        width: 18,
                        height: 18,
                        borderRadius: 18,
                        background: '#9bd3dd',
                      }}
                    />
                    <div style={{ fontSize: 27, fontWeight: 750 }}>{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
