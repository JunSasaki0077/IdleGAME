// ============================================================
//  constants/gameData.ts
//  敵・アップグレード・クラスの定数データ
// ============================================================

import type { CharacterClass, EnemyDef, Upgrade } from '../types/gameTypes';

// ─────────────────────────────────────────
//  キャラクタークラス
// ─────────────────────────────────────────

export const CHARACTER_CLASSES: CharacterClass[] = [
  { minLevel: 1,  emoji: '🧙', name: '見習い魔法使い', classLv: 1 },
  { minLevel: 5,  emoji: '🔮', name: '魔法使い',       classLv: 2 },
  { minLevel: 12, emoji: '⚡', name: '上級魔法使い',   classLv: 2 },
  { minLevel: 20, emoji: '🌟', name: '大魔法使い',     classLv: 3 },
  { minLevel: 30, emoji: '👑', name: '魔法王',         classLv: 3 },
];

// ─────────────────────────────────────────
//  敵の種類
// ─────────────────────────────────────────

export const ENEMY_DEFS: EnemyDef[] = [
  // Tier 1 - 初級
  { name: 'スライム',   emoji: '🟢', baseHp: 60,   reward: { gold: 5,   xp: 8   }, size: 32, sprite: 'slime'    },
  { name: 'コウモリ',   emoji: '🦇', baseHp: 50,   reward: { gold: 4,   xp: 7   }, size: 30, sprite: 'kobold'   }, // TODO: bat スプライト追加予定

  // Tier 2 - 中級
  { name: 'ゴブリン',   emoji: '👺', baseHp: 120,  reward: { gold: 12,  xp: 18  }, size: 36, sprite: 'goblin'   },
  { name: 'オオカミ',   emoji: '🐺', baseHp: 140,  reward: { gold: 15,  xp: 22  }, size: 38, sprite: 'kobold'   }, // TODO: wolf スプライト追加予定
  { name: 'ゾンビ',     emoji: '🧟', baseHp: 160,  reward: { gold: 18,  xp: 25  }, size: 40, sprite: 'skeleton' },

  // Tier 3 - 上級
  { name: 'オーク',     emoji: '👹', baseHp: 360,  reward: { gold: 35,  xp: 50  }, size: 42, sprite: 'orc'      },
  { name: 'スケルトン', emoji: '💀', baseHp: 400,  reward: { gold: 40,  xp: 60  }, size: 40, sprite: 'skeleton' },
  { name: 'デーモン',   emoji: '😈', baseHp: 500,  reward: { gold: 50,  xp: 75  }, size: 44, sprite: 'dragon'   }, // TODO: demon スプライト追加予定

  // Tier 4 - 最上級
  { name: 'ドラゴン',   emoji: '🐉', baseHp: 1000, reward: { gold: 120, xp: 180 }, size: 52, sprite: 'dragon'   },
  { name: 'タイタン',   emoji: '🗿', baseHp: 1200, reward: { gold: 150, xp: 220 }, size: 50, sprite: 'orc'      },
  { name: 'クラーケン', emoji: '🐙', baseHp: 1400, reward: { gold: 180, xp: 260 }, size: 54, sprite: 'dragon'   },
  { name: 'ヒドラ',     emoji: '🐍', baseHp: 1600, reward: { gold: 210, xp: 300 }, size: 56, sprite: 'dragon'   },
];

// ─────────────────────────────────────────
//  アップグレード（一度きりの購入）
// ─────────────────────────────────────────

export const UPGRADES: Upgrade[] = [
  {
    id: 'sword',
    icon: '⚔️',
    name: '剣の強化',
    desc: '攻撃力 +5 / Gold +1/s',
    cost: 50,
    bought: false,
    apply: (s) => ({ ...s, atk: s.atk + 5, goldPerSec: s.goldPerSec + 1 }),
  },
  {
    id: 'tome',
    icon: '📖',
    name: '魔法書',
    desc: 'EXP +3/s / 攻速 +0.3',
    cost: 80,
    bought: false,
    apply: (s) => ({ ...s, xpPerSec: s.xpPerSec + 3, atkSpeed: s.atkSpeed + 0.3 }),
  },
  {
    id: 'armor',
    icon: '🛡️',
    name: '鎧の強化',
    desc: '最大HP +60',
    cost: 120,
    bought: false,
    apply: (s) => ({ ...s, maxHp: s.maxHp + 60, hp: s.maxHp + 60 }),
  },
  {
    id: 'boots',
    icon: '👢',
    name: '疾風の靴',
    desc: '敵の出現速度アップ',
    cost: 180,
    bought: false,
    apply: (s) => ({ ...s, spawnInterval: Math.max(1, s.spawnInterval - 0.8) }),
  },
  {
    id: 'potion',
    icon: '🧪',
    name: '錬金術',
    desc: 'Gold +5/s',
    cost: 250,
    bought: false,
    apply: (s) => ({ ...s, goldPerSec: s.goldPerSec + 5 }),
  },
  {
    id: 'crit_tome',
    icon: '🗡️',
    name: '速攻の書',
    desc: '攻速 +0.5',
    cost: 300,
    bought: false,
    apply: (s) => ({ ...s, atkSpeed: s.atkSpeed + 0.5 }),
  },
  {
    id: 'staff',
    icon: '🪄',
    name: '魔法の杖',
    desc: '攻撃力 +15 / EXP +5/s',
    cost: 400,
    bought: false,
    apply: (s) => ({ ...s, atk: s.atk + 15, xpPerSec: s.xpPerSec + 5 }),
  },
  {
    id: 'crystal',
    icon: '💎',
    name: '魔力の水晶',
    desc: '全ステータス +10%',
    cost: 700,
    bought: false,
    apply: (s) => ({
      ...s,
      atk:        Math.floor(s.atk * 1.1),
      goldPerSec: s.goldPerSec * 1.1,
      xpPerSec:   s.xpPerSec * 1.1,
    }),
  },
];
