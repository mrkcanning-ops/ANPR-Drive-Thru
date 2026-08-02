'use client';

import { useEffect, useState } from 'react';

export function WebRTCVideo() {
  const [isMobile, setIsMobile] = useState(false);
  const [started, setStarted] = useState(false);

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
            fontSize: '16px'
          }}
        >
          Tap to start live feed
        </button>
      ) : (
        <iframe
          src="http://localhost:1984/stream.html?src=reolink"
          title="Live Camera Feed"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
            backgroundColor: '#000',
            transform: 'scale(1.25)',
            transformOrigin: 'center',
            objectFit: 'cover'
          }}
          allow="autoplay *; fullscreen *; camera *; microphone *"
        />
      )}
    </div>
  );
}