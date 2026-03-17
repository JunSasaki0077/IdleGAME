// ============================================================
//  types/gameTypes.ts
//  ゲーム全体で使う型定義
// ============================================================

// ─────────────────────────────────────────
//  ゲーム状態
// ─────────────────────────────────────────

export type GameState = {
  // リソース
  gold: number;
  xp: number;

  // レベル
  level: number;
  maxXp: number;

  // HP
  hp: number;
  maxHp: number;

  // ステータス
  atk: number;
  atkSpeed: number;      // 攻撃回数/秒
  goldPerSec: number;
  xpPerSec: number;
  critChance: number;    // クリティカル率

  // 敵管理
  enemies: Enemy[];
  spawnInterval: number; // 次の敵が出るまでの秒数

  // 内部タイマー
  spawnTimer: number;
  atkTimer: number;
  enemyAtkTimer: number; // 敵の攻撃タイマー
};

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
};

export type Enemy = {
  id: number;
  def: EnemyDef;
  hp: number;
  maxHp: number;
  x: number;       // 画面上のX座標（%）
  isBoss: boolean; // ボス敵かどうか
  reward: {
    gold: number;
    xp: number;
  };
};

// ─────────────────────────────────────────
//  アップグレード
// ─────────────────────────────────────────

export type Upgrade = {
  id: string;
  icon: string;
  name: string;
  desc: string;
  baseCost: number;
  level: number;
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
  isCritical?: boolean; // クリティカルヒットかどうか
};

// ─────────────────────────────────────────
//  パーティクルエフェクト
// ─────────────────────────────────────────

export type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;      // X方向の速度
  vy: number;      // Y方向の速度
  emoji: string;   // 表示する絵文字
  scale: number;   // スケール
  opacity: number; // 透明度
  life: number;    // 残り寿命（0〜1）
};