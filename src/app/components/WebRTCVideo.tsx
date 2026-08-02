'use client';

import { useEffect, useState } from 'react';

export function WebRTCVideo() {
  const [isMobile, setIsMobile] = useState(false);
  const [started, setStarted] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string>('/api/stream-proxy');
  const [streamError, setStreamError] = useState<string | null>(null);

  useEffect(() => {
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(mobile);
    setStarted(!mobile);
  }, []);

  const handleIframeError = () => {
    setStreamError('Camera stream unavailable. If accessing remotely, go2rtc must be publicly accessible. Use ngrok or set up a tunnel.');
  };

  const handleIframeLoad = () => {
    setStreamError(null);
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      backgroundColor: '#000',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {!started && isMobile ? (
        <button
          onClick={() => setStarted(true)}
          style={{
            width: '100%',
            height: '100%',
            color: '#fff',
            background: '#111',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Tap to start live feed
        </button>
      ) : streamError ? (
        <div style={{
          padding: '20px',
          color: '#fff',
          textAlign: 'center',
          fontSize: '14px',
          maxWidth: '80%'
        }}>
          <div style={{ marginBottom: '10px', fontSize: '24px' }}>📷</div>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Camera Unavailable</div>
          <div>{streamError}</div>
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#999' }}>
            For remote access: Set NEXT_PUBLIC_GO2RTC_URL environment variable in Vercel
          </div>
        </div>
      ) : (
        <iframe
          key={started ? 'streaming' : 'idle'}
          src={streamUrl}
          title="Live Camera Feed"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
            backgroundColor: '#000'
          }}
          allow="autoplay; fullscreen; camera; microphone"
          sandbox="allow-forms allow-modals allow-pointer-lock allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
          onError={handleIframeError}
          onLoad={handleIframeLoad}
        />
      )}
    </div>
  );
}