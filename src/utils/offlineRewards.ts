// ============================================================
//  utils/offlineRewards.ts
//  オフライン放置報酬の計算ロジック
// ============================================================

import { GAME_CONFIG } from '../constants/gameConfig';

export type OfflineReward = {
  gold: number;
  xp: number;
  seconds: number;
};

/** オフライン時間から報酬を計算する */
export function calcOfflineRewards(
  goldPerSec: number,
  xpPerSec: number,
  offlineSecs: number
): OfflineReward {
  const clampedSecs = Math.min(offlineSecs, GAME_CONFIG.OFFLINE_MAX_SECONDS);
  return {
    gold: Math.floor(goldPerSec * clampedSecs * GAME_CONFIG.OFFLINE_EFFICIENCY),
    xp:   Math.floor(xpPerSec   * clampedSecs * GAME_CONFIG.OFFLINE_EFFICIENCY),
    seconds: clampedSecs,
  };
}

/** 秒数を「X時間Y分Z秒」形式の文字列に変換 */
export function formatOfflineTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}時間${m}分`;
  if (m > 0) return `${m}分${s}秒`;
  return `${s}秒`;
}
