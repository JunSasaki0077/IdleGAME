// ============================================================
//  state/gameState.ts
//  Projectile（弾）をゲームステートに追加
// ============================================================

import { ENEMY_DEFS, CHARACTER_CLASSES } from '../constants/gameData';
import { GAME_CONFIG } from '../constants/gameConfig';
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

  // 戦闘パッシブ
  critChance: number;       // クリティカル確率（0.0〜1.0）
  critMultiplier: number;   // クリティカル時のダメージ倍率
  thornDamage: number;      // ダメージを受けた時の反射ダメージ
  multiShotChance: number;  // 連射確率（0.0〜1.0）

  // 敵
  enemies: Enemy[];
  spawnInterval: number;

  // ウェーブシステム
  waveNumber: number;          // 現在のウェーブ番号
  waveEnemiesTotal: number;    // このウェーブの総敵数
  waveEnemiesSpawned: number;  // 既にスポーンした敵数
  waveEnemiesKilled: number;   // このウェーブで撃破した敵数
  waveBreaking: boolean;       // ウェーブ間休憩中か
  waveBreakTimer: number;      // 休憩残り時間（秒）

  // 弾（新規追加）
  projectiles: Projectile[];

  // タイマー
  spawnTimer: number;
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
  atk: 10,
  atkSpeed: 1.2,
  goldPerSec: 0,
  xpPerSec: 0,
  acquiredSkills: [],
  skillPoints: 0,
  pendingSkillChoice: false,
  critChance: 0,
  critMultiplier: GAME_CONFIG.CRITICAL_HIT_MULTIPLIER,
  thornDamage: 0,
  multiShotChance: 0,
  enemies: [],
  spawnInterval: 3.5,
  waveNumber: 1,
  waveEnemiesTotal: GAME_CONFIG.WAVE_BASE_ENEMIES,
  waveEnemiesSpawned: 0,
  waveEnemiesKilled: 0,
  waveBreaking: false,
  waveBreakTimer: 0,
  projectiles: [],
  spawnTimer: 0,
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

/** 近接攻撃IDの定数（マジックストリング防止） */
export const MELEE_ATTACK_ID = '__melee__' as const;

/** ダメージ計算（分散・クリティカル付き） */
export function calcAttackDamage(
  atk: number,
  atkMultiplier: number,
  critChance = 0,
  critMultiplier = 1,
): { damage: number; isCrit: boolean } {
  const variance = GAME_CONFIG.DAMAGE_VARIANCE_MIN +
    Math.random() * (GAME_CONFIG.DAMAGE_VARIANCE_MAX - GAME_CONFIG.DAMAGE_VARIANCE_MIN);
  const isCrit = Math.random() < critChance;
  const damage = Math.floor(atk * atkMultiplier * variance * (isCrit ? critMultiplier : 1));
  return { damage, isCrit };
}

/** 最も近い（X座標が最小の）敵を返す */
export function findClosestEnemy(enemies: Enemy[]): Enemy | null {
  if (enemies.length === 0) return null;
  return enemies.reduce((a, b) => (a.x < b.x ? a : b));
}

let enemyIdCounter = 0;
export function createEnemy(level: number, isBoss = false): Enemy {
  const maxTierIndex = Math.min(Math.floor(level / GAME_CONFIG.ENEMY_TIER_LEVEL_DIVISOR), ENEMY_DEFS.length - 1);
  const def = ENEMY_DEFS[Math.floor(Math.random() * (maxTierIndex + 1))] ?? ENEMY_DEFS[0];
  const scaleFactor = 1 + level * GAME_CONFIG.ENEMY_HP_SCALE_PER_LEVEL;
  const baseHp = isBoss ? Math.floor(def.baseHp * GAME_CONFIG.BOSS_HP_MULTIPLIER) : def.baseHp;
  const hp = Math.floor(baseHp * scaleFactor);
  const rewardMultiplier = isBoss ? GAME_CONFIG.BOSS_REWARD_MULTIPLIER : 1;
  return {
    id: enemyIdCounter++,
    def,
    hp,
    maxHp: hp,
    x: GAME_CONFIG.ENEMY_SPAWN_X,
    isBoss,
    reward: {
      gold: Math.floor(def.reward.gold * (1 + level * GAME_CONFIG.ENEMY_GOLD_SCALE_PER_LEVEL) * rewardMultiplier),
      xp:   Math.floor(def.reward.xp   * (1 + level * GAME_CONFIG.ENEMY_XP_SCALE_PER_LEVEL) * rewardMultiplier),
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
      maxXp:              Math.floor(s.maxXp * GAME_CONFIG.XP_MULTIPLIER),
      atk:                s.atk + GAME_CONFIG.LEVEL_UP_ATK_BONUS,
      maxHp:              s.maxHp + GAME_CONFIG.LEVEL_UP_HP_BONUS,
      hp:                 s.maxHp + GAME_CONFIG.LEVEL_UP_HP_BONUS,
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
  s = applyLevelUp(s);
  return s;
}
