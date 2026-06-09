import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 96,
  height: 96,
};
export const contentType = 'image/png';

export default function Icon() {
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
          fontSize: 52,
          fontWeight: 850,
          letterSpacing: -2,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            width: 22,
            height: 4,
            borderRadius: 4,
            background: '#9bd3dd',
          }}
        />
        S
      </div>
    ),
    size,
  );
}
