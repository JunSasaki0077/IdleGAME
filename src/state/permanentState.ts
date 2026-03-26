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

export type PermanentData = {
  gems: number;
  upgrades: Record<string, number>; // id -> level
};

// ─────────────────────────────────────────
//  永続アップグレード定義
// ─────────────────────────────────────────

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
    gems: permanent.gems - cost,
    upgrades: { ...permanent.upgrades, [upgradeId]: currentLv + 1 },
  };
}
