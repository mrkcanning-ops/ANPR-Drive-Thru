'use client';

import { useEffect, useRef, useState } from 'react';

export interface DetectedPlate {
  plate: string;
  confidence: number;
  vehicle?: {
    color?: string;
    type?: string;
  };
}

interface UseAnprPollingOptions {
  /** How often to refresh the camera snapshot, in ms. Default 100ms (10fps). */
  intervalMs?: number;
  /** Run ANPR every N frames to avoid rate-limiting the recognizer API. Default 20 (0.5fps at 100ms). */
  framesPerAnprCall?: number;
  /** Called with the highest-confidence plate whenever a new detection batch arrives. */
  onPlateDetected?: (plate: string) => void;
}

export function useAnprPolling({
  intervalMs = 100,
  framesPerAnprCall = 20,
  onPlateDetected,
}: UseAnprPollingOptions = {}) {
  const [detectedPlates, setDetectedPlates] = useState<DetectedPlate[]>([]);
  const [anprProcessing, setAnprProcessing] = useState(false);
  const [lastAnprTime, setLastAnprTime] = useState(0);
  const [anprError, setAnprError] = useState<string | null>(null);

  const isProcessingRef = useRef(false);
  const frameCountRef = useRef(0);
  const onPlateDetectedRef = useRef(onPlateDetected);
  onPlateDetectedRef.current = onPlateDetected;

  useEffect(() => {
    const processAnpr = async (frameId: number) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      setAnprProcessing(true);
      setAnprError(null);

      try {
               const response = await fetch('/api/anpr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: `http://localhost:1984/api/frame.jpeg?src=reolink&t=${frameId}`,
          }),
        });

        if (!response.ok) {
          throw new Error(`ANPR request failed with status ${response.status}`);
        }

        const data = await response.json();
        if (data.plates && data.plates.length > 0) {
          setDetectedPlates(data.plates);

          const topPlate = data.plates.reduce((max: DetectedPlate, plate: DetectedPlate) =>
            plate.confidence > max.confidence ? plate : max
          );

          if (topPlate?.plate) {
            onPlateDetectedRef.current?.(topPlate.plate);
          }
        }
      } catch (error) {
        console.error('ANPR processing error:', error);
        setAnprError(error instanceof Error ? error.message : 'Unknown ANPR error');
      } finally {
        isProcessingRef.current = false;
        setAnprProcessing(false);
        setLastAnprTime(Date.now());
      }
    };

    const interval = setInterval(() => {
      frameCountRef.current += 1;
      const currentFrame = frameCountRef.current;

      // No setState here — frameCountRef doesn't need to trigger a
      // re-render of the whole page 10x/second, it's only used
      // internally to decide when to fire the next ANPR call.
      if (currentFrame % framesPerAnprCall === 0) {
        processAnpr(currentFrame);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs, framesPerAnprCall]);

   return { detectedPlates, anprProcessing, lastAnprTime, anprError };
}