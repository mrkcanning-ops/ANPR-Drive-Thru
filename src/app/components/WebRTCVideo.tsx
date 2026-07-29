'use client';

/**
 * LIVE CAMERA FEED COMPONENT
 * Displays real-time video stream from the camera via go2rtc
 * Used alongside the stored vehicle image for comparison
 */
export function WebRTCVideo() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      backgroundColor: '#000',
      position: 'relative'
    }}>
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
    </div>
  );
}
