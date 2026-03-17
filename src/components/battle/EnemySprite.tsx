// ============================================================
//  components/battle/EnemySprite.tsx
//  敵キャラ1体の表示（HPバー付き）
//  ボス敵は王冠マーク＆大きく表示
// ============================================================

import React from 'react';
import { View, Text } from 'react-native';
import { GAME_CONFIG } from '../../constants/gameConfig';
import type { Enemy } from '../../types/gameTypes';
import { clampRatio } from '../../utils/format';

// ─────────────────────────────────────────
//  Props
// ─────────────────────────────────────────

type Props = {
  enemy: Enemy;
};

// ─────────────────────────────────────────
//  コンポーネント
// ─────────────────────────────────────────

export const EnemySprite: React.FC<Props> = React.memo(({ enemy }) => {
  const hpRatio = clampRatio(enemy.hp, enemy.maxHp);
  const sizeMultiplier = enemy.isBoss ? GAME_CONFIG.BOSS_SIZE_MULTIPLIER : 1;
  const fontSize = enemy.def.size * sizeMultiplier;
  const hpBarColor = enemy.isBoss ? '#ff6600' : '#e74c3c';

  return (
    <View
      className="absolute bottom-[45%] items-center z-[9]"
      style={{ left: `${enemy.x}%` }}
    >
      {/* ボスマーク */}
      {enemy.isBoss && (
        <Text className="absolute -top-6 text-xl">👑</Text>
      )}

      {/* HPバー */}
      <View
        className="h-1 bg-[#333] rounded-sm overflow-hidden mb-0.5"
        style={{ width: enemy.isBoss ? 60 : 40 }}
      >
        <View
          className="h-full rounded-sm"
          style={{
            width: `${hpRatio * 100}%`,
            backgroundColor: hpBarColor,
          }}
        />
      </View>

      {/* 絵文字スプライト */}
      <View
        style={{
          transform: enemy.isBoss ? [{ scale: 1.1 }] : [],
        }}
      >
        <Text style={{ fontSize, lineHeight: 52 }}>
          {enemy.def.emoji}
        </Text>
      </View>
    </View>
  );
}, (prev, next) => {
  return (
    prev.enemy.id === next.enemy.id &&
    prev.enemy.hp === next.enemy.hp &&
    prev.enemy.x === next.enemy.x &&
    prev.enemy.isBoss === next.enemy.isBoss
  );
});
