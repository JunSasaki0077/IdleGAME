// ============================================================
//  components/battle/EnemySprite.tsx
//  敵キャラ1体の表示（HPバー付き）
//  sprite が設定されている場合は PNG アニメーション、なければ絵文字
// ============================================================

import React from 'react';
import { View, Text, Image } from 'react-native';
import { GAME_CONFIG } from '../../constants/gameConfig';
import type { Enemy } from '../../types/gameTypes';
import { clampRatio } from '../../utils/format';
import { useFrameAnimation } from '../../hooks/useFrameAnimation';

// ─────────────────────────────────────────
//  スプライト画像マップ（require は静的パスが必要なので全列挙）
// ─────────────────────────────────────────

const ENEMY_FRAMES: Record<string, ReturnType<typeof require>[]> = {
  slime: [
    require('../../../assets/sprites/enemies/slime_1.png'),
    require('../../../assets/sprites/enemies/slime_2.png'),
    require('../../../assets/sprites/enemies/slime_3.png'),
    require('../../../assets/sprites/enemies/slime_4.png'),
  ],
  kobold: [
    require('../../../assets/sprites/enemies/kobold_1.png'),
    require('../../../assets/sprites/enemies/kobold_2.png'),
    require('../../../assets/sprites/enemies/kobold_3.png'),
    require('../../../assets/sprites/enemies/kobold_4.png'),
  ],
  goblin: [
    require('../../../assets/sprites/enemies/goblin_1.png'),
    require('../../../assets/sprites/enemies/goblin_2.png'),
    require('../../../assets/sprites/enemies/goblin_3.png'),
    require('../../../assets/sprites/enemies/goblin_4.png'),
  ],
  orc: [
    require('../../../assets/sprites/enemies/orc_1.png'),
    require('../../../assets/sprites/enemies/orc_2.png'),
    require('../../../assets/sprites/enemies/orc_3.png'),
    require('../../../assets/sprites/enemies/orc_4.png'),
  ],
  skeleton: [
    require('../../../assets/sprites/enemies/skeleton_1.png'),
    require('../../../assets/sprites/enemies/skeleton_2.png'),
    require('../../../assets/sprites/enemies/skeleton_3.png'),
    require('../../../assets/sprites/enemies/skeleton_4.png'),
  ],
  dragon: [
    require('../../../assets/sprites/enemies/dragon_1.png'),
    require('../../../assets/sprites/enemies/dragon_2.png'),
    require('../../../assets/sprites/enemies/dragon_3.png'),
    require('../../../assets/sprites/enemies/dragon_4.png'),
  ],
};

const ANIM_SPEED = 180; // ms/フレーム

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
  const frames = enemy.def.sprite ? ENEMY_FRAMES[enemy.def.sprite] : null;
  const frameIndex = useFrameAnimation(frames ? frames.length : null, ANIM_SPEED);

  const hpRatio = clampRatio(enemy.hp, enemy.maxHp);
  const sizeMultiplier = enemy.isBoss ? GAME_CONFIG.BOSS_SIZE_MULTIPLIER : 1;
  const spriteSize = (enemy.isBoss ? 160 : 120) * sizeMultiplier;
  const hpBarColor = enemy.isBoss ? '#ff6600' : '#e74c3c';

  return (
    <View
      className="absolute bottom-[10%] items-center z-[9]"
      style={{ left: `${enemy.x}%`, transform: [{ translateX: -spriteSize / 2 }] }}
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

      {/* スプライト or 絵文字 */}
      {frames ? (
        <Image
          source={frames[frameIndex]}
          style={{ width: spriteSize, height: spriteSize }}
          resizeMode="contain"
        />
      ) : (
        <Text style={{ fontSize: enemy.def.size * sizeMultiplier, lineHeight: 52 }}>
          {enemy.def.emoji}
        </Text>
      )}
    </View>
  );
}, (prev, next) => {
  return (
    prev.enemy.id     === next.enemy.id     &&
    prev.enemy.hp     === next.enemy.hp     &&
    prev.enemy.x      === next.enemy.x      &&
    prev.enemy.isBoss === next.enemy.isBoss &&
    prev.enemy.def.sprite === next.enemy.def.sprite &&
    prev.enemy.def.size   === next.enemy.def.size
  );
});
