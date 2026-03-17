// ============================================================
//  utils/format.ts
//  汎用フォーマット関数
// ============================================================

/** 数値を見やすい文字列に変換（例: 1500 → "1.5K"） */
export function formatNumber(n: number): string {
  const floored = Math.floor(n);
  if (floored >= 1_000_000) return (floored / 1_000_000).toFixed(1) + 'M';
  if (floored >= 1_000)     return (floored / 1_000).toFixed(1) + 'K';
  return floored.toString();
}

/** 割合を0〜1のクランプ済み数値で返す */
export function clampRatio(current: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(Math.max(current / max, 0), 1);
}
