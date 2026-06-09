import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#174b57',
          color: '#f7fbfc',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 98,
          fontWeight: 850,
          letterSpacing: -4,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 38,
            left: 38,
            width: 42,
            height: 7,
            borderRadius: 7,
            background: '#9bd3dd',
          }}
        />
        S
      </div>
    ),
    size,
  );
}
