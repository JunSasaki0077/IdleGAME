// ============================================================
//  types/gameTypes.ts
//  ゲーム全体で使う型定義
// ============================================================

import type { GameState } from '../state/gameState';

// ─────────────────────────────────────────
//  キャラクター
// ─────────────────────────────────────────

export type CharacterClass = {
  minLevel: number;
  emoji: string;
  name: string;
  classLv: 1 | 2 | 3;
};

// ─────────────────────────────────────────
//  敵
// ─────────────────────────────────────────

export type EnemyDef = {
  name: string;
  emoji: string;
  baseHp: number;
  reward: {
    gold: number;
    xp: number;
  };
  size: number;
  sprite?: string; // assets/sprites/enemies/ 以下のキー名
};

export type Enemy = {
  id: number;
  def: EnemyDef;
  hp: number;
  maxHp: number;
  x: number;
  yOffset: number;   // 縦方向ランダムオフセット（%）- 群れの奥行き表現
  sizeScale: number; // サイズ微変動（0.75〜1.25）
  isBoss?: boolean;
  reward: {
    gold: number;
    xp: number;
  };
};

// ─────────────────────────────────────────
//  弾（Projectile）
// ─────────────────────────────────────────

export type ProjectileKind = 'orb' | 'fireball' | 'thunder' | 'ice';

export type Projectile = {
  id: number;
  kind: ProjectileKind;
  x: number;
  y: number;
  speed: number;
  damage: number;
  hit: boolean;
};

export const PROJECTILE_VISUALS: Record<ProjectileKind, {
  emoji: string;
  color: string;
  size: number;
}> = {
  orb:      { emoji: '⚪', color: '#ffffff', size: 16 },
  fireball: { emoji: '🔥', color: '#ff6600', size: 20 },
  thunder:  { emoji: '⚡', color: '#ffdd00', size: 18 },
  ice:      { emoji: '❄️', color: '#66ddff', size: 18 },
};

// ─────────────────────────────────────────
//  アップグレード
// ─────────────────────────────────────────

export type Upgrade = {
  id: string;
  icon: string;
  name: string;
  desc: string;
  cost: number;    // 現在のコスト（購入するたびに増加）
  level: number;   // 購入回数
  apply: (state: GameState) => GameState;
};

// ─────────────────────────────────────────
//  ダメージ表示（エフェクト用）
// ─────────────────────────────────────────

export type DamageNumber = {
  id: number;
  value: string;
  x: number;
  y: number;
  color: string;
};
