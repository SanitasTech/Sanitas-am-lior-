import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Agence Sanitas - Mandats en sante au Quebec';
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
            width: 410,
            height: '100%',
            background: '#dceff2',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 342,
            top: 0,
            width: 120,
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
            letterSpacing: 2.4,
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
            padding: '112px 70px 56px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', width: 690 }}>
            <div
              style={{
                display: 'flex',
                fontSize: 68,
                lineHeight: 1.02,
                fontWeight: 850,
                letterSpacing: -1.5,
              }}
            >
              Mandats en sante au Quebec
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: 24,
                width: 620,
                fontSize: 31,
                lineHeight: 1.25,
                color: '#354f5a',
              }}
            >
              Choisis tes regions, tes quarts et le type de mandat qui te convient.
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 34 }}>
              {['Infirmieres', 'PAB', 'ASSS'].map((item) => (
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
                  borderRadius: 999,
                  background: '#14252d',
                  color: '#f7fbfc',
                  padding: '18px 28px',
                  fontSize: 27,
                  fontWeight: 850,
                }}
              >
                Voir les postes
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: '#667a83', fontSize: 22 }}>Postule en ligne ou appelle-nous</div>
                <div style={{ marginTop: 5, color: '#14252d', fontSize: 27, fontWeight: 850 }}>
                  450 973-9696
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginLeft: 'auto',
              width: 330,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                width: 110,
                height: 110,
                borderRadius: 110,
                background: '#174b57',
                color: '#f7fbfc',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 48,
                fontWeight: 800,
                border: '4px solid rgba(255,255,255,0.78)',
                boxShadow: '0 18px 45px rgba(20, 37, 45, 0.18)',
              }}
            >
              S
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 28,
                background: '#174b57',
                color: '#f7fbfc',
                padding: '26px 26px',
                boxShadow: '0 24px 60px rgba(20, 37, 45, 0.16)',
              }}
            >
              <div style={{ fontSize: 24, color: '#bde0e6', fontWeight: 800 }}>
                Mandats prioritaires
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
                {['Regions au choix', 'Quarts flexibles', 'Equipe locale'].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        display: 'flex',
                        width: 18,
                        height: 18,
                        borderRadius: 18,
                        background: '#9bd3dd',
                      }}
                    />
                    <div style={{ fontSize: 26, fontWeight: 750 }}>{item}</div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                color: '#174b57',
                fontSize: 28,
                fontWeight: 850,
              }}
            >
              agencesanitas.com
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
