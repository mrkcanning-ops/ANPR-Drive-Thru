'use client';

import { useEffect, useState } from 'react';

export function WebRTCVideo() {
  const [isMobile, setIsMobile] = useState(false);
  const [started, setStarted] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string>('/api/stream-proxy');

  useEffect(() => {
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(mobile);
    setStarted(!mobile);
  }, []);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      backgroundColor: '#000',
      position: 'relative'
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
        />
      )}
    </div>
  );
}