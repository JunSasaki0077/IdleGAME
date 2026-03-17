// ============================================================
//  state/gameState.ts
//  ゲームの状態定義・初期値・更新ロジック
// ============================================================

import { ENEMY_DEFS, CHARACTER_CLASSES } from '../constants/gameData';
import { GAME_CONFIG } from '../constants/gameConfig';
import type { Enemy, CharacterClass, GameState } from '../types/gameTypes';

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
  critChance: 0,
  enemies: [],
  spawnInterval: 3.5,
  spawnTimer: 0,
  atkTimer: 0,
  enemyAtkTimer: 0,
};

// ─────────────────────────────────────────
//  ロジック関数
// ─────────────────────────────────────────

/** レベルに応じた現在のクラスを返す */
export function getCurrentClass(level: number): CharacterClass {
  if (CHARACTER_CLASSES.length === 0) {
    throw new Error('CHARACTER_CLASSES is empty');
  }
  return [...CHARACTER_CLASSES]
    .reverse()
    .find((c) => level >= c.minLevel) ?? CHARACTER_CLASSES[0];
}

/** 敵を新しくスポーン */
let enemyIdCounter = 0;
export function createEnemy(level: number): Enemy {
  if (ENEMY_DEFS.length === 0) {
    throw new Error('ENEMY_DEFS is empty');
  }

  const maxTier = Math.min(
    Math.floor(level / GAME_CONFIG.ENEMY_TIER_LEVEL_DIVISOR),
    ENEMY_DEFS.length - 1
  );
  const def = ENEMY_DEFS[Math.floor(Math.random() * (maxTier + 1))];

  // ボス判定
  const isBoss = Math.random() < GAME_CONFIG.BOSS_SPAWN_CHANCE;

  const scaleFactor = 1 + level * GAME_CONFIG.ENEMY_HP_SCALE_PER_LEVEL;
  const baseHp = Math.floor(def.baseHp * scaleFactor);
  const hp = isBoss ? Math.floor(baseHp * GAME_CONFIG.BOSS_HP_MULTIPLIER) : baseHp;

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

/** レベルアップ処理（連続レベルアップにも対応） */
export function applyLevelUp(state: GameState): GameState {
  let s = { ...state };
  while (s.xp >= s.maxXp) {
    s = {
      ...s,
      xp:    s.xp - s.maxXp,
      level: s.level + 1,
      maxXp: Math.floor(s.maxXp * GAME_CONFIG.XP_MULTIPLIER),
      atk:   s.atk + GAME_CONFIG.LEVEL_UP_ATK_BONUS,
      maxHp: s.maxHp + GAME_CONFIG.LEVEL_UP_HP_BONUS,
      hp:    s.maxHp + GAME_CONFIG.LEVEL_UP_HP_BONUS, // レベルアップでHP全回復
    };
  }
  return s;
}

/** 1フレーム分のゲーム更新（dt = 経過秒数） */
export function tickGame(state: GameState, dt: number): GameState {
  let s = { ...state };

  // パッシブリソース増加
  s.gold += s.goldPerSec * dt;
  s.xp   += s.xpPerSec   * dt;

  // タイマー更新
  s.spawnTimer += dt;
  s.atkTimer   += dt;

  // レベルアップチェック
  s = applyLevelUp(s);

  return s;
}
