'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { BottomNav } from '@/components/BottomNav';

type AnimationStage = 'waiting' | 'detected' | 'looking' | 'welcome' | 'complete';

export default function LiveArrivals() {
  const [stage, setStage] = useState<AnimationStage>('waiting');
  const [opacity, setOpacity] = useState(0);
  const [slideIn, setSlideIn] = useState(false);

  // Simulate plate detection sequence
  useEffect(() => {
    const timeline = [
      { delay: 0, stage: 'waiting' as AnimationStage },
      { delay: 2000, stage: 'detected' as AnimationStage },
      { delay: 3500, stage: 'looking' as AnimationStage },
      { delay: 5000, stage: 'welcome' as AnimationStage },
      { delay: 5200, stage: 'complete' as AnimationStage },
    ];

    const timers = timeline.map((item) =>
      setTimeout(() => {
        setStage(item.stage);
        if (item.stage === 'complete') {
          setSlideIn(true);
        }
      }, item.delay)
    );

    // Reset after showing complete state
    const resetTimer = setTimeout(() => {
      setStage('waiting');
      setSlideIn(false);
    }, 10000);

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      clearTimeout(resetTimer);
    };
  }, []);

  // Fade effect for text transitions
  useEffect(() => {
    if (stage === 'waiting' || stage === 'detected' || stage === 'looking' || stage === 'welcome') {
      setOpacity(0);
      const timer = setTimeout(() => setOpacity(1), 50);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <Sidebar activeItem="Live Arrivals" />

      <main className="flex-1 p-3 lg:p-6 flex flex-col items-center justify-center">
        {/* Animation Container */}
        <div className="w-full max-w-2xl">
          {/* Waiting State */}
          {stage === 'waiting' && (
            <div
              className="text-center py-20 transition-opacity duration-300"
              style={{ opacity }}
            >
              <div className="text-6xl mb-6 animate-pulse">📷</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Waiting for Vehicle...</h2>
              <p className="text-gray-600">Scanning for license plates</p>
            </div>
          )}

          {/* Plate Detected State */}
          {stage === 'detected' && (
            <div
              className="bg-blue-50 rounded-lg p-8 text-center transition-opacity duration-300"
              style={{ opacity }}
            >
              <div className="text-6xl mb-4">📷</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Plate Detected</h2>
              <div className="bg-white rounded-lg p-6 mt-4 border-2 border-blue-500 font-mono text-4xl font-bold text-blue-600">
                AB12 CDE
              </div>
            </div>
          )}

          {/* Looking Up Customer State */}
          {stage === 'looking' && (
            <div
              className="text-center py-20 transition-opacity duration-300"
              style={{ opacity }}
            >
              <div className="text-6xl mb-6 animate-spin">⏳</div>
              <h2 className="text-3xl font-bold text-gray-900">Looking up customer...</h2>
              <p className="text-gray-600 mt-2">Checking loyalty database</p>
            </div>
          )}

          {/* Welcome State */}
          {(stage === 'welcome' || stage === 'complete') && (
            <div
              className={`transition-all duration-500 ${
                slideIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            >
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-green-600 mb-2">Welcome back!</h2>
                <h3 className="text-3xl font-bold text-gray-900">John Smith</h3>
              </div>

              {/* Customer Card Slides In */}
              <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
                {/* Vehicle Info */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">AB12 CDE</h3>
                  <p className="text-sm text-gray-700 font-semibold">Blue Ford Focus</p>
                  <p className="text-xs text-yellow-600 mt-1">⭐ 240 Loyalty Points</p>
                </div>

                {/* Previous Order */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Previous visit: Yesterday</p>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-900">☕ Large Latte</p>
                    <p className="text-sm text-gray-900">🥓 Bacon Roll</p>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-amber-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-600">Notes</p>
                  <p className="text-sm text-gray-900">Prefers oat milk</p>
                </div>

                {/* Suggested Order */}
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <p className="text-sm font-bold text-gray-900 mb-3">Suggested Order</p>
                  <div className="space-y-2 mb-3">
                    <label className="flex items-center text-sm">
                      <input type="checkbox" checked readOnly className="mr-2 w-4 h-4" />
                      <span>☕ Large Latte</span>
                    </label>
                    <label className="flex items-center text-sm">
                      <input type="checkbox" checked readOnly className="mr-2 w-4 h-4" />
                      <span>🥓 Bacon Roll</span>
                    </label>
                    <label className="flex items-center text-sm">
                      <input type="checkbox" checked readOnly className="mr-2 w-4 h-4" />
                      <span>🍟 Hash Brown</span>
                    </label>
                  </div>
                  <button className="w-full bg-emerald-600 text-white font-semibold py-2 rounded hover:bg-emerald-700 transition-colors">
                    Start Order
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button className="bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition-colors">
                    Custom Order
                  </button>
                  <button className="bg-gray-600 text-white font-semibold py-2 rounded hover:bg-gray-700 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Indicator */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Camera Online • 98.7% Recognition</span>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
