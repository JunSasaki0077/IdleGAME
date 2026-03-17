// ============================================================
//  state/gameLogic.ts
//  ゲームループの各ロジックを分離した関数群
// ============================================================

import { GAME_CONFIG } from '../constants/gameConfig';
import { createEnemy } from './gameState';
import type { GameState } from '../types/gameTypes';

// ─────────────────────────────────────────
//  敵のスポーン処理
// ─────────────────────────────────────────

export function handleEnemySpawn(state: GameState): GameState {
  if (state.spawnTimer >= state.spawnInterval) {
    return {
      ...state,
      spawnTimer: 0,
      enemies: [...state.enemies, createEnemy(state.level)],
    };
  }
  return state;
}

// ─────────────────────────────────────────
//  敵の移動処理
// ─────────────────────────────────────────

export function handleEnemyMovement(state: GameState, dt: number): GameState {
  const stopX = GAME_CONFIG.HERO_POSITION_X + GAME_CONFIG.ENEMY_STOP_OFFSET;

  return {
    ...state,
    enemies: state.enemies.map((e) => {
      // 敵が止まる位置より右にいる場合は移動
      if (e.x > stopX) {
        const newX = e.x - GAME_CONFIG.ENEMY_MOVE_SPEED * dt;
        // stopXと主人公の位置（ENEMY_MIN_X）のどちらか大きい方が最小値
        return { ...e, x: Math.max(stopX, Math.max(GAME_CONFIG.ENEMY_MIN_X, newX)) };
      }
      // 既に止まっている場合は、主人公の位置より左に行かないようにする
      return { ...e, x: Math.max(GAME_CONFIG.ENEMY_MIN_X, e.x) };
    }),
  };
}

// ─────────────────────────────────────────
//  主人公の攻撃処理
// ─────────────────────────────────────────

type AttackResult = {
  state: GameState;
  didAttack: boolean;
  isCritical: boolean;
  damage?: number;
  targetX?: number;
  targetIsBoss?: boolean;
  goldGained?: number;
};

export function handlePlayerAttack(state: GameState): AttackResult {
  const atkInterval = 1 / state.atkSpeed;

  if (state.atkTimer < atkInterval) {
    return { state, didAttack: false, isCritical: false };
  }

  const stopX = GAME_CONFIG.HERO_POSITION_X + GAME_CONFIG.ENEMY_STOP_OFFSET;
  const target = [...state.enemies]
    .filter((e) => e.x <= stopX + GAME_CONFIG.ATTACK_RANGE)
    .sort((a, b) => a.x - b.x)[0];

  if (!target) {
    return { state, didAttack: false, isCritical: false };
  }

  // クリティカル判定
  const isCritical = Math.random() < state.critChance;

  // ダメージ計算
  const baseDmg = state.atk * (GAME_CONFIG.DAMAGE_VARIANCE_MIN +
    Math.random() * (GAME_CONFIG.DAMAGE_VARIANCE_MAX - GAME_CONFIG.DAMAGE_VARIANCE_MIN));
  const critMultiplier = isCritical ? GAME_CONFIG.CRITICAL_HIT_MULTIPLIER : 1.0;

  const dmg = Math.floor(baseDmg * critMultiplier);
  const updatedHp = target.hp - dmg;

  if (updatedHp <= 0) {
    // 敵を倒した
    return {
      state: {
        ...state,
        atkTimer: 0,
        gold: state.gold + target.reward.gold,
        xp: state.xp + target.reward.xp,
        enemies: state.enemies.filter((e) => e.id !== target.id),
      },
      didAttack: true,
      isCritical,
      damage: dmg,
      targetX: target.x,
      targetIsBoss: target.isBoss,
      goldGained: target.reward.gold,
    };
  } else {
    // ダメージのみ
    return {
      state: {
        ...state,
        atkTimer: 0,
        enemies: state.enemies.map((e) =>
          e.id === target.id ? { ...e, hp: updatedHp } : e
        ),
      },
      didAttack: true,
      isCritical,
      damage: dmg,
      targetX: target.x,
      targetIsBoss: target.isBoss,
    };
  }
}

// ─────────────────────────────────────────
//  敵の攻撃処理
// ─────────────────────────────────────────

type EnemyAttackResult = {
  state: GameState;
  didAttack: boolean;
  totalDamage?: number;
  didDie: boolean;
};

export function handleEnemyAttack(
  state: GameState,
  dt: number
): EnemyAttackResult {
  const stopX = GAME_CONFIG.HERO_POSITION_X + GAME_CONFIG.ENEMY_STOP_OFFSET;
  const attackingEnemies = state.enemies.filter(
    (e) => e.x <= stopX + GAME_CONFIG.ATTACK_RANGE
  );

  if (attackingEnemies.length === 0) {
    return {
      state: { ...state, enemyAtkTimer: 0 },
      didAttack: false,
      didDie: false,
    };
  }

  const newTimer = (state.enemyAtkTimer ?? 0) + dt;

  if (newTimer < GAME_CONFIG.ENEMY_ATTACK_INTERVAL) {
    return {
      state: { ...state, enemyAtkTimer: newTimer },
      didAttack: false,
      didDie: false,
    };
  }

  // 攻撃実行
  let totalDmg = 0;
  attackingEnemies.forEach((e) => {
    totalDmg += Math.floor(
      (e.def.baseHp * GAME_CONFIG.ENEMY_DAMAGE_MULTIPLIER) *
      (GAME_CONFIG.ENEMY_DAMAGE_VARIANCE_MIN +
       Math.random() * (GAME_CONFIG.ENEMY_DAMAGE_VARIANCE_MAX - GAME_CONFIG.ENEMY_DAMAGE_VARIANCE_MIN))
    );
  });

  const newHp = Math.max(0, state.hp - totalDmg);
  const didDie = newHp <= 0;

  if (didDie) {
    // HP0 → 全回復（放置ゲーム仕様）
    return {
      state: {
        ...state,
        hp: state.maxHp,
        enemies: [],
        enemyAtkTimer: 0,
      },
      didAttack: true,
      totalDamage: totalDmg,
      didDie: true,
    };
  } else {
    return {
      state: {
        ...state,
        hp: newHp,
        enemyAtkTimer: 0,
      },
      didAttack: true,
      totalDamage: totalDmg,
      didDie: false,
    };
  }
}

// ─────────────────────────────────────────
//  画面外の敵を削除
// ─────────────────────────────────────────

export function cleanupOffscreenEnemies(state: GameState): GameState {
  return {
    ...state,
    enemies: state.enemies.filter((e) => e.x > GAME_CONFIG.ENEMY_DESPAWN_X),
  };
}
