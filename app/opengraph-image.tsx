import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Agence Sanitas - Mandats en santé au Québec';
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
          background: '#f8fbfc',
          color: '#16242c',
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
            width: 450,
            height: '100%',
            background: '#dfeff2',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 380,
            top: 0,
            width: 120,
            height: '100%',
            background: '#eef6f8',
            transform: 'skewX(-12deg)',
            transformOrigin: 'top',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 80,
            bottom: 88,
            width: 340,
            height: 340,
            borderRadius: 340,
            background: '#184653',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 248,
              height: 248,
              borderRadius: 248,
              border: '4px solid rgba(248, 251, 252, 0.75)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f8fbfc',
            }}
          >
            <div style={{ fontSize: 70, lineHeight: 1, fontWeight: 700 }}>S</div>
            <div style={{ marginTop: 14, fontSize: 22, letterSpacing: 3, textTransform: 'uppercase' }}>
              Sanitas
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            padding: '70px 76px 58px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', width: 720 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                color: '#2b8499',
                fontSize: 25,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 2,
              }}
            >
              <span
                style={{
                  width: 54,
                  height: 6,
                  borderRadius: 6,
                  background: '#2b8499',
                }}
              />
              Agence Sanitas
            </div>

            <div
              style={{
                marginTop: 34,
                fontSize: 72,
                lineHeight: 0.98,
                fontWeight: 800,
                letterSpacing: -2,
              }}
            >
              Mandats en santé au Québec
            </div>

            <div
              style={{
                marginTop: 30,
                width: 650,
                fontSize: 32,
                lineHeight: 1.28,
                color: '#344d58',
              }}
            >
              Choisis tes régions, tes quarts et le type de mandat qui te convient.
            </div>

            <div style={{ display: 'flex', gap: 14, marginTop: 38, flexWrap: 'wrap' }}>
              {['Infirmières', 'PAB', 'ASSS', 'Mandats prioritaires'].map((item) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    borderRadius: 999,
                    border: '2px solid #c7dce2',
                    background: 'rgba(248, 251, 252, 0.92)',
                    padding: '12px 18px',
                    color: '#1f3a45',
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: '#6a7d86', fontSize: 24 }}>Postule en ligne ou appelle-nous</div>
              <div style={{ marginTop: 8, color: '#16242c', fontSize: 30, fontWeight: 800 }}>
                agencesanitas.com · 450 973-9696
              </div>
            </div>
            <div
              style={{
                marginRight: 378,
                display: 'flex',
                borderRadius: 999,
                background: '#16242c',
                color: '#f8fbfc',
                padding: '15px 24px',
                fontSize: 24,
                fontWeight: 800,
              }}
            >
              Voir les postes
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
