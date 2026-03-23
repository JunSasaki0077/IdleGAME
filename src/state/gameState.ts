// ============================================================
//  state/gameState.ts
//  Projectile（弾）をゲームステートに追加
// ============================================================

import { ENEMY_DEFS, CHARACTER_CLASSES } from '../constants/gameData';
import { getSkillDef } from '../constants/skillData';
import type { Enemy, CharacterClass, Projectile } from '../types/gameTypes';
import type { AcquiredSkill, SkillEffect } from '../types/skillTypes';

// ─────────────────────────────────────────
//  ゲーム状態の型
// ─────────────────────────────────────────

export type GameState = {
  gold: number;
  xp: number;
  level: number;
  maxXp: number;
  hp: number;
  maxHp: number;
  atk: number;
  atkSpeed: number;
  goldPerSec: number;
  xpPerSec: number;

  // スキルシステム
  acquiredSkills: AcquiredSkill[];
  skillPoints: number;
  pendingSkillChoice: boolean;

  // 敵
  enemies: Enemy[];
  spawnInterval: number;

  // 弾（新規追加）
  projectiles: Projectile[];

  // タイマー
  spawnTimer: number;
  atkTimer: number;
  enemyAtkTimer: number;
  skillTimers: Record<string, number>; // スキルごとの独立した攻撃タイマー
};

// ─────────────────────────────────────────
//  初期ステート
// ─────────────────────────────────────────

export const INITIAL_STATE: GameState = {
  gold: 0,
  xp: 0,
  level: 1,
  maxXp: 100,
  hp: 100,
  maxHp: 100,
  atk: 8,
  atkSpeed: 1.2,
  goldPerSec: 1,
  xpPerSec: 2,
  acquiredSkills: [],
  skillPoints: 0,
  pendingSkillChoice: false,
  enemies: [],
  spawnInterval: 3.5,
  projectiles: [],
  spawnTimer: 0,
  atkTimer: 0,
  enemyAtkTimer: 0,
  skillTimers: {},
};

// ─────────────────────────────────────────
//  ロジック関数
// ─────────────────────────────────────────

export function getCurrentClass(level: number): CharacterClass {
  return [...CHARACTER_CLASSES]
    .reverse()
    .find((c) => level >= c.minLevel) ?? CHARACTER_CLASSES[0];
}

let enemyIdCounter = 0;
export function createEnemy(level: number): Enemy {
  const maxTier = Math.min(Math.floor(level / 4), ENEMY_DEFS.length - 1);
  const def = ENEMY_DEFS[Math.floor(Math.random() * (maxTier + 1))];
  const scaleFactor = 1 + level * 0.08;
  const hp = Math.floor(def.baseHp * scaleFactor);
  return {
    id: enemyIdCounter++,
    def,
    hp,
    maxHp: hp,
    x: 110,
    reward: {
      gold: Math.floor(def.reward.gold * (1 + level * 0.1)),
      xp:   Math.floor(def.reward.xp   * (1 + level * 0.05)),
    },
  };
}

/** 弾を生成する */
let projectileIdCounter = 0;
export function createProjectile(
  kind: Projectile['kind'],
  startX: number,
  y: number,
  damage: number,
): Projectile {
  return {
    id: projectileIdCounter++,
    kind,
    x: startX,
    y,
    speed: 80, // 1秒で画面の80%移動
    damage,
    hit: false,
  };
}

/** 習得済みスキルから合計エフェクトを計算 */
export function calcSkillEffects(acquiredSkills: AcquiredSkill[]): SkillEffect {
  let totalAtkMultiplier = 1;
  let maxChainCount = 1;
  let maxSlowAmount = 0;

  for (const acquired of acquiredSkills) {
    const def = getSkillDef(acquired.defId);
    if (!def) continue;
    const effect = def.getEffect(acquired.skillLv);
    if (effect.atkMultiplier)  totalAtkMultiplier *= effect.atkMultiplier;
    if (effect.chainCount)     maxChainCount = Math.max(maxChainCount, effect.chainCount);
    if (effect.slowAmount)     maxSlowAmount = Math.max(maxSlowAmount, effect.slowAmount);
  }

  return {
    atkMultiplier: totalAtkMultiplier,
    chainCount:    maxChainCount,
    slowAmount:    maxSlowAmount,
  };
}

export function acquireSkill(state: GameState, skillDefId: string, atkInterval = 0.83): GameState {
  const existing = state.acquiredSkills.find((s) => s.defId === skillDefId);
  if (existing) {
    // レベルアップの場合はタイマーそのまま
    return {
      ...state,
      pendingSkillChoice: false,
      acquiredSkills: state.acquiredSkills.map((s) =>
        s.defId === skillDefId ? { ...s, skillLv: s.skillLv + 1 } : s
      ),
    };
  }
  // 新規習得：既存スキル数に応じてタイマーをオフセット（重ならないよう等間隔にずらす）
  const count = state.acquiredSkills.length + 1; // 習得後の総スキル数
  const offset = atkInterval * ((count - 1) / count);
  return {
    ...state,
    pendingSkillChoice: false,
    acquiredSkills: [...state.acquiredSkills, { defId: skillDefId, skillLv: 1 }],
    skillTimers: { ...state.skillTimers, [skillDefId]: offset },
  };
}

export function upgradeSkillWithSP(state: GameState, skillDefId: string): GameState {
  if (state.skillPoints <= 0) return state;
  const def = getSkillDef(skillDefId);
  if (!def) return state;
  const existing = state.acquiredSkills.find((s) => s.defId === skillDefId);
  if (!existing || existing.skillLv >= def.maxLv) return state;
  return {
    ...state,
    skillPoints: state.skillPoints - 1,
    acquiredSkills: state.acquiredSkills.map((s) =>
      s.defId === skillDefId ? { ...s, skillLv: s.skillLv + 1 } : s
    ),
  };
}

export function applyLevelUp(state: GameState): GameState {
  let s = { ...state };
  while (s.xp >= s.maxXp) {
    s = {
      ...s,
      xp:                 s.xp - s.maxXp,
      level:              s.level + 1,
      maxXp:              Math.floor(s.maxXp * 1.55),
      atk:                s.atk + 2,
      maxHp:              s.maxHp + 10,
      hp:                 s.maxHp + 10,
      skillPoints:        s.skillPoints + 1,
      pendingSkillChoice: true,
    };
  }
  return s;
}

export function tickGame(state: GameState, dt: number): GameState {
  let s = { ...state };
  s.gold       += s.goldPerSec * dt;
  s.xp         += s.xpPerSec   * dt;
  s.spawnTimer += dt;
  s.atkTimer   += dt;
  s = applyLevelUp(s);
  return s;
}
