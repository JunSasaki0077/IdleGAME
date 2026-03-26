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
    desc: '攻撃力 +5',
    cost: 50,
    level: 0,
    apply: (s) => ({ ...s, atk: s.atk + 5 }),
  },
  {
    id: 'armor',
    icon: '🛡️',
    name: '鎧の強化',
    desc: '最大HP +60',
    cost: 120,
    level: 0,
    apply: (s) => ({ ...s, maxHp: s.maxHp + 60, hp: s.maxHp + 60 }),
  },
  {
    id: 'crit_tome',
    icon: '🗡️',
    name: '速攻の書',
    desc: '攻速 +0.5',
    cost: 300,
    level: 0,
    apply: (s) => ({ ...s, atkSpeed: s.atkSpeed + 0.5 }),
  },
  {
    id: 'crit_chance',
    icon: '🎯',
    name: '鷹の眼',
    desc: 'クリティカル確率 +10%',
    cost: 200,
    level: 0,
    apply: (s) => ({ ...s, critChance: Math.min(1, s.critChance + 0.1) }),
  },
  {
    id: 'crit_damage',
    icon: '💥',
    name: '破壊の刻印',
    desc: 'クリティカルダメージ +50%',
    cost: 350,
    level: 0,
    apply: (s) => ({ ...s, critMultiplier: s.critMultiplier + 0.5 }),
  },
  {
    id: 'thorn',
    icon: '🌵',
    name: 'トゲの鎧',
    desc: '被ダメージ時に敵へ反射ダメージ +5',
    cost: 150,
    level: 0,
    apply: (s) => ({ ...s, thornDamage: s.thornDamage + 5 }),
  },
  {
    id: 'multi_shot',
    icon: '🏹',
    name: '連射の弦',
    desc: '連射確率 +15%',
    cost: 250,
    level: 0,
    apply: (s) => ({ ...s, multiShotChance: Math.min(1, s.multiShotChance + 0.15) }),
  },
];
