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
  // Tier 1 - 初級（Lv0〜）
  { name: 'ラット',       emoji: '🐀', baseHp: 45,   reward: { gold: 3,   xp: 6   }, size: 28, sprite: 'kobold'   },
  { name: 'コウモリ',     emoji: '🦇', baseHp: 50,   reward: { gold: 4,   xp: 7   }, size: 30, sprite: 'kobold'   },
  { name: 'スライム',     emoji: '🟢', baseHp: 60,   reward: { gold: 5,   xp: 8   }, size: 32, sprite: 'slime'    },
  { name: 'コボルド',     emoji: '🐊', baseHp: 75,   reward: { gold: 6,   xp: 10  }, size: 32, sprite: 'kobold'   },
  { name: 'リザードマン', emoji: '🦎', baseHp: 100,  reward: { gold: 8,   xp: 14  }, size: 34, sprite: 'goblin'   },

  // Tier 2 - 中級（Lv8〜）
  { name: 'ゴブリン',     emoji: '👺', baseHp: 120,  reward: { gold: 12,  xp: 18  }, size: 36, sprite: 'goblin'   },
  { name: 'ホブゴブリン', emoji: '👿', baseHp: 135,  reward: { gold: 13,  xp: 20  }, size: 36, sprite: 'goblin'   },
  { name: 'オオカミ',     emoji: '🐺', baseHp: 150,  reward: { gold: 15,  xp: 22  }, size: 38, sprite: 'kobold'   },
  { name: 'マミー',       emoji: '⚰️', baseHp: 170,  reward: { gold: 17,  xp: 26  }, size: 38, sprite: 'skeleton' },
  { name: 'ゾンビ',       emoji: '🧟', baseHp: 190,  reward: { gold: 19,  xp: 28  }, size: 40, sprite: 'skeleton' },

  // Tier 3 - 上級（Lv16〜）
  { name: 'ウィッチ',     emoji: '🧙‍♀️', baseHp: 240,  reward: { gold: 24,  xp: 35  }, size: 40, sprite: 'goblin'   },
  { name: 'トロール',     emoji: '🧌', baseHp: 310,  reward: { gold: 30,  xp: 44  }, size: 42, sprite: 'orc'      },
  { name: 'オーク',       emoji: '👹', baseHp: 380,  reward: { gold: 36,  xp: 52  }, size: 42, sprite: 'orc'      },
  { name: 'スケルトン',   emoji: '💀', baseHp: 440,  reward: { gold: 42,  xp: 62  }, size: 40, sprite: 'skeleton' },
  { name: 'ワイバーン',   emoji: '🦕', baseHp: 520,  reward: { gold: 52,  xp: 78  }, size: 44, sprite: 'dragon'   },
  { name: 'デーモン',     emoji: '😈', baseHp: 620,  reward: { gold: 62,  xp: 92  }, size: 44, sprite: 'dragon'   },

  // Tier 4 - 強敵（Lv24〜）
  { name: 'アイアンゴーレム', emoji: '🤖', baseHp: 800,  reward: { gold: 85,  xp: 125 }, size: 48, sprite: 'orc'      },
  { name: 'フェニックス',     emoji: '🔥', baseHp: 950,  reward: { gold: 100, xp: 150 }, size: 48, sprite: 'dragon'   },
  { name: 'ドラゴン',         emoji: '🐉', baseHp: 1100, reward: { gold: 125, xp: 185 }, size: 52, sprite: 'dragon'   },
  { name: 'ケルベロス',       emoji: '🐕', baseHp: 1300, reward: { gold: 155, xp: 228 }, size: 50, sprite: 'orc'      },
  { name: 'タイタン',         emoji: '🗿', baseHp: 1500, reward: { gold: 180, xp: 265 }, size: 52, sprite: 'orc'      },

  // Tier 5 - 最上級（Lv32〜）
  { name: 'クラーケン',     emoji: '🐙', baseHp: 1800, reward: { gold: 215, xp: 320 }, size: 54, sprite: 'dragon'   },
  { name: 'ヒドラ',         emoji: '🐍', baseHp: 2200, reward: { gold: 265, xp: 390 }, size: 56, sprite: 'dragon'   },
  { name: 'アビスロード',   emoji: '👁️', baseHp: 2700, reward: { gold: 320, xp: 480 }, size: 56, sprite: 'dragon'   },
  { name: 'デミゴッド',     emoji: '⚡', baseHp: 3300, reward: { gold: 390, xp: 580 }, size: 58, sprite: 'skeleton' },
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
