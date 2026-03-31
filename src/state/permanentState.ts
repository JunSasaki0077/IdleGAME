// ============================================================
//  state/permanentState.ts
//  ランをまたいで持続する永続強化（ラボ）システム
// ============================================================

import type { GameState } from './gameState';

// ─────────────────────────────────────────
//  型定義
// ─────────────────────────────────────────

export type PermanentUpgradeDef = {
  id: string;
  name: string;
  icon: string;
  desc: string;
  gemCost: (currentLv: number) => number;
  maxLv: number;
};

export type StageDef = {
  id: number;
  name: string;
  icon: string;
  hpMultiplier: number;
  rewardMultiplier: number;
  unlockWave: number; // このウェーブ数に到達すると解禁
};

export type PermanentData = {
  gems: number;
  upgrades: Record<string, number>; // id -> level
  currentStage: number;
  maxUnlockedStage: number;
};

// ─────────────────────────────────────────
//  永続アップグレード定義
// ─────────────────────────────────────────

// ─────────────────────────────────────────
//  ステージ定義
// ─────────────────────────────────────────

export const STAGE_DEFS: StageDef[] = [
  { id: 1, name: '平原',   icon: '🌿', hpMultiplier: 1.0,  rewardMultiplier: 1.0,  unlockWave: 0  },
  { id: 2, name: '森林',   icon: '🌲', hpMultiplier: 2.0,  rewardMultiplier: 1.8,  unlockWave: 5  },
  { id: 3, name: '洞窟',   icon: '⛏️', hpMultiplier: 3.5,  rewardMultiplier: 3.0,  unlockWave: 15 },
  { id: 4, name: '魔境',   icon: '🔥', hpMultiplier: 6.0,  rewardMultiplier: 5.0,  unlockWave: 30 },
  { id: 5, name: '奈落',   icon: '💀', hpMultiplier: 10.0, rewardMultiplier: 8.0,  unlockWave: 50 },
];

export const PERMANENT_UPGRADES: PermanentUpgradeDef[] = [
  {
    id: 'lab_atk',
    icon: '⚔️',
    name: '攻撃力の結晶',
    desc: '開始攻撃力 +5',
    gemCost: (lv) => 5 + lv * 3,
    maxLv: 20,
  },
  {
    id: 'lab_hp',
    icon: '❤️',
    name: '生命の結晶',
    desc: '開始HP +50',
    gemCost: (lv) => 5 + lv * 3,
    maxLv: 20,
  },
  {
    id: 'lab_gold',
    icon: '💰',
    name: '黄金の結晶',
    desc: 'Gold/s +0.5',
    gemCost: (lv) => 8 + lv * 4,
    maxLv: 10,
  },
  {
    id: 'lab_speed',
    icon: '⚡',
    name: '疾風の結晶',
    desc: '開始攻速 +0.1',
    gemCost: (lv) => 10 + lv * 5,
    maxLv: 10,
  },
];

export const INITIAL_PERMANENT: PermanentData = {
  gems: 0,
  upgrades: {},
  currentStage: 1,
  maxUnlockedStage: 1,
};

// ─────────────────────────────────────────
//  ヘルパー関数
// ─────────────────────────────────────────

/** 永続ボーナスを初期GameStateに適用する */
export function applyPermanentBonuses(state: GameState, permanent: PermanentData): GameState {
  const u = permanent.upgrades;
  const atkLv   = u['lab_atk']   ?? 0;
  const hpLv    = u['lab_hp']    ?? 0;
  const goldLv  = u['lab_gold']  ?? 0;
  const speedLv = u['lab_speed'] ?? 0;

  const newMaxHp = state.maxHp + hpLv * 50;
  return {
    ...state,
    atk:       state.atk + atkLv * 5,
    maxHp:     newMaxHp,
    hp:        newMaxHp,
    goldPerSec: state.goldPerSec + goldLv * 0.5,
    atkSpeed:  state.atkSpeed + speedLv * 0.1,
  };
}

/** ジェムを使って永続アップグレードを購入する。購入不可なら null を返す */
export function purchasePermanentUpgrade(
  permanent: PermanentData,
  upgradeId: string,
): PermanentData | null {
  const def = PERMANENT_UPGRADES.find((u) => u.id === upgradeId);
  if (!def) return null;
  const currentLv = permanent.upgrades[upgradeId] ?? 0;
  if (currentLv >= def.maxLv) return null;
  const cost = def.gemCost(currentLv);
  if (permanent.gems < cost) return null;
  return {
    ...permanent,
    gems: permanent.gems - cost,
    upgrades: { ...permanent.upgrades, [upgradeId]: currentLv + 1 },
  };
}
