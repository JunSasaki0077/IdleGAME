// ============================================================
//  hooks/useFrameAnimation.ts
//  スプライトアニメーションの共通フック
// ============================================================

import { useState, useEffect } from 'react';

/**
 * フレームアニメーションを管理するカスタムフック。
 * frameCount が null の場合はアニメーションを行わない。
 * key が変わるたびにフレームをリセットする。
 */
export function useFrameAnimation(
  frameCount: number | null,
  speed: number,
): number {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (frameCount === null) return;
    setFrameIndex(0);
    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frameCount);
    }, speed);
    return () => clearInterval(timer);
  }, [frameCount, speed]);

  return frameIndex;
}
