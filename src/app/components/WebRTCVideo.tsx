'use client';

import { useEffect, useState } from 'react';

export function WebRTCVideo() {
  const [isMobile, setIsMobile] = useState(false);
  const [started, setStarted] = useState(false);
  const GO2RTC_URL = process.env.NEXT_PUBLIC_GO2RTC_URL || 'http://192.168.0.52:1984';

  useEffect(() => {
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(mobile);
    setStarted(!mobile);
  }, []);

  return (
    <div className="w-full h-full relative bg-black overflow-hidden">
      {!started && isMobile ? (
        <button
          onClick={() => setStarted(true)}
          className="w-full h-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium"
        >
          Tap to start live feed
        </button>
      ) : (
        <iframe
          src={`${GO2RTC_URL}/stream.html?src=reolink`}
          title="Live Camera Feed"
          className="w-full h-full border-0 block bg-black"
          style={{
            transform: 'scale(1.18)',
            transformOrigin: 'center',
          }}
          allow="autoplay *; fullscreen *; camera *; microphone *"
        />
      )}
    </div>
  );
}